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
import { SiteHeader } from "@/components/SiteHeader";
import type { Movie } from "@/data/movies";
import type { SaveUserMovie, UserMovies } from "@/data/userMovies";

type MovieViewProps = {
  movie: Movie;
  /** What the user already marked, so the card opens with the right state */
  userMovies?: UserMovies;
  /** Where each mark is saved (the server's mock library). Storybook leaves it out */
  save?: SaveUserMovie;
};

// One movie's page: laid out like the Daily 10 (card on the left, details on the
// right), but with a single normal card: no pile and no swiping, just its Watched and
// Bookmark buttons.
function MovieView({ movie, userMovies: initial, save }: MovieViewProps) {
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
      </main>
    </div>
  );
}

export { MovieView };
