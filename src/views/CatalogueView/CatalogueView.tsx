import { CatalogueGrid } from "@/components/CatalogueGrid";
import { FilterBar } from "@/components/FilterBar";
import { SiteHeader } from "@/components/SiteHeader";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import type { MoviePage } from "@/data/movies";
import type { SaveUserMovie, UserMovies } from "@/data/userMovies";

type CatalogueViewProps = MoviePage & {
  /** What the user already marked, so the cards open with the right state */
  userMovies?: UserMovies;
  /** Where each mark is saved (the server's mock library). Storybook leaves it out */
  save?: SaveUserMovie;
};

// The address of one catalogue page. Page 1 is just /catalogue, without "?page=1"
function pageHref(page: number) {
  return page === 1 ? "/catalogue" : `/catalogue?page=${page}`;
}

// The movie catalogue: title, filters (preview only), one page of movies as MovieCards,
// and links to the pages before and after.
// The page passes in the movies (from the movie API); Storybook passes mock ones.
function CatalogueView({
  movies,
  page,
  totalPages,
  userMovies,
  save,
}: CatalogueViewProps) {
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
        <CatalogueGrid
          movies={movies}
          initialUserMovies={userMovies}
          save={save}
        />

        {totalPages > 1 && (
          <Pagination>
            {/* Three columns: Previous on the left, "Page x of y" in the middle, Next on
                the right. The side columns stay even when a link is missing, so the
                middle text never jumps */}
            <PaginationContent className="grid w-full max-w-md grid-cols-[1fr_auto_1fr] gap-4">
              <PaginationItem className="justify-self-start">
                {/* No "Previous" on the first page: a link that goes nowhere would
                    still be read out and reachable with Tab */}
                {page > 1 && <PaginationPrevious href={pageHref(page - 1)} />}
              </PaginationItem>
              <PaginationItem>
                <p className="font-mono text-sm font-bold uppercase tabular-nums">
                  Page {page} of {totalPages}
                </p>
              </PaginationItem>
              <PaginationItem className="justify-self-end">
                {page < totalPages && (
                  <PaginationNext href={pageHref(page + 1)} />
                )}
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        )}
      </main>
    </div>
  );
}

export { CatalogueView };
