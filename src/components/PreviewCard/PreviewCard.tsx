import { useId } from "react";

import {
  MovieInfo,
  Poster,
  PosterFade,
} from "@/components/MovieCard/MovieCard";
import { useCardScale } from "@/components/MovieCard/useCardScale";
import { cn } from "@/lib/utils";

type PreviewCardProps = {
  title: string;
  genres: string[];
  plot: string;
  imdbScore: number;
  rottenTomatoesScore: number;
  posterUrl?: string;
  className?: string;
};

// The front of a MovieCard just to look at: same poster and info,
// but no Watched/Bookmark buttons, no tilt and no flip.
function PreviewCard({
  title,
  genres,
  plot,
  imdbScore,
  rottenTomatoesScore,
  posterUrl,
  className,
}: PreviewCardProps) {
  const titleId = useId();
  const [cardRef, scale] = useCardScale<HTMLElement>();

  return (
    <article
      ref={cardRef}
      aria-labelledby={titleId}
      className={cn(
        "relative isolate flex aspect-2/3 flex-col justify-end overflow-hidden rounded-xl border-3 border-border bg-muted text-on-media",
        className,
      )}
    >
      <Poster url={posterUrl} />
      <PosterFade />
      <MovieInfo
        titleId={titleId}
        title={title}
        genres={genres}
        synopsis={plot}
        imdbScore={imdbScore}
        rottenTomatoesScore={rottenTomatoesScore}
        scale={scale}
      />
    </article>
  );
}

export { PreviewCard };
