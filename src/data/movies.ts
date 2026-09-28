import mockMovieData from "./mockData.json";

// Extra facts people look at before choosing a movie. Optional: not every movie has them yet.
type MovieDetails = {
  year?: number;
  /** In minutes */
  runtime?: number;
  director?: string;
  cast?: string[];
};

// The shape of one movie: what the mock data has, plus the optional details above
type Movie = (typeof mockMovieData)[number] & MovieDetails;

const movies: Movie[] = mockMovieData;

export { movies, type Movie, type MovieDetails };
