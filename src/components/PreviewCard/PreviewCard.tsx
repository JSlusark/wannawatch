import { useId } from "react";

import { MovieInfo } from "@/components/movie/MovieInfo";
import { Poster, PosterLowOverlay } from "@/components/movie/Poster";
import { cn } from "@/lib/utils";

type PreviewCardProps = {
  title: string;
  genres: string[];
  plot: string;
  imdbScore: number | null;
  rottenTomatoesScore: number | null;
  posterUrl?: string | null;
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

  return (
    // @container: MovieInfo picks its text sizes from this card's width
    <article
      aria-labelledby={titleId}
      className={cn(
        "@container relative isolate flex aspect-2/3 flex-col justify-end overflow-hidden rounded-xl border-3 border-border bg-muted text-on-media",
        className,
      )}
    >
      <Poster url={posterUrl} />
      <PosterLowOverlay />
      <MovieInfo
        titleId={titleId}
        title={title}
        genres={genres}
        imdbScore={imdbScore}
        rottenTomatoesScore={rottenTomatoesScore}
      />
    </article>
  );
}

export { PreviewCard };
