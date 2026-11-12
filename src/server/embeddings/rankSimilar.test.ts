import { describe, expect, it } from "vitest";

import { genreOverlap, rankSimilar } from "./rankSimilar";

describe("genreOverlap", () => {
  it("is 1 for the same genres, in any order", () => {
    expect(genreOverlap(["Drama", "Comedy"], ["Comedy", "Drama"])).toBe(1);
  });

  it("is shared genres divided by all genres", () => {
    expect(
      genreOverlap(["Drama", "Comedy"], ["Comedy", "Romance"]),
    ).toBeCloseTo(1 / 3);
  });

  it("is 0 when nothing is shared or a movie has no genres", () => {
    expect(genreOverlap(["Horror"], ["Comedy"])).toBe(0);
    expect(genreOverlap([], ["Comedy"])).toBe(0);
    expect(genreOverlap([], [])).toBe(0);
  });
});

describe("rankSimilar", () => {
  it("lets a genre match beat a slightly closer plot", () => {
    const ranked = rankSimilar(
      ["Science Fiction", "Comedy"],
      [
        { title: "Cartoon", genres: ["Animation"], plotSimilarity: 0.8 },
        {
          title: "Sci-fi",
          genres: ["Science Fiction", "Comedy"],
          plotSimilarity: 0.75,
        },
        { title: "Far away", genres: ["Drama"], plotSimilarity: 0.6 },
      ],
    );
    expect(ranked.map((m) => m.title)).toEqual([
      "Sci-fi",
      "Cartoon",
      "Far away",
    ]);
  });

  it("stretches plot similarity to 0–1 within the group", () => {
    const ranked = rankSimilar(
      [],
      [
        { genres: [], plotSimilarity: 0.7 },
        { genres: [], plotSimilarity: 0.6 },
        { genres: [], plotSimilarity: 0.5 },
      ],
    );
    expect(ranked.map((m) => m.plotScore)).toEqual([1, expect.closeTo(0.5), 0]);
  });

  it("gives every plot full marks when there's only one candidate", () => {
    const [only] = rankSimilar([], [{ genres: [], plotSimilarity: 0.4 }]);
    expect(only?.plotScore).toBe(1);
  });
});
