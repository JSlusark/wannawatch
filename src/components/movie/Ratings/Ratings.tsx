import { ImdbIcon, TomatoIcon } from "./RatingIcons";

type RatingsProps = {
  imdbScore: number | null;
  rottenTomatoesScore: number | null;
};

// Shown instead of a score we don't have: a dash to see, "not available" to hear
function NoScore() {
  return (
    <>
      <span aria-hidden="true">–</span>
      <span className="sr-only">not available</span>
    </>
  );
}

// Secondary to the title: normal weight (500) and a smaller size, so the colourful
// logos and the numbers don't compete with it
function Ratings({ imdbScore, rottenTomatoesScore }: RatingsProps) {
  return (
    <p className="flex items-center gap-3 font-mono text-xs font-medium @3xs:gap-4 @xs:gap-5 @xs:text-sm">
      <span className="flex items-center gap-1.5 @3xs:gap-2">
        <ImdbIcon className="size-5 @xs:size-6" />
        <span className="sr-only">IMDb rating </span>
        {imdbScore === null ? <NoScore /> : `${imdbScore.toFixed(1)}/10`}
      </span>
      <span className="flex items-center gap-1.5 @3xs:gap-2">
        <TomatoIcon className="size-5 @3xs:size-6 @xs:size-7" />
        <span className="sr-only">Rotten Tomatoes score </span>
        {rottenTomatoesScore === null ? (
          <NoScore />
        ) : (
          `${rottenTomatoesScore}%`
        )}
      </span>
    </p>
  );
}

export { NoScore, Ratings };
