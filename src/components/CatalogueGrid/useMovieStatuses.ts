import { useState } from "react";

import type { Rating } from "@/components/MovieCard/BackCard";
import type { Movie } from "@/data/movies";

type CardStatus = { watched: boolean; bookmarked: boolean; rating?: Rating };
type Statuses = Record<string, CardStatus>;

// A movie is either Watched or on your WannaWatch list, never both.
// If the data says both, Watched wins (you've already seen it).
function startingStatuses(movies: Movie[]): Statuses {
  return Object.fromEntries(
    movies.map((m) => [
      m.title,
      { watched: m.isWatched, bookmarked: m.isBookmarked && !m.isWatched },
    ]),
  );
}

// Remembers what you mark on each movie (watched, score, WannaWatch) while you're on
// the page; nothing is saved yet (no backend). `update` keeps the "never both" rule:
// marking a movie as watched takes it off WannaWatch, and adding it to WannaWatch
// makes it not watched again.
function useMovieStatuses(movies: Movie[]) {
  const [statuses, setStatuses] = useState<Statuses>(() =>
    startingStatuses(movies),
  );

  function update(title: string, change: Partial<CardStatus>) {
    setStatuses((all) => {
      const next = {
        watched: false,
        bookmarked: false,
        ...all[title],
        ...change,
      };
      if (change.watched) next.bookmarked = false;
      else if (change.bookmarked) {
        next.watched = false;
        next.rating = undefined;
      }
      return { ...all, [title]: next };
    });
  }

  return { statuses, update };
}

export { useMovieStatuses, type CardStatus, type Statuses };
