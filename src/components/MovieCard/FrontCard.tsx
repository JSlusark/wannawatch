"use client";

import { Bookmark, Check, Film } from "lucide-react";
import Image from "next/image";
import { useRef, type ReactNode, type Ref } from "react";

import { GenreList } from "@/components/GenreList";
import { Toggle } from "@/components/ui/toggle";
import type { Movie } from "@/data/movies";
import { cn } from "@/lib/utils";

import { ratingLabel, type Rating } from "./BackCard";
import { ImdbIcon, TomatoIcon } from "./RatingIcons";
import { StickerIcon, stickerButton } from "./StickerIcon";

type FrontCardProps = {
  movie: Movie;
  titleId: string;
  /** true while the card shows its back: the front can't be clicked or tabbed to */
  inert: boolean;
  watchedRef: Ref<HTMLButtonElement>;
  onToggleWatch: () => void;
  onToggleBookmark?: () => void;
};

// FRONT: poster, Watched and Bookmark buttons, ratings, title and genres
function FrontCard({
  movie,
  titleId,
  inert,
  watchedRef,
  onToggleWatch,
  onToggleBookmark,
}: FrontCardProps) {
  // Where the pointer went down, to tell a tap from the start of a swipe
  const pressedAt = useRef({ x: 0, y: 0 });

  return (
    <article
      inert={inert}
      aria-labelledby={titleId}
      onPointerDown={(e) => {
        pressedAt.current = { x: e.clientX, y: e.clientY };
      }}
      onClick={(e) => {
        // clicking the card sends card data to the homepage
      }}
      className="@container relative isolate col-start-1 row-start-1 flex cursor-pointer aspect-2/3 flex-col justify-end overflow-hidden rounded-xl border-3 border-border bg-muted text-on-media backface-hidden"
    >
      <Poster url={movie.image} />
      <CardActions
        watched={movie.isWatched}
        // The data stores a plain number; the card only knows the 5 rating levels
        rating={movie.watchScore as Rating | undefined}
        watchedRef={watchedRef}
        bookmarked={movie.isBookmarked}
        onToggleWatch={onToggleWatch}
        onToggleBookmark={onToggleBookmark}
      />
      <MovieInfo
        titleId={titleId}
        title={movie.title}
        genres={movie.genre}
        imdbScore={movie.imdbScore}
        rottenTomatoesScore={movie.rottenTomatoesScore}
        opensDetails
      />
    </article>
  );
}

// A dark fade over the bottom of the poster so the white text is readable on any picture.
// The one place we allow a gradient: it's a readability layer, not decoration.
function PosterLowOverlay() {
  return (
    <div
      aria-hidden="true"
      className="absolute inset-x-0 bottom-0 h-4/5 bg-linear-to-t from-media-scrim/65  to-transparent"
    />
  );
}

// A bright fade from the top of the poster, behind the Watched and Bookmark buttons, so
// their black outlines stand out on any picture (the bright twin of PosterFade).
function PosterTopOverlay() {
  return (
    <div
      aria-hidden="true"
      className="absolute inset-x-0 top-0 h-1/3 bg-linear-to-b from-media-glow/20 via-media-glow/10 to-transparent"
    />
  );
}

function Poster({ url }: { url?: string }) {
  if (!url) {
    return (
      // Centred in the top half, the part that the movie info doesn't cover
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-gray-300 text-ink"
      >
        <div className="flex h-full flex-col items-center justify-center gap-2 text-gray-400">
          {/* Icon at its normal size inside a circle: a 24px icon blown up to 48px looks chunky */}
          <span className="grid size-12 place-items-center ">
            <Film className="size-16  " />
          </span>
          <p className="text-xl  p-5 font-medium">Image not found</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Image
        src={url}
        alt=""
        fill
        sizes="(min-width: 768px) 22rem, 100vw"
        className="-z-10 object-cover"
      />
      <PosterTopOverlay />
      <PosterLowOverlay />
    </div>
  );
}

type CardActionsProps = {
  watched: boolean;
  rating?: Rating;
  watchedRef: Ref<HTMLButtonElement>;
  bookmarked: boolean;
  onToggleWatch?: () => void;
  onToggleBookmark?: () => void;
};

// Colour of the Watched check and its score text once the movie has a score.
// The movies you liked should jump out when you scan a list, so "Loved it!" and
// "Liked it" are hot pink. Every other score is the brand purple.
// The score's text is always shown next to the check, so colour is never the only clue.
const SCORE_COLOR: Record<Rating, string> = {
  2: "text-pink-500",
  1: "text-pink-500",
  0: "text-secondary",
  [-1]: "text-secondary",
  [-2]: "text-secondary",
};

// Together the check and the bookmark take about half the card's width.
// The size itself (48px, 56px from 256px, 72px from 320px) is --sticker-size, set by the
// `sticker-size` utility on the buttons' wrapper, so the score text can match the border.
const stickerSize = "size-(--sticker-size)";

/* 
CardActions: BookMark and Watched buttons on top of the poster.
The Watched button shows the score if active.
*/
function CardActions({
  watched,
  rating,
  watchedRef,
  bookmarked,
  onToggleWatch,
  onToggleBookmark,
}: CardActionsProps) {
  // Only a watched movie shows its score (e.g. "✓ I liked it")
  const score =
    watched && rating !== undefined ? ratingLabel(rating) : undefined;

  return (
    // A row across the top of the card, with the same side distance as the movie info.
    // @container: the row is a container, so the icon and text sizes can be worked out
    // from its width (see sticker-size and sticker-text-size in globals.css).
    // Not rated: both icons sit on the right (justify-end).
    // on-media-ink: black outlines and shadows, even in dark mode (the poster doesn't change)
    <div className="@container sticker-size on-media-ink absolute inset-x-3 top-3 flex items-center justify-end gap-2 @3xs:inset-x-4 @3xs:top-4 @xs:inset-x-5 @xs:top-5">
      <CardToggle
        ref={watchedRef}
        // The name includes the visible score, so voice users can say what they see
        label={score ? `Watched: ${score}` : "Watched"}
        pressed={watched}
        onPressedChange={onToggleWatch}
        // Rated: the check and its score are one button that stretches over all the
        // space left of the bookmark (flex-1), with the text right after the check
        className={cn(score && "min-w-0 flex-1 justify-start")}
      >
        <StickerIcon
          icon={Check}
          variant="default"
          // Not watched: white. Watched: the score's colour
          // (purple too if it was marked watched without a score)
          color={
            !watched
              ? "text-on-media"
              : rating === undefined
                ? "text-secondary"
                : SCORE_COLOR[rating]
          }
          className={cn(stickerSize)}
        />
        {score && rating !== undefined && (
          // Sticker text: coloured letters with the same black border as the icons on every
          // side (sticker-outline), no box behind them. Always on the check's line:
          // whitespace-nowrap never breaks it, and sticker-text-size makes it as big as the
          // check but never wider than the space left on the row.
          <span
            className={cn(
              "font-display leading-none whitespace-nowrap uppercase sticker-text-size sticker-outline",
              // The thick border makes the letters sit on black: pink-500 is 6.7:1 there,
              // but purple-500 only 3.3:1, so purple text uses the lighter 400 (5.9:1)
              rating >= 1 ? "text-pink-500" : "text-purple-400",
            )}
          >
            {score}
          </span>
        )}
      </CardToggle>
      <CardToggle
        label="Bookmarked"
        pressed={bookmarked}
        onPressedChange={onToggleBookmark}
      >
        <StickerIcon
          icon={Bookmark}
          variant="highlight"
          color={bookmarked ? "text-primary" : "text-on-media"}
          className={cn(stickerSize)}
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
  /** Extra classes, e.g. to lay out an icon and its text */
  className?: string;
  children: ReactNode;
};

// On/off button on top of the poster. It has no box of its own: the sticker icon inside
// is what you see (the pressed state shows as the icon's colour). The invisible button
// around it is the icon plus a little padding, so it's at least 40px to tap.
// Toggle sets aria-pressed so screen readers know whether it's on or off.
function CardToggle({
  ref,
  label,
  pressed,
  onPressedChange,
  className,
  children,
}: CardToggleProps) {
  return (
    <Toggle
      ref={ref}
      aria-label={label}
      pressed={pressed}
      onPressedChange={onPressedChange}
      className={cn(
        // min-w-0: the width is exactly icon + padding, which the size maths in
        // globals.css (sticker-size) counts on; min-h-10 keeps it at least 40px tall to tap
        "h-auto min-h-10 min-w-0 gap-2 rounded-lg p-0.5",
        // Toggle's own grey hover and pressed backgrounds are switched off
        "bg-transparent hover:bg-transparent aria-pressed:bg-transparent",
        stickerButton,
        className,
      )}
    >
      {children}
    </Toggle>
  );
}

export { FrontCard };
// Shared with PreviewCard, which shows the same front without buttons or motion
export { MovieInfo, Poster, PosterLowOverlay as PosterFade };
