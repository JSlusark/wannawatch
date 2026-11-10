"use client";

import { useRef, type Ref } from "react";

import { BookmarkButton } from "@/components/movie/BookmarkButton";
import { MovieInfo } from "@/components/movie/MovieInfo";
import { Poster } from "@/components/movie/Poster";
import { WatchedButton } from "@/components/movie/WatchedButton";
import type { Movie } from "@/data/movies";
import type { UserMovie } from "@/data/userMovies";

import type { Rating } from "./BackCard";

type FrontCardProps = {
  movie: Movie;
  /** Missing = not watched, not bookmarked */
  userMovie?: UserMovie;
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
  userMovie,
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
        // clicking the card opens the movie details in a toaster
      }}
      className="@container relative isolate col-start-1 row-start-1 flex cursor-pointer aspect-2/3 flex-col justify-end overflow-hidden rounded-xl border-3 border-border bg-muted text-on-media backface-hidden"
    >
      <Poster url={movie.image} />
      <CardButtons
        watched={userMovie?.watched ?? false}
        rating={userMovie?.rating ?? null}
        watchedRef={watchedRef}
        bookmarked={userMovie?.bookmarked ?? false}
        onToggleWatched={onToggleWatch}
        onToggleBookmark={onToggleBookmark}
      />
      <MovieInfo
        titleId={titleId}
        title={movie.title}
        genres={movie.genre}
        imdbScore={movie.imdbScore}
        rottenTomatoesScore={movie.rottenTomatoesScore}
      />
    </article>
  );
}

type CardButtonsProps = {
  watched: boolean;
  rating: Rating | null;
  watchedRef: Ref<HTMLButtonElement>;
  bookmarked: boolean;
  onToggleWatched?: () => void;
  onToggleBookmark?: () => void;
};

// CardButtons: the Watched and Bookmark buttons on top of the poster
function CardButtons({
  watched,
  rating,
  watchedRef,
  bookmarked,
  onToggleWatched,
  onToggleBookmark,
}: CardButtonsProps) {
  return (
    <div className="@container sticker-size on-media-ink absolute inset-x-3 top-3 flex items-center justify-end gap-2 @3xs:inset-x-4 @3xs:top-4 @xs:inset-x-5 @xs:top-5">
      <WatchedButton
        ref={watchedRef}
        isWatched={watched}
        watchScore={rating}
        onToggle={onToggleWatched}
      />
      <BookmarkButton bookmarked={bookmarked} onToggle={onToggleBookmark} />
    </div>
  );
}

export { FrontCard };
