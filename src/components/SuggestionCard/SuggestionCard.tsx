"use client";

import { useEffect, useId, useRef, type ReactNode } from "react";

import { BackCard, type Rating } from "@/components/MovieCard";
import { MovieInfo } from "@/components/movie/MovieInfo";
import { Poster } from "@/components/movie/Poster";
import type { Movie } from "@/data/movies";
import { cn } from "@/lib/utils";

type SuggestionCardProps = {
  movie: Movie;
  /** true = shows the back, to rate a movie you've already seen. The parent decides when. */
  flipped: boolean;
  /** Called after Confirm and after Cancel on the back */
  onClose: () => void;
  /** Called after Confirm, with the chosen score */
  onRate: (rating: Rating) => void;
  /** Drawn over the front, e.g. the "WannaWatch" / "Pass" stamp of the swipe deck */
  overlay?: ReactNode;
  size?: string;
};

// A movie suggested for you: like MovieCard, but without the Watched and Bookmark
// stickers. Something outside the card (the swipe deck) turns it to its back.
function SuggestionCard({
  movie,
  flipped,
  onClose,
  onRate,
  overlay,
  size,
}: SuggestionCardProps) {
  const titleId = useId();
  const backRef = useRef<HTMLDivElement>(null);

  // When the card turns to its back, focus the rating slider so the arrow keys work right away
  useEffect(() => {
    if (!flipped) return;
    backRef.current
      ?.querySelector<HTMLInputElement>('input[type="range"]')
      ?.focus();
  }, [flipped]);

  return (
    // perspective = how "deep" the 3D flip looks (like the distance to a camera)
    <div className={cn("perspective-normal", size)}>
      {/* Front and back share one grid cell; the whole thing turns around */}
      <div
        className={cn(
          "grid transform-3d motion-safe:transition-transform motion-safe:duration-700",
          flipped && "rotate-y-180",
        )}
      >
        <article
          inert={flipped}
          aria-labelledby={titleId}
          className="@container relative isolate col-start-1 row-start-1 flex aspect-2/3 flex-col justify-end overflow-hidden rounded-xl border-3 border-border bg-muted text-on-media backface-hidden"
        >
          <Poster url={movie.image} />
          <MovieInfo
            titleId={titleId}
            title={movie.title}
            genres={movie.genre}
            imdbScore={movie.imdbScore}
            rottenTomatoesScore={movie.rottenTomatoesScore}
          />
          {overlay}
        </article>
        <BackCard
          movie={movie}
          backRef={backRef}
          flipped={flipped}
          onClose={onClose}
          onRate={onRate}
        />
      </div>
    </div>
  );
}

export { SuggestionCard };
