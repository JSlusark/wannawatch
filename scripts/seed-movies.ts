// Seed script: fills the movies table with every movie in the movie API's "most watched
// of all time" list, page by page until the list ends (about 29,000 movies).
// Run it with `npm run db:seed`. Safe to run again: movies already saved are skipped.

import { toRow } from "@/server/db/movieRows";
import { movies } from "@/server/db/schema";
import { normalizeMovie } from "@/server/movieApi/normalizeMovie";
import { requestMovieApi } from "@/server/movieApi/request";
import { apiWatchedMoviesSchema } from "@/server/movieApi/schemas";

import { connectDb } from "./db";

const PER_PAGE = 100; // movies per request
const PAUSE_MS = 1000; // wait between requests, to stay far below the API's limit

// One page of the most watched movies of all time
async function fetchMostWatchedPage(page: number) {
  const { data, headers } = await requestMovieApi("/movies/watched/all", {
    extended: "full", // full info: plot, runtime, genres, images
    page: String(page),
    limit: String(PER_PAGE),
  });

  return {
    // This list wraps each movie: { watcher_count, …, movie: { … } }
    movies: apiWatchedMoviesSchema
      .parse(data)
      .map((item) => normalizeMovie(item.movie)),
    // The API puts the number of pages in a header (0 or missing → count 1)
    totalPages: Number(headers.get("X-Pagination-Page-Count")) || 1,
  };
}

async function main() {
  const { db, close } = connectDb();
  let saved = 0;

  try {
    // No fixed number of pages: keep going until the list says it has no more
    for (let page = 1; ; page++) {
      const result = await fetchMostWatchedPage(page);
      const pages = result.totalPages;

      // Save the page in one go. A movie whose trakt_id is already in the table is
      // skipped instead of causing an error. `returning` gives back only the new rows.
      const inserted = await db
        .insert(movies)
        .values(result.movies.map(toRow))
        .onConflictDoNothing({ target: movies.traktId })
        .returning({ id: movies.id });

      saved += inserted.length;
      console.log(`Page ${page}/${pages}: ${inserted.length} new movies saved`);

      if (page >= pages) break; // the list has no more pages
      await new Promise((resolve) => setTimeout(resolve, PAUSE_MS));
    }
    console.log(`Done: ${saved} new movies saved.`);
  } finally {
    await close(); // always close the connection, even after an error
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1; // tells npm the script failed
});
