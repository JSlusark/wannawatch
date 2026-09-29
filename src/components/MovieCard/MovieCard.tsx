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

import { GenreList } from "@/components/GenreList";
import type { MovieDetails } from "@/data/movies";
import { Toggle } from "@/components/ui/toggle";
import { cn } from "@/lib/utils";

import { LiquidRating, ratingLabel, type Rating } from "./BackCard";
import { MovieDetailsDialog } from "./MovieDetailsDialog";
import { ImdbIcon, TomatoIcon } from "./RatingIcons";
import { useSingleFlip } from "./useSingleFlip";

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
  // Only one card on the page can be flipped: flipping this one turns any other back
  const [flipped, setFlipped] = useSingleFlip(titleId);
  const backRef = useRef<HTMLDivElement>(null);
  const watchedRef = useRef<HTMLButtonElement>(null);
  const previousFlipped = useRef(flipped);
  // True when this card closes itself (Confirm/Cancel), false when another card closed it
  const closedHere = useRef(false);
  const tilt = useTilt();
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
    } else if (closedHere.current) {
      // Back to the Watched button, but only if the user closed this card. If another
      // card was flipped, focus belongs to that card, so don't pull it back here.
      closedHere.current = false;
      watchedRef.current?.focus();
    }
  }, [flipped]);

  function closeBack() {
    closedHere.current = true;
    setFlipped(false);
  }

  return (
    // perspective = how "deep" the 3D looks (like the distance to a camera)
    // The mouse is tracked here (this box never moves), so the tilt stays smooth
    <div
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
            {/* @container: the back sizes its content by the card's width, like the front */}
            <div className="@container relative isolate size-full overflow-hidden rounded-xl border-3 border-border bg-card">
              {/* key: a new key = a fresh LiquidRating, so each flip starts from the saved
                  score and forgets any unconfirmed draft */}
              <LiquidRating
                key={String(flipped)}
                title={title}
                active={flipped}
                onConfirm={(score) => {
                  closeBack();
                  onRate?.(score);
                }}
                onCancel={closeBack}
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
      // Centred in the top half, the part that the movie info doesn't cover
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-purple-soft text-ink"
      >
        <div className="flex h-1/2 flex-col items-center justify-center gap-2">
          {/* Icon at its normal size inside a circle: a 24px icon blown up to 48px looks chunky */}
          <span className="grid size-12 place-items-center rounded-full border-2 border-ink bg-secondary text-secondary-foreground">
            <Film className="size-6" />
          </span>
          <p className="text-sm font-medium">Image not found</p>
        </div>
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
  watched: boolean;
  rating?: Rating;
  watchedRef: Ref<HTMLButtonElement>;
  bookmarked: boolean;
  onToggleWatched?: () => void;
  onToggleWannaWatch?: () => void;
};

// Colour of the Watched button once the movie has a score. Styled by importance, not
// just by meaning: the movies you liked should jump out when you scan a list, so they
// get the hot pink ramp (the loudest shade for "Loved it", a lighter one for "Liked it").
// "It's ok" stays plain white, and the dislikes step back into a quiet grey.
// The score's text is always inside the button, so colour is never the only clue.
// Contrast: ink on pink-500 6.7:1, ink on pink-300 11.7:1, grey-700 on grey-200 7.5:1.
const SCORE_STYLE: Record<Rating, string> = {
  2: "aria-pressed:bg-pink-500 aria-pressed:text-ink aria-pressed:hover:bg-pink-500 aria-pressed:hover:text-ink",
  1: "aria-pressed:bg-pink-300 aria-pressed:text-ink aria-pressed:hover:bg-pink-300 aria-pressed:hover:text-ink",
  0: "aria-pressed:bg-white aria-pressed:text-ink aria-pressed:hover:bg-white aria-pressed:hover:text-ink",
  [-1]: "aria-pressed:bg-grey-200 aria-pressed:text-grey-700 aria-pressed:hover:bg-grey-200 aria-pressed:hover:text-grey-700",
  [-2]: "aria-pressed:bg-grey-200 aria-pressed:text-grey-700 aria-pressed:hover:bg-grey-200 aria-pressed:hover:text-grey-700",
};
// Watched without a score (shouldn't normally happen): the old purple
const WATCHED_STYLE =
  "aria-pressed:bg-secondary aria-pressed:text-secondary-foreground aria-pressed:hover:bg-secondary";

function CardActions({
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
    // Same distance from the edges as the movie info's side padding, at every card size
    <div className="absolute top-3 right-3 flex gap-2 @3xs:top-4 @3xs:right-4 @xs:top-5 @xs:right-5">
      <CardToggle
        ref={watchedRef}
        // The name includes the visible score, so voice users can say what they see
        label={score ? `Watched: ${score}` : "Watched"}
        pressed={watched}
        onPressedChange={onToggleWatched}
        pressedClassName={
          rating === undefined ? WATCHED_STYLE : SCORE_STYLE[rating]
        }
      >
        <Check className="size-5 @3xs:size-6" strokeWidth={2.5} />
        {score && (
          <span className="pr-1 text-xs font-semibold @3xs:pr-1.5 @3xs:text-sm">
            {score}
          </span>
        )}
      </CardToggle>
      <CardToggle
        label="Bookmarked"
        pressed={bookmarked}
        onPressedChange={onToggleWannaWatch}
        pressedClassName="aria-pressed:bg-primary aria-pressed:text-primary-foreground aria-pressed:hover:bg-primary"
      >
        <Bookmark
          className="size-5 @3xs:size-6"
          fill="currentColor"
          strokeWidth={0}
        />
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
};

// Sizes follow the card's width with container queries (the card has `@container`):
// no prefix = narrow card, @3xs = 256px and wider, @xs = 320px and wider.
// Big things shrink more than small ones: the title goes from 30px to 18px,
// the ratings from 14px to 12px, and the genres stay at 12px so they stay readable.
function MovieInfo({
  titleId,
  title,
  genres,
  imdbScore,
  rottenTomatoesScore,
  opensDetails = false,
}: MovieInfoProps) {
  return (
    // White text straight on the poster: no box, the dark fade (PosterFade) keeps it readable
    // Two groups: ratings, then title + genres. More space between the groups (gap-4)
    // than inside one (gap-2), so the genres clearly belong to the title.
    <div className="relative flex flex-col gap-4 px-3 pt-6 pb-4 text-on-media @3xs:px-4 @3xs:pb-6 @xs:px-5 @xs:pb-8">
      <Ratings
        imdbScore={imdbScore}
        rottenTomatoesScore={rottenTomatoesScore}
      />

      <div className="flex flex-col gap-2">
        <h3
          id={titleId}
          title={title}
          className="font-display text-lg leading-none uppercase @3xs:text-2xl @xs:text-3xl"
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
        {/* Less important than the title: shown in a softer colour, not a tiny size.
            Letter spacing helps small all-caps text read more easily. */}
        <GenreList
          genres={genres}
          max={3}
          className="tracking-wider text-on-media-muted"
        />
      </div>

      {/* Plot hidden for now: the full description is in the details pop-up
      <p className="line-clamp-3 text-sm leading-snug font-medium">
        {synopsis}
      </p> */}
    </div>
  );
}

type RatingsProps = {
  imdbScore: number;
  rottenTomatoesScore: number;
};

// Secondary to the title: normal weight (500) and a smaller size, so the colourful
// logos and the numbers don't compete with it
function Ratings({ imdbScore, rottenTomatoesScore }: RatingsProps) {
  return (
    <p className="flex items-center gap-3 font-mono text-xs font-medium @3xs:gap-4 @xs:gap-5 @xs:text-sm">
      <span className="flex items-center gap-1.5 @3xs:gap-2">
        <ImdbIcon className="size-5 @xs:size-6" />
        <span className="sr-only">IMDb rating </span>
        {imdbScore.toFixed(1)}/10
      </span>
      <span className="flex items-center gap-1.5 @3xs:gap-2">
        <TomatoIcon className="size-5 @3xs:size-6 @xs:size-7" />
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
        // 36px on a narrow card, 44px (the comfortable touch size) from 256px up
        "h-9 min-w-9 cursor-pointer gap-1 rounded-lg border-2 border-border px-2 shadow-brutal-sm @3xs:h-11 @3xs:min-w-11 @3xs:px-2.5",
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
