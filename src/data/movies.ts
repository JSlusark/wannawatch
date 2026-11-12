import mockMovieData from "./mockData.json";

// The only scores a watched movie can have: from "Loved it" (2) to "Hated it" (-2)
export type WatchScore = 2 | 1 | 0 | -1 | -2;

// Facts about a movie: the same for every user. What a user did with it (watched,
// score, WannaWatch) is kept apart, in UserMovie (see userMovies.ts).
export type Movie = {
  id: number; // the movie API's id for the movie. Unique, unlike the title
  title: string;
  imdbScore: number | null; // null = no score (yet)
  rottenTomatoesScore: number | null;
  genre: string[]; // can be more than 1
  plot: string;
  image: string | null; // poster address; null = no poster
  year: number | null;
  runtime?: number;
  director?: string;
  cast?: string[];
};

// One page of a long list of movies, plus where it sits in the list
export type MoviePage = {
  movies: Movie[];
  page: number; // this page, starting at 1
  totalPages: number;
};

// The movies most like one movie, for its page. Three possible answers:
// - "ok": the movies, best first (vector search on the plot + genre overlap)
// - "not-in-database": the movie isn't in the local database (or has no vector yet),
//   so there's nothing to compare it with
// - "unavailable": the database didn't answer (e.g. Docker isn't running)
export type SimilarMovies =
  | { status: "ok"; movies: Movie[] }
  | { status: "not-in-database" }
  | { status: "unavailable" };

// JSON numbers are always read as plain `number`, so this is the one place where we
// tell TypeScript the file matches the Movie type
export const movies = mockMovieData as Movie[];
