import "server-only"; // build error if a browser component ever imports this file

import { eq } from "drizzle-orm";

import type { SimilarMovies } from "@/data/movies";
import { db } from "@/server/db";
import { toMovie } from "@/server/db/movieRows";
import { movies } from "@/server/db/schema";
import { findSimilarMovies } from "@/server/embeddings/similarMovies";
import { withScores } from "@/server/scores";

// How many recommendations the movie page shows
const SIMILAR_COUNT = 10;

// The movies most like the one with this movie API id. The vector search is the
// existing findSimilarMovies (src/server/embeddings/similarMovies.ts): this only finds
// the movie's own vector first and turns the results into Movies.
export async function getSimilarMovies(
  movieId: number,
): Promise<SimilarMovies> {
  try {
    const [movie] = await db
      .select({
        id: movies.id,
        embedding: movies.embedding,
        genres: movies.genres,
      })
      .from(movies)
      .where(eq(movies.traktId, movieId))
      .limit(1);
    if (!movie?.embedding) return { status: "not-in-database" };

    const similar = await findSimilarMovies(
      db,
      { id: movie.id, embedding: movie.embedding, genres: movie.genres },
      { limit: SIMILAR_COUNT },
    );
    // The database may not have their scores yet: withScores asks for the missing ones
    return { status: "ok", movies: await withScores(similar.map(toMovie)) };
  } catch (error) {
    // The movie page still works without recommendations: log it and say so
    console.error("Similar movies failed:", error);
    return { status: "unavailable" };
  }
}
