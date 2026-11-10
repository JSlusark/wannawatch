import type { Movie } from "@/data/movies";

import type { ApiMovie } from "./schemas";

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
    // The list request has no scores: they come from the ratings request (step 2)
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
