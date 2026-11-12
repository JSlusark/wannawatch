import { Plus } from "lucide-react";
import { useId, type ReactNode } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type CollectionPanelProps = {
  title: string;
  /** How many movies are in the collection */
  count: number;
  /** Colour of the title bar */
  tone: "lime" | "purple";
  /** Label for the add button, e.g. "Add to Watched" (read out in full) */
  addLabel: string;
  children: ReactNode;
  className?: string;
};

const TONES = {
  lime: "bg-primary text-primary-foreground",
  purple: "bg-secondary text-secondary-foreground",
} as const;

// One collection of the profile: a coloured title bar (name, number of movies, add button)
// and a scrollable box with the movie cards inside. Always a square of the same size,
// however many movies are in it (the box scrolls instead of growing).
function CollectionPanel({
  title,
  count,
  tone,
  addLabel,
  children,
  className,
}: CollectionPanelProps) {
  const titleId = useId();

  return (
    <section
      aria-labelledby={titleId}
      className={cn(
        "flex aspect-square w-full flex-col overflow-hidden rounded-xl border-3 border-border bg-card shadow-brutal",
        className,
      )}
    >
      <header
        className={cn(
          "flex flex-wrap items-center gap-3 border-b-3 border-border px-4 py-3",
          TONES[tone],
        )}
      >
        <h2 id={titleId} className="font-display text-2xl uppercase">
          {title}
        </h2>
        <Badge variant="outline" className="h-7 text-sm">
          {count} {count === 1 ? "film" : "films"}
        </Badge>
        {/* Adding movies isn't built yet, so this doesn't do anything for now */}
        <Button
          size="sm"
          variant="outline"
          aria-label={addLabel}
          className="ml-auto"
        >
          <Plus strokeWidth={3} />
          Add
        </Button>
      </header>

      {/* tabIndex=0: a scrollable box must be reachable with the keyboard,
          so arrow keys can scroll it. Its name comes from the title. */}
      <div
        tabIndex={0}
        role="region"
        aria-labelledby={titleId}
        className="min-h-0 flex-1 overflow-y-auto bg-muted p-5 outline-none focus-visible:ring-3 focus-visible:ring-ring focus-visible:ring-inset"
      >
        {children}
      </div>
    </section>
  );
}

export { CollectionPanel };
