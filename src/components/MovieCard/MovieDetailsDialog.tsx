import { Dialog } from "@base-ui/react/dialog";
import { X } from "lucide-react";
import Image from "next/image";

import { GenreList } from "@/components/movie/GenreList";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Movie } from "@/data/movies";

import { ImdbIcon, NoScore, TomatoIcon } from "@/components/movie/Ratings";

// <MovieDetailsDialog
//   open={detailsOpen}
//   onOpenChange={setDetailsOpen}
//   title={movie.title}
//   genres={movie.genre}
//   plot={movie.plot}
//   imdbScore={movie.imdbScore}
//   rottenTomatoesScore={movie.rottenTomatoesScore}
//   posterUrl={movie.image}
//   // details={details}
// />

type MovieDetailsProps = {
  title: string;
  genres: string[];
  plot: string;
  imdbScore: number | null;
  rottenTomatoesScore: number | null;
  posterUrl?: string | null;
  details?: Movie;
};

type MovieDetailsDialogProps = MovieDetailsProps & {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

function formatRuntime(minutes: number) {
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return hours > 0 ? `${hours}h ${rest}min` : `${rest}min`;
}

// Everything you'd want to know about a movie. Used in the pop-up (inDialog, with the
// poster) and next to the deck on the Daily Picks page (plain, no boxes).
function MovieDetailsContent({
  inDialog = false,
  title,
  genres,
  plot,
  imdbScore,
  rottenTomatoesScore,
  posterUrl,
  details,
}: MovieDetailsProps & { inDialog?: boolean }) {
  const facts = [
    details?.year ? String(details.year) : undefined,
    details?.runtime ? formatRuntime(details.runtime) : undefined,
  ].filter(Boolean);
  const titleClass = cn(
    "font-display leading-none uppercase",
    inDialog ? "text-3xl" : "text-4xl sm:text-5xl",
  );

  return (
    <>
      <div className="flex gap-5">
        {inDialog && posterUrl && (
          <div className="relative hidden aspect-2/3 w-32 shrink-0 self-start overflow-hidden rounded-lg border-2 border-border sm:block">
            <Image
              src={posterUrl}
              alt=""
              fill
              sizes="8rem"
              className="object-cover"
            />
          </div>
        )}
        <div className={cn("flex min-w-0 flex-col gap-3", inDialog && "pr-12")}>
          {inDialog ? (
            <Dialog.Title className={titleClass}>{title}</Dialog.Title>
          ) : (
            <h2 className={titleClass}>{title}</h2>
          )}
          {facts.length > 0 && (
            <p className="font-mono text-sm font-bold uppercase">
              {facts.join(" · ")}
            </p>
          )}
          <GenreList genres={genres} />
          <p className="flex items-center gap-5 font-mono text-base font-bold">
            <span className="flex items-center gap-2">
              <ImdbIcon />
              <span className="sr-only">IMDb rating </span>
              {imdbScore === null ? <NoScore /> : `${imdbScore.toFixed(1)}/10`}
            </span>
            <span className="flex items-center gap-2">
              <TomatoIcon />
              <span className="sr-only">Rotten Tomatoes score </span>
              {rottenTomatoesScore === null ? (
                <NoScore />
              ) : (
                `${rottenTomatoesScore}%`
              )}
            </span>
          </p>
        </div>
      </div>

      {inDialog ? (
        <Dialog.Description className="mt-5 text-base leading-relaxed">
          {plot}
        </Dialog.Description>
      ) : (
        <p className="mt-5 max-w-xl text-lg leading-relaxed">{plot}</p>
      )}

      {(details?.director || details?.cast?.length) && (
        <dl className="mt-5 grid gap-3">
          {details.director && (
            <div>
              <dt className="font-mono text-xs font-bold uppercase">
                Director
              </dt>
              <dd className="font-medium">{details.director}</dd>
            </div>
          )}
          {details.cast && details.cast.length > 0 && (
            <div>
              <dt className="font-mono text-xs font-bold uppercase">Cast</dt>
              <dd className="font-medium">{details.cast.join(", ")}</dd>
            </div>
          )}
        </dl>
      )}
    </>
  );
}

// The pop-up with everything you'd want to know before picking a movie.
// Base UI's Dialog handles the hard parts: focus stays inside while it's open,
// Escape closes it, and focus goes back to where you were.
function MovieDetailsDialog({
  open,
  onOpenChange,
  title,
  genres,
  plot,
  imdbScore,
  rottenTomatoesScore,
  posterUrl,
  details,
}: MovieDetailsDialogProps) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 z-50 bg-ink/70 motion-safe:transition-opacity motion-safe:duration-150 data-ending-style:opacity-0 data-starting-style:opacity-0" />
        <Dialog.Popup className="fixed top-1/2 left-1/2 z-50 max-h-[85dvh] w-[min(92vw,38rem)] -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-xl border-3 border-border bg-card p-6 text-card-foreground shadow-brutal-lg outline-none motion-safe:transition-[opacity,scale] motion-safe:duration-150 data-ending-style:scale-95 data-ending-style:opacity-0 data-starting-style:scale-95 data-starting-style:opacity-0">
          <Dialog.Close
            render={
              <Button
                variant="outline"
                size="icon"
                aria-label="Close"
                className="absolute top-4 right-4"
              />
            }
          >
            <X strokeWidth={3} />
          </Dialog.Close>

          <MovieDetailsContent
            inDialog
            title={title}
            genres={genres}
            plot={plot}
            imdbScore={imdbScore}
            rottenTomatoesScore={rottenTomatoesScore}
            posterUrl={posterUrl}
            details={details}
          />
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

export { MovieDetailsContent, MovieDetailsDialog };
