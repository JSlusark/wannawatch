import { z } from "zod";

// Layer 2: what a movie from the API looks like (with ?extended=full). Only the fields
// we use: Zod drops every other field. `.nullish()` = the field can be missing or null,
// which the API does for movies it knows little about.
export const apiMovieSchema = z.object({
  title: z.string(),
  year: z.number().nullish(),
  ids: z.object({
    trakt: z.number(), // the API's own id for the movie (the key name is the API's)
  }),
  overview: z.string().nullish(),
  runtime: z.number().nullish(),
  genres: z.array(z.string()).nullish(), // slugs, e.g. "science-fiction"
  images: z
    .object({
      // Addresses without "https://", e.g. "media.trakt.tv/images/…/poster.jpg.webp"
      poster: z.array(z.string()).nullish(),
    })
    .nullish(),
});

// /movies/{id} sends one movie; /movies/popular sends a plain list of them
export const apiMoviesSchema = z.array(apiMovieSchema);

// The TypeScript type, worked out from the schema, so the two can never disagree
export type ApiMovie = z.infer<typeof apiMovieSchema>;

// /movies/watched/… ("most watched") wraps each movie with its counts:
// { watcher_count, play_count, …, movie: { … } }. We only keep the movie.
export const apiWatchedMoviesSchema = z.array(
  z.object({ movie: apiMovieSchema }),
);

// /movies/{id}/ratings?extended=all: the movie's scores on other sites. Only the two we
// show; each can be missing for movies those sites don't know.
export const apiRatingsSchema = z.object({
  imdb: z.object({ rating: z.number().nullish() }).nullish(), // 8.5 (out of 10)
  rotten_tomatoes: z.object({ rating: z.number().nullish() }).nullish(), // 99 (%)
});

export type ApiRatings = z.infer<typeof apiRatingsSchema>;
