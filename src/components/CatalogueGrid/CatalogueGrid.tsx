"use client";

import { MovieCard } from "@/components/MovieCard";
import type { Movie } from "@/data/movies";
import type {
  SaveUserMovie,
  UserMovieChange,
  UserMovies,
} from "@/data/userMovies";
import { cn } from "@/lib/utils";

import { cardActions } from "./cardActions";
import { useUserMovies } from "./useUserMovies";

type CatalogueGridProps = {
  movies: Movie[];
  className?: string;
  /** Pass these two to let a parent own the lists (the profile page shares them
      between its two lists). Without them, the grid remembers them itself. */
  userMovies?: UserMovies;
  onUpdate?: (movie: Movie, change: UserMovieChange) => void;
  /** When the grid remembers them itself: what the lists hold when the page opens */
  initialUserMovies?: UserMovies;
  /** When the grid remembers them itself: where each change is also saved */
  save?: SaveUserMovie;
};

// All catalogue movies as real MovieCards. Remembers what you mark (watched, score,
// bookmark), and hands each change to `save` so the other pages see it too.
function CatalogueGrid({
  movies,
  className,
  userMovies,
  onUpdate,
  initialUserMovies,
  save,
}: CatalogueGridProps) {
  const own = useUserMovies(initialUserMovies, save);
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
              {...cardActions(movie, userMovie, update)}
              size="w-full"
            />
          </li>
        );
      })}
    </ul>
  );
}

export { CatalogueGrid };
