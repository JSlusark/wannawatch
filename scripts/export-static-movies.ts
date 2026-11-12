// Export script: writes the movies the deployed site uses into one file in the code
// (src/data/staticMovies.json), so the site works without a database or the movie API.
// Run it with `npm run export:static` (Docker running, MOVIE_API_KEY in .env.local).
// Run it again whenever you want a fresh list: it overwrites the file.
//
// Steps, all through the database you already have:
// 1. Ask the movie API for today's most popular movies (the catalogue's order)
// 2. Add the ones the database doesn't have yet
// 3. Give them a plot vector if they have none (the same model as db:embed)
// 4. Ask the movie API for their scores if the database has none
// 5. Write them, in popular order, plus the movies on the mock lists, to the file

import { writeFile } from "node:fs/promises";

import { eq, inArray } from "drizzle-orm";

import { mockUserMovies } from "@/data/userMovies";
import { toMovie, toRow } from "@/server/db/movieRows";
import { movies } from "@/server/db/schema";
import { EMBEDDING_MODEL, embedTexts } from "@/server/embeddings/model";
import { movieEmbeddingText } from "@/server/embeddings/movieText";
import {
  normalizeMovie,
  normalizeScores,
} from "@/server/movieApi/normalizeMovie";
import { requestMovieApi } from "@/server/movieApi/request";
import { apiMoviesSchema, apiRatingsSchema } from "@/server/movieApi/schemas";
import type { StaticMovie } from "@/server/static/staticMovies";

import { connectDb } from "./db";

const OUTPUT = "src/data/staticMovies.json";
const PER_PAGE = 100;
const PAUSE_MS = 400; // between API requests: ~150 a minute, far below the limit
// Vectors are rounded to 4 decimals: the file is about half the size, and the
// similarity between two movies only changes in the 4th decimal
const DECIMALS = 4;

const pause = () => new Promise((resolve) => setTimeout(resolve, PAUSE_MS));

async function main() {
  const { db, close } = connectDb();

  try {
    // 1. The whole popular list, in its order. It's about 500 movies (the API stops
    //    there), so keep going until the header says there are no more pages
    const popular = [];
    for (let page = 1; ; page++) {
      const { data, headers } = await requestMovieApi("/movies/popular", {
        extended: "full",
        page: String(page),
        limit: String(PER_PAGE),
      });
      popular.push(...apiMoviesSchema.parse(data).map(normalizeMovie));
      const pages = Number(headers.get("X-Pagination-Page-Count")) || 1;
      console.log(`Popular page ${page}/${pages}`);
      if (page >= pages) break;
      await pause();
    }

    // 2. Save the new ones (movies already in the table are skipped)
    await db
      .insert(movies)
      .values(popular.map(toRow))
      .onConflictDoNothing({ target: movies.traktId });

    // The popular movies first, then the mock lists' movies that aren't popular now.
    // A Set drops the ids that are in both
    const ids = [
      ...new Set([
        ...popular.map((movie) => movie.id),
        ...Object.keys(mockUserMovies).map(Number),
      ]),
    ];

    // 3. Vectors for the ones that have none
    const noVector = await db
      .select({
        id: movies.id,
        title: movies.title,
        genres: movies.genres,
        plot: movies.plot,
        embedding: movies.embedding,
      })
      .from(movies)
      .where(inArray(movies.traktId, ids))
      .then((rows) => rows.filter((row) => !row.embedding));
    console.log(`${noVector.length} movies to embed`);
    if (noVector.length > 0) {
      const vectors = await embedTexts(noVector.map(movieEmbeddingText));
      for (const [i, movie] of noVector.entries()) {
        await db
          .update(movies)
          .set({ embedding: vectors[i], embeddingModel: EMBEDDING_MODEL })
          .where(eq(movies.id, movie.id));
      }
    }

    // 4. Scores for the ones that have none
    const noScores = await db
      .select({
        traktId: movies.traktId,
        scoresUpdatedAt: movies.scoresUpdatedAt,
      })
      .from(movies)
      .where(inArray(movies.traktId, ids))
      .then((rows) => rows.filter((row) => !row.scoresUpdatedAt));
    console.log(`${noScores.length} movies to get scores for`);
    for (const [i, { traktId }] of noScores.entries()) {
      try {
        const { data } = await requestMovieApi(`/movies/${traktId}/ratings`, {
          extended: "all",
        });
        const scores = normalizeScores(apiRatingsSchema.parse(data));
        await db
          .update(movies)
          .set({
            imdbRating: scores.imdbScore,
            rottenTomatoesScore: scores.rottenTomatoesScore,
            scoresUpdatedAt: new Date(),
          })
          .where(eq(movies.traktId, traktId));
      } catch (error) {
        // One failing movie keeps going: it's exported without scores
        console.error(`Scores for ${traktId} failed:`, error);
      }
      if ((i + 1) % 50 === 0) console.log(`${i + 1}/${noScores.length} scores`);
      await pause();
    }

    // 5. Read them back and write the file, in the order of `ids`
    const rows = await db
      .select()
      .from(movies)
      .where(inArray(movies.traktId, ids));
    const byId = new Map(rows.map((row) => [row.traktId, row]));
    const exported: StaticMovie[] = ids.flatMap((id) => {
      const row = byId.get(id);
      if (!row?.embedding) return []; // can't happen after step 3, but stay safe
      return [
        {
          ...toMovie(row),
          embedding: row.embedding.map((n) => Number(n.toFixed(DECIMALS))),
        },
      ];
    });

    await writeFile(OUTPUT, JSON.stringify(exported));
    console.log(`Done: ${exported.length} movies written to ${OUTPUT}`);
  } finally {
    await close();
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
