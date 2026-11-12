import type { Movie, WatchScore } from "./movies";

// What one user did with one movie: the UserMovies link from
// docs/backend-brainstorm/backend-plan.md. A movie is either Watched or on the
// WannaWatch list, never both.
type UserMovie = {
  watched: boolean;
  bookmarked: boolean;
  rating?: WatchScore;
};

// Every movie the user did something with, by movie id
type UserMovies = Record<number, UserMovie>;

// Mock lists of the mock user (no database yet), for the profile and the Daily 10
const mockUserMovies: UserMovies = {
  2: { watched: false, bookmarked: true }, // Paprika
  3: { watched: true, bookmarked: false, rating: 2 }, // The Big Short
  5: { watched: true, bookmarked: false, rating: 1 }, // Home Alone
  6: { watched: true, bookmarked: false, rating: 0 }, // Meet the Parents
  7: { watched: true, bookmarked: false, rating: -1 }, // Gladiator
  8: { watched: false, bookmarked: true }, // Project Hail Mary
  9: { watched: true, bookmarked: false, rating: -2 }, // Sorry to Bother You
};

// One movie in the user's library: the movie itself (so the profile can show its card)
// and what the user did with it
type LibraryEntry = { movie: Movie; userMovie: UserMovie };

// One change the user makes to one movie, e.g. { bookmarked: true }
type UserMovieChange = Partial<UserMovie>;

// Hands a change to whoever keeps the lists (the server's mock library, see
// src/server/userLibrary.ts). The whole movie goes along, not just its id: the profile
// needs the poster and title of a movie it may never have seen before.
type SaveUserMovie = (movie: Movie, change: UserMovieChange) => void;

// The "never both" rule, in one place for the browser and the server: marking a movie
// as watched takes it off WannaWatch, and adding it to WannaWatch makes it not watched.
// `current` missing = the user never did anything with this movie.
function applyUserMovieChange(
  current: UserMovie | undefined,
  change: UserMovieChange,
): UserMovie {
  const next = { watched: false, bookmarked: false, ...current, ...change };
  if (change.watched) next.bookmarked = false;
  else if (change.bookmarked) {
    next.watched = false;
    next.rating = undefined;
  }
  return next;
}

export {
  applyUserMovieChange,
  mockUserMovies,
  type LibraryEntry,
  type SaveUserMovie,
  type UserMovie,
  type UserMovieChange,
  type UserMovies,
};
