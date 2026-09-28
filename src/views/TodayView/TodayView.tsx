import { SiteHeader } from "@/components/SiteHeader";
import { SwipeDeck } from "@/components/SwipeDeck";
import { movies } from "@/data/movies";

// Today's 10 movies (the mock data has exactly 10 for now)
const TODAYS_MOVIES = movies.slice(0, 10);

// Today's WannaWatch: a pile of 10 cards to swipe through.
function TodayView() {
  return (
    <div className="flex min-h-dvh flex-col">
      <SiteHeader />
      <main className="flex flex-col items-center gap-8 overflow-x-clip px-6 pb-10 sm:px-12">
        <div className="w-full pt-6">
          <h1 className="font-display text-4xl leading-[1.05] uppercase sm:text-5xl">
            Today&apos;s{" "}
            <span className="inline-block rotate-1 border-3 border-border bg-primary px-3 text-primary-foreground shadow-brutal">
              WannaWatch
            </span>
          </h1>
          <p className="mt-3 text-lg font-medium">Your daily wanna watch</p>
        </div>
        <SwipeDeck movies={TODAYS_MOVIES} />
      </main>
    </div>
  );
}

export { TodayView };
