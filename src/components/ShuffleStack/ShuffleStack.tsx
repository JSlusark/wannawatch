"use client";

import { Pause, Play } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { useEffect, useState } from "react";

import { PreviewCard } from "@/components/PreviewCard";
import { Toggle } from "@/components/ui/toggle";
import type { Movie } from "@/data/movies";
import { cn } from "@/lib/utils";

// How long each card stays in front (ms)
const SHUFFLE_EVERY = 2800;

// Where a card sits in the pile: 0 = front, higher = further back (fanned out to the left)
function placeAt(position: number) {
  return { x: position * -22, y: position * 6, rotate: position * -4 };
}

type ShuffleStackProps = {
  movies: Movie[];
  className?: string;
};

// A pile of preview cards that shuffles itself: the front card slides out to the
// right and tucks in at the back, then the next one comes forward, forever.
function ShuffleStack({ movies, className }: ShuffleStackProps) {
  // order[0] is the index of the movie in front, order[1] behind it, and so on.
  // justMoved = the card that just went from the front to the back.
  const [{ order, justMoved }, setShuffle] = useState({
    order: movies.map((_, i) => i),
    justMoved: null as number | null,
  });
  const [paused, setPaused] = useState(false);
  const [hovered, setHovered] = useState(false);
  const reduceMotion = useReducedMotion();
  const running = !paused && !hovered && !reduceMotion;

  useEffect(() => {
    if (!running) return;
    const timer = setInterval(() => {
      setShuffle(({ order: current }) => ({
        order: [...current.slice(1), ...current.slice(0, 1)],
        justMoved: current[0] ?? null,
      }));
    }, SHUFFLE_EVERY);
    // Cleanup: stop the timer when paused or when the component goes away
    return () => clearInterval(timer);
  }, [running]);

  const last = movies.length - 1;

  return (
    <div className={cn("flex flex-col items-center gap-6", className)}>
      {/* Decoration only (the cards aren't interactive), so screen readers skip it */}
      <div
        aria-hidden="true"
        // Leave room for the tilted cards behind (transforms don't take up space)
        className="mb-8 grid"
        onPointerEnter={() => setHovered(true)}
        onPointerLeave={() => setHovered(false)}
      >
        {movies.map((movie, index) => {
          const position = order.indexOf(index);
          const target = placeAt(position);
          const movedToBack = index === justMoved && position === last;

          return (
            <motion.div
              key={movie.id}
              className="col-start-1 row-start-1"
              initial={false}
              animate={
                movedToBack
                  ? {
                      // Slide out to the right, then tuck in behind the others
                      x: [0, 260, target.x],
                      y: [0, -10, target.y],
                      rotate: [0, 12, target.rotate],
                      zIndex: [movies.length + 1, movies.length + 1, 1],
                    }
                  : { ...target, zIndex: movies.length - position }
              }
              transition={
                movedToBack
                  ? { duration: 1, times: [0, 0.45, 1], ease: "easeInOut" }
                  : {
                      type: "spring",
                      stiffness: 200,
                      damping: 24,
                      zIndex: { duration: 0 },
                    }
              }
            >
              <PreviewCard
                title={movie.title}
                genres={movie.genre}
                plot={movie.plot}
                imdbScore={movie.imdbScore}
                rottenTomatoesScore={movie.rottenTomatoesScore}
                posterUrl={movie.image}
                className="w-64 sm:w-72"
              />
            </motion.div>
          );
        })}
      </div>

      {/* Moving content must be pausable (WCAG 2.2.2). Hidden when motion is reduced,
          because then nothing moves. */}
      {!reduceMotion && (
        <Toggle
          pressed={paused}
          onPressedChange={setPaused}
          className="cursor-pointer gap-1.5 rounded-lg border-2 border-border bg-card px-3 font-mono text-xs font-bold text-card-foreground uppercase shadow-brutal-sm aria-pressed:bg-orange aria-pressed:text-ink"
        >
          {/* The label stays the same; aria-pressed tells screen readers if it's paused */}
          {paused ? <Play /> : <Pause />}
          Pause shuffle
        </Toggle>
      )}
    </div>
  );
}

export { ShuffleStack };
