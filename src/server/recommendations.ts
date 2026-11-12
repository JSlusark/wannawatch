import "server-only"; // build error if a browser component ever imports this file

import { eq } from "drizzle-orm";

import type { Movie, SimilarMovies } from "@/data/movies";
import { db } from "@/server/db";
import { movies } from "@/server/db/schema";
import { findSimilarMovies } from "@/server/embeddings/similarMovies";

// How many recommendations the movie page shows
const SIMILAR_COUNT = 10;

// One similar movie as it comes from findSimilarMovies → the app's Movie, so it can be
// shown with the same MovieCard as every other movie. The scores aren't in the database
// yet (imdb_rating is empty), so they show as "-" like on the catalogue.
function toMovie(
  row: Awaited<ReturnType<typeof findSimilarMovies>>[number],
): Movie {
  return {
    id: row.traktId,
    title: row.title,
    year: row.year,
    runtime: row.runtime ?? undefined,
    genre: row.genres,
    plot: row.plot ?? "",
    image: row.posterUrl,
    imdbScore: row.imdbRating,
    rottenTomatoesScore: row.rottenTomatoesScore,
  };
}

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
    return { status: "ok", movies: similar.map(toMovie) };
  } catch (error) {
    // The movie page still works without recommendations: log it and say so
    console.error("Similar movies failed:", error);
    return { status: "unavailable" };
  }
}
