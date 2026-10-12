import { CatalogueGrid } from "@/components/CatalogueGrid";
import { FilterBar } from "@/components/FilterBar";
import { SiteHeader } from "@/components/SiteHeader";
import type { Movie } from "@/data/movies";

// The movie catalogue: title, filters (preview only) and every movie as a MovieCard.
// The page passes in the movies (from the movie API); Storybook passes mock ones.
function CatalogueView({ movies }: { movies: Movie[] }) {
  return (
    <div className="flex min-h-dvh flex-col">
      <SiteHeader />
      <main className="flex flex-col gap-12 px-6 pb-16 sm:px-10">
        <div className="pt-10">
          <h1 className="font-display text-5xl leading-[1.05] uppercase sm:text-7xl">
            Movie{" "}
            <span className="inline-block -rotate-1 border-3 border-border bg-secondary px-3 text-secondary-foreground shadow-brutal">
              catalogue
            </span>
          </h1>
          <p className="mt-6 max-w-2xl text-lg font-medium sm:text-xl">
            Filter and add movies to your profile to improve your daily
            WannaWatch
          </p>
        </div>
        <FilterBar />
        <CatalogueGrid movies={movies} />
      </main>
    </div>
  );
}

export { CatalogueView };
