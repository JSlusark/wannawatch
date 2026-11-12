import "server-only"; // build error if a browser component ever imports this file

import { inArray } from "drizzle-orm";
import { connection } from "next/server";

import type { Movie } from "@/data/movies";
import {
  applyUserMovieChange,
  mockUserMovies,
  type LibraryEntry,
  type UserMovie,
  type UserMovieChange,
  type UserMovies,
} from "@/data/userMovies";
import { db } from "@/server/db";
import { cardColumns, toMovie, toRow } from "@/server/db/movieRows";
import { movies } from "@/server/db/schema";
import { withScores } from "@/server/scores";

// The mock user's library. Only the MARKS are mock: which movies they watched or
// bookmarked, and their score. They live in the server's memory, so every page sees the
// same lists, and they start over when the server restarts (until a UserMovies table
// exists). The MOVIES themselves always come from the movies table in the database.

// Kept on globalThis, like the database connection (src/server/db/index.ts): in
// development Next.js reloads files when I save, and a plain variable would be
// emptied on every reload. globalThis survives reloads, but not a server restart.
// Starts with the mock marks (src/data/userMovies.ts). Their order is by movie id:
// JavaScript always lists number keys of an object from smallest to largest.
const globalForLibrary = globalThis as unknown as {
  userMarks?: Map<number, UserMovie>;
};
const marks = (globalForLibrary.userMarks ??= new Map(
  Object.entries(mockUserMovies).map(([id, mark]) => [Number(id), mark]),
));

// Only the marks, by movie id: for the pages that already have their movies
export async function getUserMovies(): Promise<UserMovies> {
  // The lists change while the app runs, so read them on every visit (never at build)
  await connection();
  return Object.fromEntries(marks);
}

// Every marked movie, read from the database, with its marks: for the profile.
// The starting mock marks first, then new marks in the order you make them (a Map
// keeps the order things were added in).
export async function getLibrary(): Promise<LibraryEntry[]> {
  await connection();
  const ids = [...marks.keys()];
  if (ids.length === 0) return [];

  const rows = await db
    .select(cardColumns)
    .from(movies)
    .where(inArray(movies.traktId, ids));
  // The database returns rows in any order: put them back in the marks' order
  const byId = new Map(rows.map((row) => [row.traktId, toMovie(row)]));
  const found = ids.flatMap((id) => byId.get(id) ?? []);

  return (await withScores(found)).map((movie) => ({
    movie,
    userMovie: marks.get(movie.id)!,
  }));
}

// Applies one change with the same "never both" rule the cards use.
// The movie is also saved in the movies table if it isn't there yet, so the profile can
// always read it from the database (nearly always it already is: every movie the app
// shows passes through withScores, which saves it).
export async function updateLibrary(movie: Movie, change: UserMovieChange) {
  marks.set(movie.id, applyUserMovieChange(marks.get(movie.id), change));
  await db
    .insert(movies)
    .values(toRow(movie))
    .onConflictDoNothing({ target: movies.traktId });
}
