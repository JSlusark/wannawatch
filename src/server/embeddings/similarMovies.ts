import { and, cosineDistance, desc, isNotNull, ne, sql } from "drizzle-orm";
import type { PostgresJsDatabase } from "drizzle-orm/postgres-js";

import * as schema from "@/server/db/schema";

import { rankSimilar } from "./rankSimilar";

const { movies } = schema;

type Db = PostgresJsDatabase<typeof schema>;

// How many closest plots step 1 fetches before step 2 re-ranks them. Big enough that
// good genre matches are in the group, small enough to re-rank instantly.
const CANDIDATES = 200;

// The movies most similar to the given movie, best first. Two steps:
// 1. Vector search (pgvector, inside the database): the CANDIDATES movies whose plot
//    vectors are closest. Cosine distance compares the direction of two vectors
//    (0 = same direction); similarity = 1 - distance, so 1 = same meaning.
// 2. Re-rank (rankSimilar.ts, plain math): mix plot similarity with genre overlap,
//    using the weights I chose.
// No AI here: the model already turned every plot into numbers (the embed script).
// The database connection is passed in, so the app and the scripts can both use it.
export async function findSimilarMovies(
  db: Db,
  movie: { id?: number; embedding: number[]; genres: string[] },
  options: { limit?: number } = {},
) {
  const plotSimilarity = sql<number>`1 - (${cosineDistance(movies.embedding, movie.embedding)})`;

  const candidates = await db
    .select({
      id: movies.id,
      title: movies.title,
      year: movies.year,
      genres: movies.genres,
      plot: movies.plot,
      plotSimilarity,
    })
    .from(movies)
    .where(
      and(
        isNotNull(movies.embedding), // movies not embedded yet can't be compared
        movie.id ? ne(movies.id, movie.id) : undefined, // not itself
      ),
    )
    .orderBy(desc(plotSimilarity))
    .limit(CANDIDATES);

  return rankSimilar(movie.genres, candidates).slice(0, options.limit ?? 10);
}
