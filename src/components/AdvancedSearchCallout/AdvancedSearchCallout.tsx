import { Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// A loud box that points to Advanced Search: for people who want a specific
// recommendation instead of the algorithm's picks.
function AdvancedSearchCallout({ className }: { className?: string }) {
  return (
    <aside
      aria-labelledby="advanced-search-heading"
      className={cn(
        "flex flex-col items-start gap-5 sm:flex-row sm:items-center sm:justify-between rounded-xl border-3 border-border bg-orange p-6 text-ink shadow-brutal",
        className,
      )}
    >
      <div>
        <h2
          id="advanced-search-heading"
          className="flex items-center gap-3 font-display text-3xl leading-none uppercase"
        >
          <Search
            aria-hidden="true"
            className="size-8 shrink-0"
            strokeWidth={3}
          />
          Want something specific?
        </h2>
        <p className="mt-3 text-lg font-medium">
          Skip the algorithm. Use Advanced Search to find exactly what you are
          in the mood for.
        </p>
      </div>
      {/* Advanced Search isn't built yet: aria-disabled keeps it reachable with Tab */}
      <div className="flex flex-col items-start gap-2 sm:items-center">
        <Button aria-disabled="true" size="lg" className="bg-ink text-cream">
          Advanced search
        </Button>
        <p className="font-mono text-xs font-bold uppercase">Coming soon</p>
      </div>
    </aside>
  );
}

export { AdvancedSearchCallout };
