"use client";

import { MovieCard } from "@/components/MovieCard";
import type { Movie } from "@/data/movies";
import type { UserMovie, UserMovies } from "@/data/userMovies";
import { cn } from "@/lib/utils";

import { useUserMovies } from "./useUserMovies";

type CatalogueGridProps = {
  movies: Movie[];
  className?: string;
  /** Pass these two to let a parent own the lists (the profile page shares them
      between its two lists). Without them, the grid remembers them itself. */
  userMovies?: UserMovies;
  onUpdate?: (movieId: number, change: Partial<UserMovie>) => void;
};

// All catalogue movies as real MovieCards. Remembers what you mark (watched, score,
// bookmark) while you're on the page; nothing is saved yet (no backend).
function CatalogueGrid({
  movies,
  className,
  userMovies,
  onUpdate,
}: CatalogueGridProps) {
  const own = useUserMovies();
  const lists = userMovies ?? own.userMovies;
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
        const userMovie = lists[movie.id];
        return (
          <li key={movie.id}>
            <MovieCard
              movie={movie}
              userMovie={userMovie}
              onRate={(rating) => update(movie.id, { watched: true, rating })}
              onUnwatch={() =>
                update(movie.id, { watched: false, rating: undefined })
              }
              onToggleBookmark={() =>
                update(movie.id, { bookmarked: !userMovie?.bookmarked })
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
