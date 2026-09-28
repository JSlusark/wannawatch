import { Logo } from "@/components/Logo";
import { ShuffleStack } from "@/components/ShuffleStack";
import { Button } from "@/components/ui/button";
import { movies } from "@/data/movies";
import { cn } from "@/lib/utils";

// Five different posters for the shuffling pile
const PREVIEW_MOVIES = movies.slice(0, 5);

// Words repeated in the band at the bottom (decoration only)
const BAND_WORDS = ["Swipe", "Watch", "Rate", "Repeat"];

// The welcome (hero) page: big title on the left, a shuffling pile of movie cards on the right.
function WelcomeView() {
  return (
    <div className="flex min-h-dvh flex-col overflow-x-clip">
      <header className="px-6 py-3 sm:px-12">
        <Logo />
      </header>

      <main className="grid flex-1 items-center gap-16 px-6 py-16 sm:px-12 lg:grid-cols-[1.2fr_1fr]">
        <div className="flex flex-col items-start gap-8">
          <h1 className="font-display text-6xl leading-[1.05] uppercase sm:text-7xl xl:text-8xl">
            Make your{" "}
            <span className="inline-block -rotate-2 border-3 border-border bg-secondary px-3 text-secondary-foreground shadow-brutal">
              next watch
            </span>{" "}
            based on{" "}
            <span className="inline-block rotate-1 border-3 border-border bg-primary px-3 text-primary-foreground shadow-brutal">
              you
            </span>
          </h1>
          <p className="max-w-xl text-xl font-medium sm:text-2xl">
            Find daily movie recommendations based on what you like, in just a
            single tap.
          </p>
          {/* Signup / Login pages aren't built yet, so these buttons don't go anywhere */}
          <div className="flex flex-wrap gap-5">
            <Button size="lg" className="h-14 px-10 text-lg">
              Signup
            </Button>
            <Button size="lg" variant="outline" className="h-14 px-10 text-lg">
              Login
            </Button>
          </div>
        </div>

        <div className="relative">
          {/* Flat decorative shapes behind the pile */}
          <Star className="absolute -top-8 -left-6 size-24 fill-orange" />
          <span
            aria-hidden="true"
            className="absolute -right-4 bottom-16 size-20 rounded-full border-3 border-border bg-pink"
          />
          <ShuffleStack movies={PREVIEW_MOVIES} className="relative" />
        </div>
      </main>

      {/* A band of words, like a sticker strip. Decoration only. */}
      <div
        aria-hidden="true"
        className="flex gap-8 overflow-hidden border-y-2 border-border bg-primary py-3 font-display text-2xl whitespace-nowrap text-primary-foreground uppercase"
      >
        {Array.from({ length: 3 }).flatMap((_, round) =>
          BAND_WORDS.map((word) => (
            <span key={`${round}-${word}`} className="flex items-center gap-8">
              {word}
              <Star className="size-6 fill-ink" />
            </span>
          )),
        )}
      </div>
    </div>
  );
}

// An 8-point star with an outline (a raw shape, like the ones in neobrutalist posters)
function Star({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className={cn("stroke-ink", className)}
      strokeWidth="1.5"
      strokeLinejoin="round"
    >
      <path d="M12 1l2.6 5.6L20 4.5l-1.5 5.9L23.5 12l-5 1.6 1.5 5.9-5.4-2.1L12 23l-2.6-5.6L4 19.5l1.5-5.9L.5 12l5-1.6L4 4.5l5.4 2.1z" />
    </svg>
  );
}

export { WelcomeView };
