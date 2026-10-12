import "server-only";

import type { Movie } from "@/data/movies";

import { normalizeMovie } from "./movieApi/normalizeMovie";
import { requestMovieApi } from "./movieApi/request";
import { apiMoviesSchema } from "./movieApi/schemas";

// Layer 4: what pages call. Ask the movie API for one page of popular movies → check
// the shape → translate each movie → the Movie[].
export async function getPopularMovies(page = 1): Promise<Movie[]> {
  const raw = await requestMovieApi("/movies/popular", {
    extended: "full", // full info: plot, runtime, genres, images
    page: String(page),
    limit: "20", // 20 movies per page
  });
  return apiMoviesSchema.parse(raw).map(normalizeMovie);
}
