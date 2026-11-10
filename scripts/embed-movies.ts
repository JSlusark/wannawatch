// Embed script: gives every movie without a vector its embedding (384 numbers).
// Run it with `npm run db:embed`. Safe to run again: only movies without a vector are
// picked, so after a new seed it embeds just the new ones.

import { eq, isNull } from "drizzle-orm";

import { movies } from "@/server/db/schema";
import { EMBEDDING_MODEL, embedTexts } from "@/server/embeddings/model";
import { movieEmbeddingText } from "@/server/embeddings/movieText";

import { connectDb } from "./db";

const BATCH_SIZE = 32; // movies sent to the model at once (faster than one by one)

async function main() {
  const { db, close } = connectDb();

  try {
    // Only the columns the text needs, only movies that have no vector yet
    const todo = await db
      .select({
        id: movies.id,
        title: movies.title,
        year: movies.year,
        genres: movies.genres,
        plot: movies.plot,
      })
      .from(movies)
      .where(isNull(movies.embedding));

    console.log(`${todo.length} movies to embed with ${EMBEDDING_MODEL}`);

    for (let start = 0; start < todo.length; start += BATCH_SIZE) {
      const batch = todo.slice(start, start + BATCH_SIZE);
      const vectors = await embedTexts(batch.map(movieEmbeddingText));

      // Save each movie's vector next to the name of the model that made it
      await db.transaction(async (tx) => {
        for (const [i, movie] of batch.entries()) {
          await tx
            .update(movies)
            .set({ embedding: vectors[i], embeddingModel: EMBEDDING_MODEL })
            .where(eq(movies.id, movie.id));
        }
      });

      console.log(
        `${Math.min(start + BATCH_SIZE, todo.length)}/${todo.length} embedded`,
      );
    }
    console.log("Done.");
  } finally {
    await close();
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
