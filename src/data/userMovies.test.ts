import { describe, expect, it } from "vitest";

import { applyUserMovieChange } from "./userMovies";

describe("applyUserMovieChange", () => {
  it("starts from 'nothing done' for a movie the user never touched", () => {
    expect(applyUserMovieChange(undefined, { bookmarked: true })).toEqual({
      watched: false,
      bookmarked: true,
    });
  });

  it("takes a movie off WannaWatch when it's marked as watched", () => {
    const bookmarked = { watched: false, bookmarked: true };
    expect(
      applyUserMovieChange(bookmarked, { watched: true, rating: 2 }),
    ).toEqual({ watched: true, bookmarked: false, rating: 2 });
  });

  it("forgets the watched score when a movie goes back on WannaWatch", () => {
    const watched = { watched: true, bookmarked: false, rating: 1 as const };
    expect(applyUserMovieChange(watched, { bookmarked: true })).toEqual({
      watched: false,
      bookmarked: true,
      rating: undefined,
    });
  });

  it("only un-bookmarks when bookmarked turns false", () => {
    const bookmarked = { watched: false, bookmarked: true };
    expect(applyUserMovieChange(bookmarked, { bookmarked: false })).toEqual({
      watched: false,
      bookmarked: false,
    });
  });
});
