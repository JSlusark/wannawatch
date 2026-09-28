"use client";

import { useState } from "react";

import { MovieCard } from "@/components/MovieCard";
import type { Rating } from "@/components/MovieCard/BackCard";
import type { Movie } from "@/data/movies";
import { cn } from "@/lib/utils";

type CardStatus = { watched: boolean; bookmarked: boolean; rating?: Rating };

// All catalogue movies as real MovieCards. Remembers what you mark (watched, score,
// bookmark) while you're on the page; nothing is saved yet (no backend).
function CatalogueGrid({
  movies,
  className,
}: {
  movies: Movie[];
  className?: string;
}) {
  const [status, setStatus] = useState<Record<string, CardStatus>>(() =>
    Object.fromEntries(
      movies.map((m) => [
        m.title,
        { watched: m.isWatched, bookmarked: m.isBookmarked },
      ]),
    ),
  );

  function update(title: string, change: Partial<CardStatus>) {
    setStatus((all) => ({
      ...all,
      [title]: { watched: false, bookmarked: false, ...all[title], ...change },
    }));
  }

  return (
    // auto-fill + minmax: as many columns as fit, each at least 14rem wide
    <ul
      className={cn(
        "grid grid-cols-[repeat(auto-fill,minmax(14rem,1fr))] gap-x-6 gap-y-8",
        className,
      )}
    >
      {movies.map((movie) => {
        const card = status[movie.title];
        return (
          <li key={movie.title}>
            <MovieCard
              title={movie.title}
              genres={movie.genre}
              plot={movie.plot}
              imdbScore={movie.imdbScore}
              rottenTomatoesScore={movie.rottenTomatoesScore}
              posterUrl={movie.image}
              watched={card?.watched}
              bookmarked={card?.bookmarked}
              rating={card?.rating}
              details={movie}
              onRate={(rating) =>
                update(movie.title, { watched: true, rating })
              }
              onUnwatch={() =>
                update(movie.title, { watched: false, rating: undefined })
              }
              onToggleWannaWatch={() =>
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
