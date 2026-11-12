// Check script: shows what the embedding did for one movie, and its most similar movies.
// Run it with `npm run find:similar -- "Arrival"` (the movie title goes after --).

import { count, ilike, isNotNull } from "drizzle-orm";

import { movies } from "@/server/db/schema";
import { movieEmbeddingText } from "@/server/embeddings/movieText";
import { WEIGHTS } from "@/server/embeddings/rankSimilar";
import { findSimilarMovies } from "@/server/embeddings/similarMovies";

import { connectDb } from "./db";

async function main() {
  const title = process.argv[2];
  if (!title) {
    throw new Error('Give a movie title: npm run find:similar -- "Arrival"');
  }
  const { db, close } = connectDb();

  try {
    // 1. Is everything embedded, and by which model?
    const [all] = await db.select({ n: count() }).from(movies);
    const byModel = await db
      .select({ model: movies.embeddingModel, n: count() })
      .from(movies)
      .where(isNotNull(movies.embedding))
      .groupBy(movies.embeddingModel);
    console.log(`Movies in the database: ${all?.n ?? 0}`);
    for (const row of byModel) {
      console.log(`Embedded with ${row.model}: ${row.n}`);
    }

    // 2. The movie: what the model read, and what it gave back
    const [movie] = await db
      .select()
      .from(movies)
      .where(ilike(movies.title, title))
      .limit(1);
    if (!movie) {
      throw new Error(`No movie called "${title}" in the database`);
    }
    if (!movie.embedding) {
      throw new Error(
        `"${movie.title}" has no embedding yet: run npm run db:embed`,
      );
    }
    console.log(`\n${movie.title} (${movie.year})`);
    console.log(`Genres: ${movie.genres.join(", ") || "none"}`);
    console.log(`Text the model read:\n  ${movieEmbeddingText(movie)}`);
    console.log(
      `Vector: ${movie.embedding.length} numbers, starting with ${movie.embedding
        .slice(0, 5)
        .map((n) => n.toFixed(3))
        .join(", ")}…`,
    );

    // 3. The closest movies: closest plots first, then re-ranked with genre overlap
    const similar = await findSimilarMovies(
      db,
      { id: movie.id, embedding: movie.embedding, genres: movie.genres },
      { limit: 10 },
    );
    console.log(
      `\nMost similar (score = ${WEIGHTS.genre} × genre + ${WEIGHTS.plot} × plot, 1 = best):`,
    );
    // Each part of the score is printed too, to see why each one was picked
    for (const m of similar) {
      console.log(`\n  ${m.score.toFixed(2)}  ${m.title} (${m.year})`);
      console.log(
        `        genre ${m.genreOverlap.toFixed(2)} · plot ${m.plotScore.toFixed(2)} (similarity ${m.plotSimilarity.toFixed(2)})`,
      );
      console.log(`        Genres: ${m.genres.join(", ") || "none"}`);
      console.log(`        ${m.plot ?? "No plot"}`);
    }
  } finally {
    await close();
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
