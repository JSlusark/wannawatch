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
import { Toggle } from "@/components/ui/toggle";
import { cn } from "@/lib/utils";

import { LiquidRating, ratingLabel, type Rating } from "./BackCard";
import { ImdbIcon, TomatoIcon } from "./RatingIcons";

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
  plot: synopsis,
  imdbScore,
  rottenTomatoesScore,
  posterUrl,
  watched = false,
  bookmarked: bookMarked = false,
  rating,
  onRate,
  onUnwatch,
  onToggleWannaWatch,
  size: size,
}: MovieCardProps) {
  const titleId = useId();
  const [flipped, setFlipped] = useState(false);
  const backRef = useRef<HTMLDivElement>(null);
  const watchedRef = useRef<HTMLButtonElement>(null);
  const isFirstRender = useRef(true);
  const tilt = useTilt();

  // After a flip, move keyboard focus to the side that is now visible
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
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
            className="relative isolate col-start-1 row-start-1 flex aspect-2/3 flex-col justify-end overflow-hidden rounded-2xl border-3 border-foreground bg-muted text-on-media shadow-hard backface-hidden"
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
              synopsis={synopsis}
              imdbScore={imdbScore}
              rottenTomatoesScore={rottenTomatoesScore}
            />
            {/* <Glare
              x={tilt.glare.x}
              y={tilt.glare.y}
              visible={tilt.glare.visible}
            /> */}
          </article>

          {/* BACK: rate the movie. Pre-rotated 180° so it faces you once the card turns */}
          <div
            ref={backRef}
            inert={!flipped}
            className="relative col-start-1 row-start-1 rotate-y-180 backface-hidden"
          >
            <div className="relative isolate size-full overflow-hidden rounded-2xl border-3 border-foreground bg-card shadow-hard">
              {/* key: a new key = a fresh LiquidRating, so each flip starts from the saved
                  score and forgets any unconfirmed draft */}
              <LiquidRating
                key={String(flipped)}
                title={title}
                onConfirm={(score) => {
                  setFlipped(false);
                  onRate?.(score);
                }}
                onCancel={() => setFlipped(false)}
              />
              {/* The back is turned around, so left and right are swapped for the glare */}
              <Glare
                x={100 - tilt.glare.x}
                y={tilt.glare.y}
                visible={tilt.glare.visible}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// How strongly the card leans: bigger number = gentler tilt (same as the reference)
const TILT_SOFTNESS = 80;

// Follows the mouse and returns the tilt transform + where the glare should be
function useTilt() {
  const [state, setState] = useState({
    rotateX: 0,
    rotateY: 0,
    x: 50, // glare position, in % of the card
    y: 50,
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
      x: (x / rect.width) * 100,
      y: (y / rect.height) * 100,
      active: true,
    });
  }

  function onPointerLeave() {
    setState({ rotateX: 0, rotateY: 0, x: 50, y: 50, active: false });
  }

  return {
    onPointerMove,
    onPointerLeave,
    transform: state.active
      ? `rotateX(${state.rotateX}deg) rotateY(${state.rotateY}deg) scale3d(1.05, 1.05, 1.05)`
      : undefined,
    glare: { x: state.x, y: state.y, visible: state.active },
  };
}

// Soft white light that follows the mouse, like light reflecting on glossy paper
function Glare({ x, y, visible }: { x: number; y: number; visible: boolean }) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "pointer-events-none absolute inset-0 transition-opacity duration-200",
        visible ? "opacity-100" : "opacity-0",
      )}
      style={{
        background: `radial-gradient(circle at ${x}% ${y}%, color-mix(in srgb, var(--color-on-media) 15%, transparent), transparent 50%)`,
      }}
    />
  );
}

function Poster({ url }: { url?: string }) {
  if (!url) {
    return (
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 flex flex-col items-center justify-center bg-black/70 pb-[65%] text-muted-foreground"
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

// Keeps white text readable on any poster
function PosterFade() {
  return (
    <div
      aria-hidden="true"
      className="absolute inset-x-0 bottom-0 -z-10 h-3/5 bg-linear-to-t from-media-scrim/85 via-media-scrim/45 to-transparent"
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
    <div className="absolute top-4 right-4 flex gap-2">
      <CardToggle
        ref={watchedRef}
        // The name includes the visible score, so voice users can say what they see
        label={score ? `Watched: ${score}` : "Watched"}
        pressed={watched}
        onPressedChange={onToggleWatched}
        pressedClassName="aria-pressed:bg-secondary aria-pressed:text-secondary-foreground aria-pressed:hover:bg-secondary/85"
      >
        <Check className="size-6" strokeWidth={2.5} />
        {score && <span className="pr-1.5 text-sm font-semibold">{score}</span>}
      </CardToggle>
      <CardToggle
        label="Bookmarked"
        pressed={bookmarked}
        onPressedChange={onToggleWannaWatch}
        pressedClassName="aria-pressed:bg-primary aria-pressed:text-primary-foreground aria-pressed:hover:bg-primary/85"
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
  synopsis: string;
  imdbScore: number;
  rottenTomatoesScore: number;
};

function MovieInfo({
  titleId,
  title,
  genres,
  synopsis,
  imdbScore,
  rottenTomatoesScore,
}: MovieInfoProps) {
  return (
    <div className="flex flex-col px-4 pb-8">
      <Ratings
        imdbScore={imdbScore}
        rottenTomatoesScore={rottenTomatoesScore}
      />

      <h3
        id={titleId}
        title={title}
        className="mt-3 line-clamp-2 text-3xl leading-tight font-bold tracking-tight"
      >
        {title}
      </h3>
      <Genres genres={genres} />

      <p className="mt-3 line-clamp-5 text-sm leading-relaxed font-light">
        {synopsis}
      </p>
    </div>
  );
}

const MAX_GENRES = 3;

function Genres({ genres }: { genres: string[] }) {
  const shown = genres.slice(0, MAX_GENRES);
  const hiddenCount = genres.length - shown.length;

  return (
    <ul aria-label="Genres" className="mt-2 flex flex-wrap gap-3">
      {shown.map((genre) => (
        <Badge
          key={genre}
          render={<li />}
          variant="outline"
          className={genreBadge}
        >
          {genre}
        </Badge>
      ))}
      {hiddenCount > 0 && (
        <Badge render={<li />} variant="outline" className={genreBadge}>
          +{hiddenCount} more
        </Badge>
      )}
    </ul>
  );
}

// No outline, no background, no padding: just the light grey text,
// so the first genre lines up with the title above it
const genreBadge = "border-transparent bg-transparent px-0 text-on-media-muted";

type RatingsProps = {
  imdbScore: number;
  rottenTomatoesScore: number;
};

function Ratings({ imdbScore, rottenTomatoesScore }: RatingsProps) {
  return (
    <p className="flex items-center gap-4 text-xs font-semibold">
      <span className="flex items-center gap-1.5">
        <ImdbIcon />
        <span className="sr-only">IMDb rating </span>
        {imdbScore.toFixed(1)}/10
      </span>
      <span className="flex items-center gap-1.5">
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

// Round white button on top of the poster (a pill when it has text inside).
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
        "h-11 min-w-11 cursor-pointer gap-1 rounded-full px-2.5",
        "bg-media-control text-media-control-icon hover:bg-media-control/85 hover:text-media-control-icon",
        "focus-visible:ring-3 focus-visible:ring-ring motion-reduce:transition-none",
        pressedClassName,
      )}
    >
      {children}
    </Toggle>
  );
}

export { MovieCard };
