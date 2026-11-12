// The static versions of the server's movie questions: the same answers the database
// and the movie API give, read from the file instead (staticMovies.ts).
// Each live function (movies.ts, dailyPicks.ts, recommendations.ts, userLibrary.ts)
// starts with `if (USE_STATIC_MOVIES) return …` and one of these.

import type { Movie, MoviePage, SimilarMovies } from "@/data/movies";
import { rankSimilar } from "@/server/embeddings/rankSimilar";

import {
  staticMovies,
  staticMoviesById,
  withoutEmbedding,
} from "./staticMovies";

// The switch for the whole app, read from the environment (.env.local, or Vercel's
// settings): MOVIE_SOURCE=live → the database and the movie API, as before.
// Anything else, or nothing at all → the file. So the deployed site needs no setting,
// and going back is one line in .env.local
export const USE_STATIC_MOVIES = process.env.MOVIE_SOURCE !== "live";

// The same numbers as the live versions
const PAGE_SIZE = 20;
const DAILY_COUNT = 10;
const MIN_RUNTIME_MINUTES = 60;
const SIMILAR_COUNT = 10;
const CANDIDATES = 200;

// Catalogue: one page of the file, which is already in popular order
export function getStaticPopularMovies(page: number): MoviePage {
  const start = (page - 1) * PAGE_SIZE;
  return {
    movies: staticMovies.slice(start, start + PAGE_SIZE).map(withoutEmbedding),
    page,
    totalPages: Math.ceil(staticMovies.length / PAGE_SIZE),
  };
}

// Movie page: one movie by id; null = not in the file, so the page shows "not found"
export function getStaticMovie(id: number): Movie | null {
  const movie = staticMoviesById.get(id);
  return movie ? withoutEmbedding(movie) : null;
}

// Profile: the movies with these ids, in the same order (unknown ids are skipped)
export function getStaticMoviesByIds(ids: number[]): Movie[] {
  return ids.flatMap((id) => {
    const movie = staticMoviesById.get(id);
    return movie ? [withoutEmbedding(movie)] : [];
  });
}

// Daily 10: the same rules as the database query (feature films with a poster and a
// plot, none of the `skip` ids), 10 at random
export function getStaticDailyPicks(skip: number[]): Movie[] {
  const skipped = new Set(skip);
  const pool = staticMovies.filter(
    (movie) =>
      movie.image &&
      movie.plot &&
      (movie.runtime ?? 0) >= MIN_RUNTIME_MINUTES &&
      !skipped.has(movie.id),
  );
  // Shuffle a copy (Fisher–Yates: swap each place with a random earlier one), then
  // take the first 10. The database did the same with ORDER BY random()
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j]!, pool[i]!];
  }
  return pool.slice(0, DAILY_COUNT).map(withoutEmbedding);
}

// How close two plots are, from -1 to 1 (1 = same meaning): the cosine similarity the
// database's pgvector worked out before, here in plain math
export function cosineSimilarity(a: number[], b: number[]): number {
  let dot = 0;
  let lengthA = 0;
  let lengthB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i]! * b[i]!;
    lengthA += a[i]! * a[i]!;
    lengthB += b[i]! * b[i]!;
  }
  return dot / Math.sqrt(lengthA * lengthB);
}

// "More like this": the same two steps as findSimilarMovies (similarMovies.ts):
// 1. the CANDIDATES movies with the closest plots, 2. re-ranked with genre overlap
export function getStaticSimilarMovies(movieId: number): SimilarMovies {
  const movie = staticMoviesById.get(movieId);
  if (!movie) return { status: "not-in-database" };

  // Only what rankSimilar needs: the id to find the movie again, its genres, its score
  const candidates = staticMovies
    .filter((other) => other.id !== movie.id)
    .map((other) => ({
      id: other.id,
      genres: other.genre,
      plotSimilarity: cosineSimilarity(movie.embedding, other.embedding),
    }))
    .sort((a, b) => b.plotSimilarity - a.plotSimilarity)
    .slice(0, CANDIDATES);

  const ranked = rankSimilar(movie.genre, candidates);
  return {
    status: "ok",
    movies: ranked.slice(0, SIMILAR_COUNT).map((c) => getStaticMovie(c.id)!),
  };
}
