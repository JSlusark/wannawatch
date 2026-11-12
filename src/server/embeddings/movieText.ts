// The recipe for the text the model reads for one movie. Every movie must go through
// this same function, so all vectors are made the same way and can be compared.
// If this recipe changes, re-embed every movie: npm run db:embed -- --all
//
// Only the plot goes in, so the vector answers one question: "is the story similar?"
// - The title stays out: the model matched shared title words ("Big Fish" → "Big",
//   "Spirited Away" → "Away") instead of similar stories.
// - The genres stay out: they are exact labels, so they are compared with plain math
//   instead (genreOverlap in rankSimilar.ts), where I choose how much they count.
// - The year stays out: era is a separate choice (the year filter), not meaning.
// The few movies with no plot fall back to title and genres, so they still get a vector.
type MovieForText = {
  title: string;
  genres: string[];
  plot: string | null;
};

// → "A linguist works with the military to communicate with alien lifeforms…"
export function movieEmbeddingText(movie: MovieForText): string {
  const plot = movie.plot?.trim();
  if (plot) return plot;

  const genres = movie.genres.length
    ? ` Genres: ${movie.genres.join(", ")}.`
    : "";
  return `${movie.title}.${genres}`;
}
