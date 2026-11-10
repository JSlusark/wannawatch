import {
  pipeline,
  type FeatureExtractionPipeline,
} from "@huggingface/transformers";

// The embedding model: small, free, runs on this computer. It's downloaded once (about
// 23 MB) and kept in node_modules/@huggingface/transformers/.cache/.
// Saved next to every vector (movies.embedding_model): vectors from different models
// can't be compared, so if this ever changes, every movie must be embedded again.
export const EMBEDDING_MODEL = "Xenova/all-MiniLM-L6-v2";

// Loading the model takes a few seconds, so it's loaded once and then reused
let embedder: Promise<FeatureExtractionPipeline> | undefined;

function getEmbedder() {
  embedder ??= pipeline("feature-extraction", EMBEDDING_MODEL, {
    dtype: "q8", // the small "quantized" version: almost the same results, 4× smaller
  });
  return embedder;
}

// Texts → one vector (384 numbers) per text, in the same order
export async function embedTexts(texts: string[]): Promise<number[][]> {
  const embed = await getEmbedder();
  const output = await embed(texts, {
    pooling: "mean", // one vector for the whole text, not one per word
    normalize: true, // every vector gets length 1, so comparing them only compares direction
  });
  return output.tolist() as number[][];
}
