import mockMovieData from "./mockData.json";

export type Movie = {
  title: string;
  imdbScore: number;
  rottenTomatoesScore: number;
  genre: string[]; // can be more tahan 1
  plot: string;
  isWatched: boolean;
  watchScore?: number;
  isBookmarked: boolean;
  image: string;
  year: number;
  runtime?: number;
  director?: string;
  cast?: string[];
};

export const movies: Movie[] = mockMovieData;
// export { movies, type Movie};