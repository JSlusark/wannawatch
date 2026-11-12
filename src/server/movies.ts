import "server-only"; // build error if a browser component ever imports this file

import { connection } from "next/server";
import { cache } from "react";

import type { Movie, MoviePage } from "@/data/movies";

import { normalizeMovie } from "./movieApi/normalizeMovie";
import { toPositiveInteger } from "@/lib/urlParams";

import { MovieApiError, requestMovieApi } from "./movieApi/request";
import { apiMovieSchema, apiMoviesSchema } from "./movieApi/schemas";

// How many movies one page shows
const PAGE_SIZE = 20;

// Layer 4: what pages call. Ask the movie API for one page of popular movies → check
// the shape → translate each movie → the movies, plus how many pages there are.
export async function getPopularMovies(page = 1): Promise<MoviePage> {
  // Wait for a real visitor: `next build` stops here instead of calling the API while
  // building the site, so a page that uses the API is made fresh on every visit
  await connection();

  const { data, headers } = await requestMovieApi("/movies/popular", {
    extended: "full", // full info: plot, runtime, genres, images
    page: String(page),
    limit: String(PAGE_SIZE),
  });

  return {
    movies: apiMoviesSchema.parse(data).map(normalizeMovie),
    page,
    // The API puts the number of pages in a header. If it's missing (or 0, which the
    // API sends for a page past the end), count 1, so "Next" never leads nowhere
    totalPages: Number(headers.get("X-Pagination-Page-Count")) || 1,
  };
}

// One movie by its id (the movie API's id, the same one the cards use), with full info.
// null = the API doesn't know this id, so the page can show "not found".
// cache(): the page and its tab title both ask for the movie, but within one visit the
// API is only called once (React remembers the answer until the visit is over).
export const getMovie = cache(async (id: number): Promise<Movie | null> => {
  await connection();
  try {
    const { data } = await requestMovieApi(`/movies/${id}`, {
      extended: "full",
    });
    return normalizeMovie(apiMovieSchema.parse(data));
  } catch (error) {
    if (error instanceof MovieApiError && error.status === 404) return null;
    throw error; // anything else is a real problem: show the error page
  }
});

// Turns ?page=… from the URL into a safe page number. Anyone can type anything in a
// URL, so "abc", "0", "-3", "2.5" or ?page=1&page=2 all become page 1.
export function toPageNumber(value: string | string[] | undefined): number {
  return toPositiveInteger(value) ?? 1;
}
