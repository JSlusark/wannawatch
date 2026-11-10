import { useState } from "react";

import type { UserMovie, UserMovies } from "@/data/userMovies";

// Remembers what you mark on each movie (watched, score, WannaWatch) while you're on
// the page; nothing is saved yet (no backend). `initial` = what the lists hold when the
// page opens. `update` keeps the "never both" rule: marking a movie as watched takes it
// off WannaWatch, and adding it to WannaWatch makes it not watched again.
function useUserMovies(initial: UserMovies = {}) {
  const [userMovies, setUserMovies] = useState<UserMovies>(initial);

  function update(movieId: number, change: Partial<UserMovie>) {
    setUserMovies((all) => {
      const next = {
        watched: false,
        bookmarked: false,
        ...all[movieId],
        ...change,
      };
      if (change.watched) next.bookmarked = false;
      else if (change.bookmarked) {
        next.watched = false;
        next.rating = undefined;
      }
      return { ...all, [movieId]: next };
    });
  }

  return { userMovies, update };
}

export { useUserMovies };
