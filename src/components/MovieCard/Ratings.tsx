import { ImdbIcon, TomatoIcon } from "./RatingIcons";

type RatingsProps = {
  imdbScore: number;
  rottenTomatoesScore: number;
};

// Secondary to the title: normal weight (500) and a smaller size, so the colourful
// logos and the numbers don't compete with it
function Ratings({ imdbScore, rottenTomatoesScore }: RatingsProps) {
  return (
    <p className="flex items-center gap-3 font-mono text-xs font-medium @3xs:gap-4 @xs:gap-5 @xs:text-sm">
      <span className="flex items-center gap-1.5 @3xs:gap-2">
        <ImdbIcon className="size-5 @xs:size-6" />
        <span className="sr-only">IMDb rating </span>
        {imdbScore.toFixed(1)}/10
      </span>
      <span className="flex items-center gap-1.5 @3xs:gap-2">
        <TomatoIcon className="size-5 @3xs:size-6 @xs:size-7" />
        <span className="sr-only">Rotten Tomatoes score </span>
        {rottenTomatoesScore}%
      </span>
    </p>
  );
}

export { Ratings };
