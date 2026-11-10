// The recipe for the text the model reads for one movie. Every movie must go through
// this same function, so all vectors are made the same way and can be compared.
// Only these fields carry meaning: ids, poster addresses and ratings stay out.
type MovieForText = {
  title: string;
  year: number | null;
  genres: string[];
  plot: string | null;
};

// → "Arrival (2016). Genres: Drama, Science Fiction. A linguist works with…"
export function movieEmbeddingText(movie: MovieForText): string {
  const title = movie.year ? `${movie.title} (${movie.year})` : movie.title;
  const genres = movie.genres.length
    ? ` Genres: ${movie.genres.join(", ")}.`
    : "";
  const plot = movie.plot ? ` ${movie.plot}` : "";
  return `${title}.${genres}${plot}`;
}
