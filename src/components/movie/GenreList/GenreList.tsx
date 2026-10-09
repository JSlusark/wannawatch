import { cn } from "@/lib/utils";

type GenreListProps = {
  genres: string[];
  /** Show only this many, then "+N" for the rest */
  max?: number;
  className?: string;
};

// Genres as plain text: no box, no background. A small dot goes between them.
// The colour comes from the parent (white on a poster, normal text elsewhere).
function GenreList({ genres, max, className }: GenreListProps) {
  const shown = max === undefined ? genres : genres.slice(0, max);
  const hiddenCount = genres.length - shown.length;

  return (
    <ul
      aria-label="Genres"
      className={cn(
        "flex flex-wrap gap-x-2 gap-y-1 font-mono text-xs font-bold uppercase",
        className,
      )}
    >
      {[...shown, ...(hiddenCount > 0 ? [`+${hiddenCount}`] : [])].map(
        (label) => (
          // The dot is decoration (after: content), so screen readers just hear the words
          <li
            key={label}
            className="after:ml-2 after:content-['·'] last:after:hidden"
          >
            {label}
          </li>
        ),
      )}
    </ul>
  );
}

export { GenreList };
