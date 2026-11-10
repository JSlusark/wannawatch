// Step 2 of "similar movies": re-rank the candidates the vector search found, mixing
// two separate scores with weights I choose. Pure math, no database and no AI, so it
// can be tested on its own (rankSimilar.test.ts).

// How much each part counts in the final score. They add up to 1.
// Tune them by running `npm run find:similar -- "Some movie"` and comparing results.
export const WEIGHTS = { genre: 0.4, plot: 0.6 };

// Shared genres ÷ all genres of both movies (the "Jaccard index"), from 0 to 1.
// Drama+Comedy vs Comedy+Romance → 1 shared (Comedy) ÷ 3 in total → 0.33.
export function genreOverlap(a: string[], b: string[]): number {
  const setA = new Set(a);
  const setB = new Set(b);
  const all = new Set([...setA, ...setB]);
  if (all.size === 0) return 0; // no genres on either side: nothing to compare
  const shared = [...setA].filter((genre) => setB.has(genre)).length;
  return shared / all.size;
}

type Candidate = { genres: string[]; plotSimilarity: number };

// Sorts the candidates by a mix of genre overlap and plot similarity, best first.
// The two scores live on different scales: genre overlap uses 0 to 1, but plot
// similarity between candidates only spreads over a narrow band (e.g. 0.62 to 0.78).
// So plot similarity is first stretched to 0 to 1 within this group (best plot = 1,
// worst = 0). Without that, the weights wouldn't mean what they say.
export function rankSimilar<T extends Candidate>(
  genres: string[],
  candidates: T[],
): (T & { genreOverlap: number; plotScore: number; score: number })[] {
  const sims = candidates.map((c) => c.plotSimilarity);
  const best = Math.max(...sims);
  const worst = Math.min(...sims);
  const range = best - worst;

  return candidates
    .map((candidate) => {
      const overlap = genreOverlap(genres, candidate.genres);
      const plotScore = range ? (candidate.plotSimilarity - worst) / range : 1;
      return {
        ...candidate,
        genreOverlap: overlap,
        plotScore,
        score: WEIGHTS.genre * overlap + WEIGHTS.plot * plotScore,
      };
    })
    .sort((a, b) => b.score - a.score);
}
