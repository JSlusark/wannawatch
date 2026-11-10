// Seed script: fills the movies table with the most watched movies of all time.
// Run it with `npm run db:seed`. Safe to run again: movies already saved are skipped.

import type { Movie } from "@/data/movies";
import { movies, type NewMovieRow } from "@/server/db/schema";
import { normalizeMovie } from "@/server/movieApi/normalizeMovie";
import { requestMovieApi } from "@/server/movieApi/request";
import { apiWatchedMoviesSchema } from "@/server/movieApi/schemas";

import { connectDb } from "./db";

const TARGET = 2000; // how many movies to fetch
const PER_PAGE = 100; // movies per request
const PAUSE_MS = 1000; // wait between requests, to stay far below the API's limit

// One page of the most watched movies of all time: well-known movies from every era.
// (Not "popular" like the catalogue: that list stops at about 480 movies.)
async function fetchMostWatchedMovies(page: number) {
  const { data, headers } = await requestMovieApi("/movies/watched/all", {
    extended: "full", // full info: plot, runtime, genres, images
    page: String(page),
    limit: String(PER_PAGE),
  });

  return {
    movies: apiWatchedMoviesSchema
      .parse(data)
      .map((item) => normalizeMovie(item.movie)),
    totalPages: Number(headers.get("X-Pagination-Page-Count")) || 1,
  };
}

// The app's Movie → a row for the movies table (the names differ a little)
function toRow(movie: Movie): NewMovieRow {
  return {
    traktId: movie.id,
    title: movie.title,
    year: movie.year,
    runtime: movie.runtime ?? null,
    plot: movie.plot || null, // "" (no plot) is saved as empty
    posterUrl: movie.image,
    genres: movie.genre,
  };
}

async function main() {
  const { db, close } = connectDb();
  const pages = Math.ceil(TARGET / PER_PAGE);
  let saved = 0;
  let skipped = 0;

  try {
    for (let page = 1; page <= pages; page++) {
      const result = await fetchMostWatchedMovies(page);

      // Save the page in one go. A movie whose trakt_id is already in the table is
      // skipped instead of causing an error. `returning` gives back only the new rows.
      const inserted = await db
        .insert(movies)
        .values(result.movies.map(toRow))
        .onConflictDoNothing({ target: movies.traktId })
        .returning({ id: movies.id });

      saved += inserted.length;
      skipped += result.movies.length - inserted.length;
      console.log(
        `Page ${page}/${pages}: ${inserted.length} saved, ${result.movies.length - inserted.length} already there`,
      );

      if (page >= result.totalPages) break; // the API has no more pages
      await new Promise((resolve) => setTimeout(resolve, PAUSE_MS));
    }
    console.log(`Done: ${saved} new movies saved, ${skipped} skipped.`);
  } finally {
    await close(); // always close the connection, even after an error
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1; // tells npm the script failed
});
