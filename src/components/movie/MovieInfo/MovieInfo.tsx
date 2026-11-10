import { GenreList } from "@/components/movie/GenreList";

import { Ratings } from "@/components/movie/Ratings";

type MovieInfoProps = {
  titleId: string;
  title: string;
  genres: string[];
  imdbScore: number | null;
  rottenTomatoesScore: number | null;
};

// The text at the bottom of the card: ratings, then title and genres
function MovieInfo({
  titleId,
  title,
  genres,
  imdbScore,
  rottenTomatoesScore,
}: MovieInfoProps) {
  return (
    <div className="relative flex flex-col gap-4 px-3 pt-6 pb-4 text-on-media @3xs:px-4 @3xs:pb-6 @xs:px-5 @xs:pb-8">
      <Ratings
        imdbScore={imdbScore}
        rottenTomatoesScore={rottenTomatoesScore}
      />
      <div className="flex flex-col gap-2">
        <h3
          id={titleId}
          title={title}
          className="font-display text-lg leading-none uppercase @3xs:text-2xl @xs:text-3xl"
        >
          {title}
        </h3>
        <GenreList
          genres={genres}
          max={3}
          className="tracking-wider text-on-media-muted"
        />
      </div>
    </div>
  );
}

// Shared with PreviewCard, which shows the same front without buttons or motion
export { MovieInfo };
