import "server-only"; // build error if a browser component ever imports this file

import { connection } from "next/server";

import { movies as mockMovies, type Movie } from "@/data/movies";
import {
  applyUserMovieChange,
  mockUserMovies,
  type LibraryEntry,
  type UserMovieChange,
  type UserMovies,
} from "@/data/userMovies";

// The mock user's library: every movie they marked, and what they did with it.
// A MOCK until there's a database table for it: it lives in the server's memory, so
// every page sees the same lists, and it starts over when the server restarts.

// Starts with the mock lists the profile always had (the movies in mockData.json)
function seedLibrary() {
  const library = new Map<number, LibraryEntry>();
  for (const movie of mockMovies) {
    const userMovie = mockUserMovies[movie.id];
    if (userMovie) library.set(movie.id, { movie, userMovie });
  }
  return library;
}

// Kept on globalThis, like the database connection (src/server/db/index.ts): in
// development Next.js reloads files when I save, and a plain variable would be
// emptied on every reload. globalThis survives reloads, but not a server restart.
const globalForLibrary = globalThis as unknown as {
  userLibrary?: Map<number, LibraryEntry>;
};
const library = (globalForLibrary.userLibrary ??= seedLibrary());

// Every movie in the library with its marks, for the profile
export async function getLibrary(): Promise<LibraryEntry[]> {
  // The lists change while the app runs, so read them on every visit (never at build)
  await connection();
  return [...library.values()];
}

// Only the marks, by movie id, for the pages that already have their movies
export async function getUserMovies(): Promise<UserMovies> {
  const entries = await getLibrary();
  return Object.fromEntries(
    entries.map(({ movie, userMovie }) => [movie.id, userMovie]),
  );
}

// Applies one change with the same "never both" rule the cards use
export function updateLibrary(movie: Movie, change: UserMovieChange) {
  const userMovie = applyUserMovieChange(
    library.get(movie.id)?.userMovie,
    change,
  );
  library.set(movie.id, { movie, userMovie });
}
