import { describe, expect, it } from "vitest";

import { normalizeScores } from "./normalizeMovie";
import { apiRatingsSchema } from "./schemas";

describe("normalizeScores", () => {
  it("takes IMDb and Rotten Tomatoes from the ratings request", () => {
    // Shortened from the real answer for Parasite (/movies/343180/ratings?extended=all)
    const ratings = apiRatingsSchema.parse({
      trakt: { rating: 8.71, votes: 55766 },
      imdb: { rating: 8.5, votes: 1140327 },
      rotten_tomatoes: { rating: 99, state: "fresh" },
    });
    expect(normalizeScores(ratings)).toEqual({
      imdbScore: 8.5,
      rottenTomatoesScore: 99,
    });
  });

  it("gives null for a site that doesn't know the movie", () => {
    const ratings = apiRatingsSchema.parse({ imdb: { rating: 6.1 } });
    expect(normalizeScores(ratings)).toEqual({
      imdbScore: 6.1,
      rottenTomatoesScore: null,
    });
  });
});
