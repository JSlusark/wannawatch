import { cardActions } from "@/components/CatalogueGrid";
import { DragRow } from "@/components/DragRow";
import { MovieCard } from "@/components/MovieCard";
import type {
  Movie,
  SimilarMovies as SimilarMoviesResult,
} from "@/data/movies";
import type { UserMovieChange, UserMovies } from "@/data/userMovies";
import { movieHref } from "@/lib/routes";

type SimilarMoviesProps = {
  similar: SimilarMoviesResult;
  /** Shared with the page's big card, so the same movie is never marked two ways */
  userMovies: UserMovies;
  onUpdate: (movie: Movie, change: UserMovieChange) => void;
};

// What to say when there are no cards to show
const EMPTY_MESSAGE = {
  "not-in-database":
    "No recommendations for this movie yet: it isn't in the recommendations database.",
  unavailable: "Recommendations can't load right now. Try again in a moment.",
} as const;

// "More like this": the movies most similar to the one on the page, as normal cards in
// one row you drag sideways (3 in view).
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
      </div>

      {similar.status === "ok" && similar.movies.length > 0 ? (
        <DragRow>
          {similar.movies.map((movie) => {
            const userMovie = userMovies[movie.id];
            return (
              <MovieCard
                key={movie.id}
                movie={movie}
                userMovie={userMovie}
                {...cardActions(movie, userMovie, onUpdate)}
                href={movieHref(movie.id)}
                size="w-full"
              />
            );
          })}
        </DragRow>
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
