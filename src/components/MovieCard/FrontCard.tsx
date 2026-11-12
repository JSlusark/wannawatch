"use client";

import Link from "next/link";
import type { Ref } from "react";

import { BookmarkButton } from "@/components/movie/BookmarkButton";
import { MovieInfo } from "@/components/movie/MovieInfo";
import { Poster } from "@/components/movie/Poster";
import { WatchedButton } from "@/components/movie/WatchedButton";
import type { Movie } from "@/data/movies";
import type { UserMovie } from "@/data/userMovies";
import { cn } from "@/lib/utils";

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
  /** Where clicking the card goes (the movie's page). Missing = the card isn't a link */
  href?: string;
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
  href,
}: FrontCardProps) {
  return (
    <article
      inert={inert}
      aria-labelledby={titleId}
      className={cn(
        "@container relative isolate col-start-1 row-start-1 flex aspect-2/3 flex-col justify-end overflow-hidden rounded-xl border-3 border-border bg-muted text-on-media backface-hidden",
        // Keyboard focus on the card's link: the ring goes around the whole card, with a
        // gap, like the buttons' ring (inside it would get lost on a dark poster)
        "has-[>a:focus-visible]:ring-3 has-[>a:focus-visible]:ring-ring has-[>a:focus-visible]:ring-offset-2 has-[>a:focus-visible]:ring-offset-background",
      )}
    >
      <Poster url={movie.image} />
      {href && (
        // A "stretched link": an empty link that covers the whole card, so clicking
        // anywhere opens the movie. Buttons can't go inside a link (invalid HTML, and
        // screen readers get confused), so the Watched and Bookmark buttons come later
        // and sit on top of it. Its name is the movie title (aria-labelledby).
        // Its focus ring is drawn by the card itself (see the article's classes).
        <Link
          href={href}
          aria-labelledby={titleId}
          className="absolute inset-0 outline-none"
        />
      )}
      <CardButtons
        watched={userMovie?.watched ?? false}
        rating={userMovie?.rating ?? null}
        watchedRef={watchedRef}
        bookmarked={userMovie?.bookmarked ?? false}
        onToggleWatched={onToggleWatch}
        onToggleBookmark={onToggleBookmark}
      />
      <MovieInfo
        // The text sits on top of the link: let clicks fall through to it
        className={href && "pointer-events-none"}
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
