import "server-only"; // build error if a browser component ever imports this file

import { and, gt, inArray, sql } from "drizzle-orm";

import type { Movie } from "@/data/movies";
import { db } from "@/server/db";
import { toRow } from "@/server/db/movieRows";
import { movies } from "@/server/db/schema";

import { normalizeScores } from "./movieApi/normalizeMovie";
import { requestMovieApi } from "./movieApi/request";
import { apiRatingsSchema } from "./movieApi/schemas";

type Scores = Pick<Movie, "imdbScore" | "rottenTomatoesScore">;

// Scores change slowly: saved ones are used for a week, then asked for again
const SCORES_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

// One movie's IMDb and Rotten Tomatoes scores, from the movie API's ratings request
async function requestScores(movieId: number): Promise<Scores> {
  const { data } = await requestMovieApi(`/movies/${movieId}/ratings`, {
    extended: "all", // with "all", the answer also has IMDb and Rotten Tomatoes
  });
  return normalizeScores(apiRatingsSchema.parse(data));
}

// The same movies, with their IMDb and Rotten Tomatoes scores filled in.
// The database is the memory (step 4 of the API plan): the movies table already has
// imdb_rating, rotten_tomatoes_score and scores_updated_at, so
// 1. scores saved in the last week come from the database (no API call)
// 2. the others are asked from the movie API, all at the same time
// 3. and saved, so the next visit finds them in step 1
// If the database or the API fails, the movies are still shown, just without scores.
export async function withScores(list: Movie[]): Promise<Movie[]> {
  if (list.length === 0) return list;
  const ids = list.map((movie) => movie.id);
  const scores = new Map<number, Scores>();

  // 1. Saved and recent enough
  try {
    const saved = await db
      .select({
        traktId: movies.traktId,
        imdbScore: movies.imdbRating,
        rottenTomatoesScore: movies.rottenTomatoesScore,
      })
      .from(movies)
      .where(
        and(
          inArray(movies.traktId, ids),
          gt(movies.scoresUpdatedAt, new Date(Date.now() - SCORES_MAX_AGE_MS)),
        ),
      );
    for (const { traktId, ...movieScores } of saved) {
      scores.set(traktId, movieScores);
    }
  } catch (error) {
    console.error("Reading saved scores failed:", error);
  }

  // 2. Missing → ask the API. One failing movie doesn't stop the others
  //    (allSettled waits for all of them, whatever happens to each)
  const missing = list.filter((movie) => !scores.has(movie.id));
  const answers = await Promise.allSettled(
    missing.map((movie) => requestScores(movie.id)),
  );
  const fetched = missing.flatMap((movie, i) => {
    const answer = answers[i];
    if (answer?.status !== "fulfilled") return [];
    scores.set(movie.id, answer.value);
    return [{ movie, scores: answer.value }];
  });

  // 3. Save them. A movie that isn't in the table yet (e.g. a new popular one) is
  //    added; one that is gets its scores updated ("upsert")
  if (fetched.length > 0) {
    try {
      await db
        .insert(movies)
        .values(
          fetched.map(({ movie, scores }) => ({
            ...toRow(movie),
            imdbRating: scores.imdbScore,
            rottenTomatoesScore: scores.rottenTomatoesScore,
            scoresUpdatedAt: new Date(),
          })),
        )
        .onConflictDoUpdate({
          target: movies.traktId,
          // excluded = the row we tried to insert: keep its scores, not the old ones
          set: {
            imdbRating: sql`excluded.imdb_rating`,
            rottenTomatoesScore: sql`excluded.rotten_tomatoes_score`,
            scoresUpdatedAt: sql`excluded.scores_updated_at`,
          },
        });
    } catch (error) {
      console.error("Saving scores failed:", error);
    }
  }

  return list.map((movie) => ({ ...movie, ...scores.get(movie.id) }));
}
