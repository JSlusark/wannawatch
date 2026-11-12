import type { Rating } from "@/components/MovieCard";
import type { Movie } from "@/data/movies";
import type { UserMovie, UserMovieChange } from "@/data/userMovies";

// What each button on a MovieCard does to the user's lists. Shared by every place
// that shows MovieCards (the grids and the movie page), so they all behave the same.
function cardActions(
  movie: Movie,
  userMovie: UserMovie | undefined,
  update: (movie: Movie, change: UserMovieChange) => void,
) {
  return {
    onRate: (rating: Rating) => update(movie, { watched: true, rating }),
    onUnwatch: () => update(movie, { watched: false, rating: undefined }),
    onToggleBookmark: () =>
      update(movie, { bookmarked: !userMovie?.bookmarked }),
  };
}

export { cardActions };
