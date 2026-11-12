// The app's Movie ↔ a row of the movies table. The names differ a little
// (genre ↔ genres, image ↔ posterUrl, id ↔ traktId), so the translation lives here,
// once, for the app and the scripts.

import type { Movie } from "@/data/movies";

import type { MovieRow, NewMovieRow } from "./schema";

// The columns a card needs. Any query that selects at least these can use toMovie
type MovieCardRow = Pick<
  MovieRow,
  | "traktId"
  | "title"
  | "year"
  | "runtime"
  | "genres"
  | "plot"
  | "posterUrl"
  | "imdbRating"
  | "rottenTomatoesScore"
>;

// A row → the app's Movie. The id is the movie API's id (traktId), like every Movie
export function toMovie(row: MovieCardRow): Movie {
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

// The app's Movie → a new row (the database makes the id itself)
export function toRow(movie: Movie): NewMovieRow {
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
