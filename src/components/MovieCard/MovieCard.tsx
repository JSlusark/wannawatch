"use client";

import { Bookmark, Check, Film } from "lucide-react";
import Image from "next/image";
import {
  useEffect,
  useId,
  useRef,
  useState,
  type PointerEvent,
  type ReactNode,
  type Ref,
} from "react";

import { Badge } from "@/components/ui/badge";
import type { MovieDetails } from "@/data/movies";
import { Toggle } from "@/components/ui/toggle";
import { cn } from "@/lib/utils";

import { LiquidRating, ratingLabel, type Rating } from "./BackCard";
import { MovieDetailsDialog } from "./MovieDetailsDialog";
import { ImdbIcon, TomatoIcon } from "./RatingIcons";
import { useCardScale } from "./useCardScale";

type MovieCardProps = {
  title: string;
  genres: string[];
  plot: string;
  imdbScore: number;
  rottenTomatoesScore: number;
  posterUrl?: string;
  watched?: boolean;
  bookmarked?: boolean;
  rating?: Rating;
  /** Extra facts for the details pop-up (director, cast, year, runtime) */
  details?: MovieDetails;
  /** Drawn over the whole front of the card (the swipe deck uses it for Pass / WannaWatch) */
  overlay?: ReactNode;
  /** Confirm on the back: the movie is now watched, with this score */
  onRate?: (rating: Rating) => void;
  /** Watched pressed on the front while already watched: un-mark it */
  onUnwatch?: () => void;
  onToggleWannaWatch?: () => void;
  size?: string;
};

function MovieCard({
  title,
  genres,
  plot,
  imdbScore,
  rottenTomatoesScore,
  posterUrl,
  watched = false,
  bookmarked: bookMarked = false,
  rating,
  details,
  overlay,
  onRate,
  onUnwatch,
  onToggleWannaWatch,
  size: size,
}: MovieCardProps) {
  const titleId = useId();
  const [flipped, setFlipped] = useState(false);
  const backRef = useRef<HTMLDivElement>(null);
  const watchedRef = useRef<HTMLButtonElement>(null);
  const previousFlipped = useRef(flipped);
  const tilt = useTilt();
  // The card's width decides how big the content is, so a small card isn't cramped
  const [cardRef, scale] = useCardScale<HTMLDivElement>();
  const [detailsOpen, setDetailsOpen] = useState(false);
  // Where the pointer went down, to tell a tap from the start of a swipe
  const pressedAt = useRef({ x: 0, y: 0 });

  // After a flip, move keyboard focus to the side that is now visible.
  // Only when `flipped` really changed: in development React runs effects twice on
  // purpose, and a "skip the first run" check would then steal focus on page load.
  useEffect(() => {
    if (previousFlipped.current === flipped) return;
    previousFlipped.current = flipped;
    if (flipped) {
      // Focus the rating slider so the arrow keys can change the score right away
      backRef.current
        ?.querySelector<HTMLInputElement>('input[type="range"]')
        ?.focus();
    } else watchedRef.current?.focus();
  }, [flipped]);

  return (
    // perspective = how "deep" the 3D looks (like the distance to a camera)
    // The mouse is tracked here (this box never moves), so the tilt stays smooth
    <div
      ref={cardRef}
      className={cn("perspective-distant", size)}
      onPointerMove={tilt.onPointerMove}
      onPointerLeave={tilt.onPointerLeave}
    >
      {/* TILT: leans toward the mouse and grows a little */}
      <div
        className="transform-3d transition-transform duration-300 ease-out"
        style={{ transform: tilt.transform }}
      >
        {/* FLIP: the rotating part. Both sides sit in the same grid cell, on top of each other */}
        <div
          className={cn(
            "grid transform-3d motion-safe:transition-transform motion-safe:duration-700 motion-safe:ease-in-out",
            flipped && "rotate-y-180",
          )}
        >
          {/* FRONT. inert = can't be clicked or tabbed to while it's facing away */}
          <article
            inert={flipped}
            aria-labelledby={titleId}
            onPointerDown={(e) => {
              pressedAt.current = { x: e.clientX, y: e.clientY };
            }}
            onClick={(e) => {
              // Tapping the card opens the details, but not when the tap was on one of its
              // buttons or when the pointer travelled (that was a swipe). The title is a
              // button too (marked data-details), which is the way in for the keyboard.
              if (
                (e.target as HTMLElement).closest("button:not([data-details])")
              )
                return;
              const moved = Math.hypot(
                e.clientX - pressedAt.current.x,
                e.clientY - pressedAt.current.y,
              );
              // detail 0 = pressed with the keyboard (Enter/Space), so no pointer movement to check
              if (e.detail === 0 || moved < 6) setDetailsOpen(true);
            }}
            className="@container relative isolate col-start-1 row-start-1 flex cursor-pointer aspect-2/3 flex-col justify-end overflow-hidden rounded-xl border-3 border-border bg-muted text-on-media backface-hidden"
          >
            <Poster url={posterUrl} />
            <PosterFade />
            <CardActions
              scale={scale}
              watched={watched}
              rating={rating}
              watchedRef={watchedRef}
              bookmarked={bookMarked}
              onToggleWatched={() => {
                // Not watched yet → turn the card to rate it. Already watched → un-mark it.
                if (watched) onUnwatch?.();
                else setFlipped(true);
              }}
              onToggleWannaWatch={onToggleWannaWatch}
            />
            <MovieInfo
              titleId={titleId}
              title={title}
              genres={genres}
              imdbScore={imdbScore}
              rottenTomatoesScore={rottenTomatoesScore}
              opensDetails
              scale={scale}
            />
            {overlay}
          </article>

          {/* BACK: rate the movie. Pre-rotated 180° so it faces you once the card turns */}
          <div
            ref={backRef}
            inert={!flipped}
            // Tells a swipe deck not to start a swipe here, so dragging the rating slider works
            data-no-swipe
            className="relative col-start-1 row-start-1 rotate-y-180 backface-hidden"
          >
            <div className="relative isolate size-full overflow-hidden rounded-xl border-3 border-border bg-card">
              {/* key: a new key = a fresh LiquidRating, so each flip starts from the saved
                  score and forgets any unconfirmed draft */}
              <LiquidRating
                key={String(flipped)}
                title={title}
                scale={scale}
                onConfirm={(score) => {
                  setFlipped(false);
                  onRate?.(score);
                }}
                onCancel={() => setFlipped(false)}
              />
            </div>
          </div>
        </div>
      </div>
      <MovieDetailsDialog
        open={detailsOpen}
        onOpenChange={setDetailsOpen}
        title={title}
        genres={genres}
        plot={plot}
        imdbScore={imdbScore}
        rottenTomatoesScore={rottenTomatoesScore}
        posterUrl={posterUrl}
        details={details}
      />
    </div>
  );
}

// How strongly the card leans: bigger number = gentler tilt (same as the reference)
const TILT_SOFTNESS = 80;

// Follows the mouse and returns the tilt transform
function useTilt() {
  const [state, setState] = useState({
    rotateX: 0,
    rotateY: 0,
    active: false,
  });

  function onPointerMove(e: PointerEvent<HTMLDivElement>) {
    // Only for a mouse (a finger has no "hover"), and never with reduced motion
    if (e.pointerType !== "mouse") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left; // mouse position inside the card, in px
    const y = e.clientY - rect.top;

    setState({
      // Mouse below the middle → top edge leans back; right of middle → right edge leans back
      rotateX: (y - rect.height / 2) / TILT_SOFTNESS,
      rotateY: (rect.width / 2 - x) / TILT_SOFTNESS,
      active: true,
    });
  }

  function onPointerLeave() {
    setState({ rotateX: 0, rotateY: 0, active: false });
  }

  return {
    onPointerMove,
    onPointerLeave,
    transform: state.active
      ? `rotateX(${state.rotateX}deg) rotateY(${state.rotateY}deg) scale3d(1.05, 1.05, 1.05)`
      : undefined,
  };
}

// A dark fade over the bottom of the poster so the white text is readable on any picture.
// The one place we allow a gradient: it's a readability layer, not decoration.
function PosterFade() {
  return (
    <div
      aria-hidden="true"
      className="absolute inset-x-0 bottom-0 -z-10 h-4/5 bg-linear-to-t from-media-scrim/95 via-media-scrim/75 to-transparent"
    />
  );
}

function Poster({ url }: { url?: string }) {
  if (!url) {
    return (
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 flex flex-col items-center justify-center bg-purple-soft pb-[65%] text-ink"
      >
        <Film className="size-12" />
        <p>Image not found</p>
      </div>
    );
  }

  return (
    <Image
      src={url}
      alt=""
      fill
      sizes="(min-width: 768px) 22rem, 100vw"
      className="-z-10 object-cover"
    />
  );
}

type CardActionsProps = {
  scale?: number;
  watched: boolean;
  rating?: Rating;
  watchedRef: Ref<HTMLButtonElement>;
  bookmarked: boolean;
  onToggleWatched?: () => void;
  onToggleWannaWatch?: () => void;
};

function CardActions({
  scale = 1,
  watched,
  rating,
  watchedRef,
  bookmarked,
  onToggleWatched,
  onToggleWannaWatch,
}: CardActionsProps) {
  // Only a watched movie shows its score (e.g. "✓ I liked it")
  const score =
    watched && rating !== undefined ? ratingLabel(rating) : undefined;

  return (
    <div style={{ zoom: scale }} className="absolute top-6 right-5 flex gap-2">
      <CardToggle
        ref={watchedRef}
        // The name includes the visible score, so voice users can say what they see
        label={score ? `Watched: ${score}` : "Watched"}
        pressed={watched}
        onPressedChange={onToggleWatched}
        pressedClassName="aria-pressed:bg-secondary aria-pressed:text-secondary-foreground aria-pressed:hover:bg-secondary"
      >
        <Check className="size-6" strokeWidth={2.5} />
        {score && <span className="pr-1.5 text-sm font-semibold">{score}</span>}
      </CardToggle>
      <CardToggle
        label="Bookmarked"
        pressed={bookmarked}
        onPressedChange={onToggleWannaWatch}
        pressedClassName="aria-pressed:bg-primary aria-pressed:text-primary-foreground aria-pressed:hover:bg-primary"
      >
        <Bookmark className="size-6" fill="currentColor" strokeWidth={0} />
      </CardToggle>
    </div>
  );
}

type MovieInfoProps = {
  titleId: string;
  title: string;
  genres: string[];
  /** Not shown for now (commented out below), kept so callers don't change */
  synopsis?: string;
  imdbScore: number;
  rottenTomatoesScore: number;
  /** The title becomes a button that opens the details (set by MovieCard) */
  opensDetails?: boolean;
  /** How much to scale the text and spacing with the card width */
  scale?: number;
};

function MovieInfo({
  titleId,
  title,
  genres,
  imdbScore,
  rottenTomatoesScore,
  opensDetails = false,
  scale = 1,
}: MovieInfoProps) {
  return (
    // White text straight on the poster: no box, the dark fade (PosterFade) keeps it readable
    <div
      style={{ zoom: scale }}
      className="relative flex flex-col gap-3 px-5 pt-6 pb-8 text-on-media"
    >
      <Ratings
        imdbScore={imdbScore}
        rottenTomatoesScore={rottenTomatoesScore}
      />

      <h3
        id={titleId}
        title={title}
        className="font-display text-3xl leading-none uppercase"
      >
        {opensDetails ? (
          // The title is also a real button, so keyboard and screen reader users can open
          // the details (mouse and touch users can just tap the card)
          <button
            type="button"
            data-details
            aria-haspopup="dialog"
            className="line-clamp-2 block w-full cursor-pointer rounded-sm text-left uppercase outline-none focus-visible:ring-3 focus-visible:ring-ring"
          >
            {title}
          </button>
        ) : (
          <span className="line-clamp-2 block">{title}</span>
        )}
      </h3>
      <Genres genres={genres} />

      {/* Plot hidden for now: the full description is in the details pop-up
      <p className="line-clamp-3 text-sm leading-snug font-medium">
        {synopsis}
      </p> */}
    </div>
  );
}

// Genre labels on the card: 20% smaller than the default badge (12px text, 24px tall)
const smallLabel = "h-[1.2rem] px-1.5 text-[0.6rem]";

const MAX_GENRES = 3;

// Each genre always gets the same soft colour (picked from its name)
const GENRE_TINTS = [
  "soft-lime",
  "soft-purple",
  "soft-orange",
  "soft-pink",
] as const;

function genreTint(genre: string) {
  let sum = 0;
  for (const char of genre) sum += char.charCodeAt(0);
  return GENRE_TINTS[sum % GENRE_TINTS.length];
}

function Genres({ genres }: { genres: string[] }) {
  const shown = genres.slice(0, MAX_GENRES);
  const hiddenCount = genres.length - shown.length;

  return (
    <ul aria-label="Genres" className="flex flex-wrap gap-1.5">
      {shown.map((genre) => (
        <Badge
          key={genre}
          render={<li />}
          variant={genreTint(genre)}
          className={smallLabel}
        >
          {genre}
        </Badge>
      ))}
      {hiddenCount > 0 && (
        <Badge render={<li />} variant="outline" className={smallLabel}>
          +{hiddenCount}
        </Badge>
      )}
    </ul>
  );
}

type RatingsProps = {
  imdbScore: number;
  rottenTomatoesScore: number;
};

function Ratings({ imdbScore, rottenTomatoesScore }: RatingsProps) {
  return (
    <p className="flex items-center gap-5 font-mono text-base font-bold">
      <span className="flex items-center gap-2">
        <ImdbIcon />
        <span className="sr-only">IMDb rating </span>
        {imdbScore.toFixed(1)}/10
      </span>
      <span className="flex items-center gap-2">
        <TomatoIcon />
        <span className="sr-only">Rotten Tomatoes score </span>
        {rottenTomatoesScore}%
      </span>
    </p>
  );
}

type CardToggleProps = {
  ref?: Ref<HTMLButtonElement>;
  label: string;
  pressed: boolean;
  onPressedChange?: () => void;
  pressedClassName: string;
  children: ReactNode;
};

// Square outlined button on top of the poster (wider when it has text inside).
// Toggle sets aria-pressed so screen readers know whether it's on or off.
function CardToggle({
  ref,
  label,
  pressed,
  onPressedChange,
  pressedClassName,
  children,
}: CardToggleProps) {
  return (
    <Toggle
      ref={ref}
      aria-label={label}
      pressed={pressed}
      onPressedChange={onPressedChange}
      className={cn(
        "h-11 min-w-11 cursor-pointer gap-1 rounded-lg border-2 border-border px-2.5 shadow-brutal-sm",
        "bg-card text-card-foreground hover:bg-card hover:text-card-foreground",
        "motion-safe:transition-[transform,box-shadow] motion-safe:duration-100 hover:-translate-y-0.5 hover:shadow-brutal active:translate-x-[3px] active:translate-y-[3px] active:shadow-none",
        "focus-visible:ring-3 focus-visible:ring-ring",
        pressedClassName,
      )}
    >
      {children}
    </Toggle>
  );
}

export { MovieCard };
// Shared with PreviewCard, which shows the same front without buttons or motion
export { MovieInfo, Poster, PosterFade };
