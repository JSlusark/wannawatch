import { ChevronDown } from "lucide-react";

import { cn } from "@/lib/utils";

const FILTERS = ["Genre", "Year", "Rating", "Country", "Service"];
const TYPES = [
  { label: "Series", selected: false },
  { label: "Movies", selected: true },
];

// Preview of the catalogue filters: shows how they will look, but doesn't filter yet.
// aria-disabled (instead of `disabled`) keeps them reachable with Tab, so screen reader
// users can still discover them and hear that they're unavailable.
function FilterBar({ className }: { className?: string }) {
  return (
    <section
      aria-labelledby="filters-heading"
      className={cn(
        "flex flex-wrap items-center justify-between gap-x-10 gap-y-4",
        className,
      )}
    >
      <h2 id="filters-heading" className="sr-only">
        Filters (preview, not working yet)
      </h2>

      <ul className="flex flex-wrap items-center gap-x-8 gap-y-3">
        {FILTERS.map((filter) => (
          <li key={filter}>
            <button
              type="button"
              aria-disabled="true"
              className="flex cursor-not-allowed items-center gap-1 rounded-md font-mono text-base font-bold text-muted-foreground uppercase"
            >
              <ChevronDown
                aria-hidden="true"
                className="size-4"
                strokeWidth={3}
              />
              {filter}
            </button>
          </li>
        ))}
      </ul>

      <div role="group" aria-label="Show" className="flex items-center gap-6">
        {TYPES.map((type) => (
          <button
            key={type.label}
            type="button"
            aria-pressed={type.selected}
            aria-disabled="true"
            className={cn(
              "cursor-not-allowed rounded-md font-mono text-base font-bold uppercase",
              // Purple text for the selected one (lighter purple in dark mode to stay readable)
              type.selected
                ? "text-secondary dark:text-purple-soft"
                : "text-muted-foreground",
            )}
          >
            {type.label}
          </button>
        ))}
      </div>
    </section>
  );
}

export { FilterBar };
