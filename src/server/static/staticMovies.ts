// The movies the site uses while MOVIE_SOURCE isn't "live": one file in the code
// (src/data/staticMovies.json, made by `npm run export:static`), so the deployed site
// needs no database and no movie API. Everything for this mode lives in this folder.

import type { Movie } from "@/data/movies";

import staticMovieData from "@/data/staticMovies.json";

// A movie as the file stores it: the Movie the cards use, plus its plot vector
// (384 numbers) so "More like this" can compare plots without the database
export type StaticMovie = Movie & { embedding: number[] };

// The file's order is the movie API's popular order, so the catalogue keeps it.
// JSON numbers are read as plain `number`, so this is where we tell TypeScript the
// file matches the StaticMovie type
export const staticMovies = staticMovieData as StaticMovie[];

// The same movies by id, to find one quickly (the movie page, the profile)
export const staticMoviesById = new Map(
  staticMovies.map((movie) => [movie.id, movie]),
);

// A StaticMovie without its vector: what pages get, so the 384 numbers never reach
// the browser
export function withoutEmbedding(movie: StaticMovie): Movie {
  const { embedding, ...rest } = movie;
  void embedding; // taken out on purpose
  return rest;
}
