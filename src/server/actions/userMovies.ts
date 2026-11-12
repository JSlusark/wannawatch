"use server";

// Server Actions: functions the browser can call, that run on the server.
// The cards call this when you mark a movie, so the change reaches the shared library.

import type { Movie } from "@/data/movies";
import type { UserMovieChange } from "@/data/userMovies";
import { updateLibrary } from "@/server/userLibrary";

// Mock only: the browser sends the whole movie and the server trusts it. A real version
// would check who's logged in and look the movie up by id instead.
export async function saveUserMovie(movie: Movie, change: UserMovieChange) {
  updateLibrary(movie, change);
}
