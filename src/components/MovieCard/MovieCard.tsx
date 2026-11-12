"use client";

import { useEffect, useId, useRef } from "react";

import type { Movie } from "@/data/movies";
import type { UserMovie } from "@/data/userMovies";
import { cn } from "@/lib/utils";

import { BackCard, type Rating } from "./BackCard";
import { FrontCard } from "./FrontCard";
import { useSingleFlip, useTilt } from "./hooks";

type MovieCardProps = {
  movie: Movie;
  /** What the user did with this movie. Missing = not watched, not bookmarked */
  userMovie?: UserMovie;
  // hooks for the card's state
  onRate?: (rating: Rating) => void;
  onUnwatch?: () => void;
  onToggleBookmark?: () => void;
  size?: string;
  /** Where clicking the card goes (the movie's page). Missing = not clickable */
  href?: string;
};

function MovieCard({
  movie,
  userMovie,
  onRate,
  onUnwatch,
  onToggleBookmark,
  size: size,
  href,
}: MovieCardProps) {
  const titleId = useId(); // used to recognised the flipped card and for accessibility
  const [isFlipped, setIsFlipped] = useSingleFlip(titleId);
  const backRef = useRef<HTMLDivElement>(null);
  const watchedRef = useRef<HTMLButtonElement>(null);
  const previousFlipped = useRef(isFlipped);
  // True when this card closes itself (Confirm/Cancel), false when another card closed it
  const closedHere = useRef(false);
  const tilt = useTilt();

  // After a flip, move keyboard focus to the side that is now visible.
  // Only when `flipped` really changed: in development React runs effects twice on
  // purpose, and a "skip the first run" check would then steal focus on page load.
  useEffect(() => {
    if (previousFlipped.current === isFlipped) return;
    previousFlipped.current = isFlipped;
    if (isFlipped) {
      // Focus the rating slider so the arrow keys can change the score right away
      backRef.current
        ?.querySelector<HTMLInputElement>('input[type="range"]')
        ?.focus();
    } else if (closedHere.current) {
      // Back to the Watched button, but only if the user closed this card. If another
      // card was flipped, focus belongs to that card, so don't pull it back here.
      closedHere.current = false;
      watchedRef.current?.focus();
    }
  }, [isFlipped]);

  function closeBack() {
    closedHere.current = true;
    setIsFlipped(false);
  }

  return (
    // perspective = how "deep" the 3D looks (like the distance to a camera)
    // The mouse is tracked here (this box never moves), so the tilt stays smooth
    <div
      className={cn(
        "transform-3d transition-transform duration-300 ease-out",
        size,
      )}
      style={{ transform: tilt.transform }}
      onPointerMove={tilt.onPointerMove}
      onPointerLeave={tilt.onPointerLeave}
    >
      <div
        className={cn(
          "grid transform-3d motion-safe:duration-700 ",
          isFlipped && "rotate-y-180", // if true, back is shown
        )}
      >
        <FrontCard
          movie={movie}
          userMovie={userMovie}
          titleId={titleId}
          inert={isFlipped}
          watchedRef={watchedRef}
          onToggleWatch={() => {
            // Not watched yet → turn the card to rate it. Already watched → un-mark it.
            if (userMovie?.watched) onUnwatch?.();
            else setIsFlipped(true);
          }}
          onToggleBookmark={onToggleBookmark}
          href={href}
        />
        <BackCard
          movie={movie}
          backRef={backRef}
          flipped={isFlipped}
          onClose={closeBack}
          onRate={onRate}
        />
      </div>
    </div>
  );
}

export { MovieCard };
