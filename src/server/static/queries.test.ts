import { describe, expect, it } from "vitest";

import { mockUserMovies } from "@/data/userMovies";

import {
  cosineSimilarity,
  getStaticDailyPicks,
  getStaticMovie,
  getStaticPopularMovies,
  getStaticSimilarMovies,
} from "./queries";
import { staticMovies } from "./staticMovies";

describe("cosineSimilarity", () => {
  it("is 1 for the same direction, 0 for unrelated, -1 for opposite", () => {
    expect(cosineSimilarity([1, 2], [2, 4])).toBeCloseTo(1);
    expect(cosineSimilarity([1, 0], [0, 1])).toBeCloseTo(0);
    expect(cosineSimilarity([1, 0], [-1, 0])).toBeCloseTo(-1);
  });
});

describe("the static movies file", () => {
  it("has every movie on the mock lists, so the profile is never empty", () => {
    for (const id of Object.keys(mockUserMovies).map(Number)) {
      expect(getStaticMovie(id)).not.toBeNull();
    }
  });

  it("never hands a page the 384 numbers of a vector", () => {
    const [first] = getStaticPopularMovies(1).movies;
    expect(first).not.toHaveProperty("embedding");
  });
});

describe("getStaticPopularMovies", () => {
  it("pages through the file 20 at a time, and the last page has the rest", () => {
    const first = getStaticPopularMovies(1);
    expect(first.movies).toHaveLength(20);
    expect(first.movies[0]!.id).toBe(staticMovies[0]!.id);

    const last = getStaticPopularMovies(first.totalPages);
    expect(last.movies.length).toBeGreaterThan(0);
    expect(last.movies.length).toBeLessThanOrEqual(20);
    expect(getStaticPopularMovies(first.totalPages + 1).movies).toHaveLength(0);
  });
});

describe("getStaticDailyPicks", () => {
  it("draws 10 feature films with a poster and a plot, none of the skipped ones", () => {
    const skip = staticMovies.slice(0, 100).map((movie) => movie.id);
    const picks = getStaticDailyPicks(skip);

    expect(picks).toHaveLength(10);
    expect(new Set(picks.map((movie) => movie.id)).size).toBe(10);
    for (const movie of picks) {
      expect(skip).not.toContain(movie.id);
      expect(movie.image).toBeTruthy();
      expect(movie.plot).toBeTruthy();
      expect(movie.runtime).toBeGreaterThanOrEqual(60);
    }
  });
});

describe("getStaticSimilarMovies", () => {
  it("gives 10 other movies for a movie in the file", () => {
    const movie = staticMovies[0]!;
    const similar = getStaticSimilarMovies(movie.id);

    expect(similar.status).toBe("ok");
    if (similar.status !== "ok") return;
    expect(similar.movies).toHaveLength(10);
    expect(similar.movies.map((m) => m.id)).not.toContain(movie.id);
  });

  it("says so when the movie isn't in the file", () => {
    expect(getStaticSimilarMovies(-1)).toEqual({ status: "not-in-database" });
  });
});
