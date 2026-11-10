import type { WatchScore } from "./movies";

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

export { mockUserMovies, type UserMovie, type UserMovies };
