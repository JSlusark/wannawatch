import type { Movie } from "@/data/movies";

import type { ApiMovie, ApiRatings } from "./schemas";

// Layer 3: the translator. Turns the API's shape into the Movie, so components never
// see the API's data. If the API changes, only this file and schemas.ts change.
export function normalizeMovie(apiMovie: ApiMovie): Movie {
  const poster = apiMovie.images?.poster?.[0];

  return {
    id: apiMovie.ids.trakt,
    title: apiMovie.title,
    year: apiMovie.year ?? null,
    plot: apiMovie.overview ?? "",
    runtime: apiMovie.runtime ?? undefined,
    genre: (apiMovie.genres ?? []).map(genreName),
    // The API leaves out the "https://" at the start
    image: poster ? `https://${poster}` : null,
    // The list request has no scores: withScores (src/server/scores.ts) adds them
    imdbScore: null,
    rottenTomatoesScore: null,
  };
}

// "science-fiction" → "Science Fiction"
function genreName(slug: string) {
  return slug
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

// The ratings request → the two scores a card shows. Missing → null ("no score")
export function normalizeScores(
  ratings: ApiRatings,
): Pick<Movie, "imdbScore" | "rottenTomatoesScore"> {
  return {
    imdbScore: ratings.imdb?.rating ?? null,
    rottenTomatoesScore: ratings.rotten_tomatoes?.rating ?? null,
  };
}
