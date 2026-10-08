"use client";

import { MovieCard } from "@/components/MovieCard";
import type { Movie } from "@/data/movies";
import { cn } from "@/lib/utils";

import {
  useMovieStatuses,
  type CardStatus,
  type Statuses,
} from "./useMovieStatuses";

type CatalogueGridProps = {
  movies: Movie[];
  className?: string;
  /** Pass these two to let a parent own the statuses (the profile page shares them
      between its two lists). Without them, the grid remembers them itself. */
  statuses?: Statuses;
  onUpdate?: (title: string, change: Partial<CardStatus>) => void;
};

// All catalogue movies as real MovieCards. Remembers what you mark (watched, score,
// bookmark) while you're on the page; nothing is saved yet (no backend).
function CatalogueGrid({
  movies,
  className,
  statuses,
  onUpdate,
}: CatalogueGridProps) {
  const own = useMovieStatuses(movies);
  const status = statuses ?? own.statuses;
  const update = onUpdate ?? own.update;

  return (
    // auto-fill + minmax: as many columns as fit, each at least 14rem wide, but never more
    // than 5 per row (the max() makes a column at least 1/5 of the width minus the gaps)
    <ul
      className={cn(
        "grid grid-cols-[repeat(auto-fill,minmax(max(14rem,calc((100%_-_6rem)/5)),1fr))] gap-x-6 gap-y-8",
        className,
      )}
    >
      {movies.map((movie) => {
        const card = status[movie.title];
        return (
          <li key={movie.title}>
            <MovieCard
             movie={movie}
              // watched={card?.watched}
              // bookmarked={card?.bookmarked}
              // rating={card?.rating}
              onRate={(rating) =>
                update(movie.title, { watched: true, rating })
              }
              onUnwatch={() =>
                update(movie.title, { watched: false, rating: undefined })
              }
              onToggleBookmark={() =>
                update(movie.title, { bookmarked: !card?.bookmarked })
              }
              size="w-full"
            />
          </li>
        );
      })}
    </ul>
  );
}

export { CatalogueGrid };
