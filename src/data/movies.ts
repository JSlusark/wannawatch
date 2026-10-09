import mockMovieData from "./mockData.json";

// The only scores a watched movie can have: from "Loved it" (2) to "Hated it" (-2)
export type WatchScore = 2 | 1 | 0 | -1 | -2;

export type Movie = {
  title: string;
  imdbScore: number;
  rottenTomatoesScore: number;
  genre: string[]; // can be more tahan 1
  plot: string;
  isWatched: boolean;
  watchScore: WatchScore | null; // null = not watched, so no score
  isBookmarked: boolean;
  image: string;
  year: number;
  runtime?: number;
  director?: string;
  cast?: string[];
};

// JSON numbers are always read as plain `number`, so this is the one place where we
// tell TypeScript the file matches the Movie type
export const movies = mockMovieData as Movie[];
// export { movies, type Movie};