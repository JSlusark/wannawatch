import {
  pipeline,
  type FeatureExtractionPipeline,
} from "@huggingface/transformers";

// The embedding model: small, free, runs on this computer. It's downloaded once (about
// 34 MB) and kept in node_modules/@huggingface/transformers/.cache/.
// bge-small replaced all-MiniLM-L6-v2: same size of vector (384 numbers), but better at
// matching by meaning instead of by shared words like names.
// Saved next to every vector (movies.embedding_model): vectors from different models
// can't be compared, so if this ever changes, every movie must be embedded again.
export const EMBEDDING_MODEL = "Xenova/bge-small-en-v1.5";

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
    // One vector for the whole text, not one per word. bge models are trained to put
    // the summary of the text in the first slot ("cls"), so that's the one to take
    pooling: "cls",
    normalize: true, // every vector gets length 1, so comparing them only compares direction
  });
  return output.tolist() as number[][];
}
