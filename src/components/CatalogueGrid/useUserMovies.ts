import { useState } from "react";

import type { Movie } from "@/data/movies";
import {
  applyUserMovieChange,
  type SaveUserMovie,
  type UserMovieChange,
  type UserMovies,
} from "@/data/userMovies";

// Remembers what you mark on each movie (watched, score, WannaWatch).
// `initial` = what the lists hold when the page opens.
// `save` (optional) = where the change also goes, so other pages see it too (the
// server's mock library). The screen doesn't wait for it: the card changes at once.
// Without `save` the marks only live on this page (Storybook, the Daily 10).
function useUserMovies(initial: UserMovies = {}, save?: SaveUserMovie) {
  const [userMovies, setUserMovies] = useState<UserMovies>(initial);

  function update(movie: Movie, change: UserMovieChange) {
    setUserMovies((all) => ({
      ...all,
      [movie.id]: applyUserMovieChange(all[movie.id], change),
    }));
    save?.(movie, change);
  }

  return { userMovies, update };
}

export { useUserMovies };
