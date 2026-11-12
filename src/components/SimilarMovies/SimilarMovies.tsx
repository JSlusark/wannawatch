import { CatalogueGrid } from "@/components/CatalogueGrid";
import type {
  Movie,
  SimilarMovies as SimilarMoviesResult,
} from "@/data/movies";
import type { UserMovieChange, UserMovies } from "@/data/userMovies";

type SimilarMoviesProps = {
  similar: SimilarMoviesResult;
  /** Shared with the page's big card, so the same movie is never marked two ways */
  userMovies: UserMovies;
  onUpdate: (movie: Movie, change: UserMovieChange) => void;
};

// 5 cards per row on a wide screen (10 movies = two even rows), 2 on a phone: each card
// at least 9.8rem wide, like the profile's panels, so a phone isn't one huge card per row
const GRID =
  "grid-cols-[repeat(auto-fill,minmax(max(9.8rem,calc((100%_-_6rem)/5)),1fr))] gap-x-6 gap-y-8 max-sm:gap-x-4";

// What to say when there are no cards to show
const EMPTY_MESSAGE = {
  "not-in-database":
    "No recommendations for this movie yet: it isn't in the recommendations database.",
  unavailable: "Recommendations can't load right now. Try again in a moment.",
} as const;

// "More like this": the movies most similar to the one on the page, as normal cards.
// Each card opens its own movie page, so you can keep hopping from movie to movie
// (a new page each time, never a pop-up on top of a pop-up).
function SimilarMovies({ similar, userMovies, onUpdate }: SimilarMoviesProps) {
  return (
    // Same width as the spotlight above, so the left edges line up
    <section
      aria-labelledby="similar-heading"
      className="mx-auto flex w-full max-w-5xl flex-col gap-6"
    >
      <div>
        <h2
          id="similar-heading"
          className="font-display text-2xl uppercase sm:text-3xl"
        >
          More like this
        </h2>
        <p className="text-muted-foreground">Closest story and genres first</p>
      </div>

      {similar.status === "ok" && similar.movies.length > 0 ? (
        <CatalogueGrid
          movies={similar.movies}
          userMovies={userMovies}
          onUpdate={onUpdate}
          className={GRID}
        />
      ) : (
        <p className="font-medium">
          {similar.status === "ok"
            ? "No similar movies found."
            : EMPTY_MESSAGE[similar.status]}
        </p>
      )}
    </section>
  );
}

export { SimilarMovies };
