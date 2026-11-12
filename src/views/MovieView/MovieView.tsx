"use client";

import { cardActions } from "@/components/CatalogueGrid";
// The hook comes from its own file, not the index: the index is also imported by
// Server Components (the catalogue), and a hook can't load there
import { useUserMovies } from "@/components/CatalogueGrid/useUserMovies";
import { MovieCard, MovieDetailsContent } from "@/components/MovieCard";
import {
  MovieSpotlight,
  SPOTLIGHT_CARD_SIZE,
} from "@/components/MovieSpotlight";
import { SimilarMovies } from "@/components/SimilarMovies";
import { SiteHeader } from "@/components/SiteHeader";
import type {
  Movie,
  SimilarMovies as SimilarMoviesResult,
} from "@/data/movies";
import type { SaveUserMovie, UserMovies } from "@/data/userMovies";

type MovieViewProps = {
  movie: Movie;
  /** The 10 most similar movies (from the vector search), shown under the details */
  similar: SimilarMoviesResult;
  /** What the user already marked, so the card opens with the right state */
  userMovies?: UserMovies;
  /** Where each mark is saved (the server's mock library). Storybook leaves it out */
  save?: SaveUserMovie;
};

// One movie's page: laid out like the Daily 10 (card on the left, details on the
// right), but with a single normal card: no pile and no swiping, just its Watched and
// Bookmark buttons. Under it, the most similar movies as clickable cards.
function MovieView({
  movie,
  similar,
  userMovies: initial,
  save,
}: MovieViewProps) {
  // One record for the big card and the recommendations, so they always agree
  const { userMovies, update } = useUserMovies(initial, save);
  const userMovie = userMovies[movie.id];

  return (
    <div className="flex min-h-dvh flex-col">
      <SiteHeader />
      <main className="flex flex-col gap-16 overflow-x-clip px-6 py-12 sm:px-12">
        <MovieSpotlight
          card={
            <MovieCard
              movie={movie}
              userMovie={userMovie}
              {...cardActions(movie, userMovie, update)}
              size={SPOTLIGHT_CARD_SIZE}
            />
          }
        >
          <MovieDetailsContent
            titleAs="h1"
            title={movie.title}
            genres={movie.genre}
            plot={movie.plot}
            imdbScore={movie.imdbScore}
            rottenTomatoesScore={movie.rottenTomatoesScore}
            details={movie}
          />
        </MovieSpotlight>

        <SimilarMovies
          similar={similar}
          userMovies={userMovies}
          onUpdate={update}
        />
      </main>
    </div>
  );
}

export { MovieView };
