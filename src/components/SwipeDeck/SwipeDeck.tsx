"use client";

import { RotateCcw, X } from "lucide-react";
import {
  AnimatePresence,
  animate,
  motion,
  useDragControls,
  useMotionValue,
  useMotionValueEvent,
  useReducedMotion,
  useTransform,
  type MotionValue,
  type PanInfo,
} from "motion/react";
import {
  useEffect,
  useEffectEvent,
  useState,
  type PointerEvent,
  type ReactNode,
} from "react";

import { LogoEye } from "@/components/Logo";
import { MovieCard, MovieDetailsContent } from "@/components/MovieCard";
import { useMovieStatuses } from "@/components/CatalogueGrid/useMovieStatuses";
import { Button } from "@/components/ui/button";
import type { Movie } from "@/data/movies";
import { cn } from "@/lib/utils";

// Drag further than this (px), or fling faster than this (px/s), to decide
const SWIPE_DISTANCE = 120;
const SWIPE_SPEED = 500;
// How many cards of the pile are drawn: the top one plus enough behind it to show there are more
const VISIBLE_CARDS = 3;

// -1 = skip (to the left), 1 = WannaWatch (to the right)
type Direction = -1 | 1;

// How much of each card behind shows below the one in front of it (px)
const PILE_STEP = 12;

// Where a card of the pile sits: all straight, each one behind a little smaller and lower,
// so only a strip of its bottom edge peeks out under the stack
function pilePose(position: number) {
  return {
    x: 0,
    y: position * PILE_STEP,
    rotate: 0,
    scale: 1 - position * 0.05,
  };
}

type SwipeDeckProps = {
  movies: Movie[];
};

// Today's pile of movies. Drag the top card right for "WannaWatch" or left to pass.
// (Keyboard: focus the deck and use the left and right arrow keys.)
function SwipeDeck({ movies }: SwipeDeckProps) {
  const [index, setIndex] = useState(0); // how many cards are already decided
  const [direction, setDirection] = useState<Direction>(1); // where the last card flew
  const [leaving, setLeaving] = useState<Direction | null>(null); // arrow key pressed, card on its way out
  const [announcement, setAnnouncement] = useState("");
  const { statuses: status, update: updateStatus } = useMovieStatuses(movies);

  // How far the top card is dragged (shared with the coloured background)
  const dragX = useMotionValue(0);
  const current = movies[index];
  const pile = movies.slice(index, index + VISIBLE_CARDS);
  const wannaWatchCount = movies.filter(
    (m) => status[m.title]?.bookmarked,
  ).length;

  // The top card has finished its swipe: record the choice and bring the next card forward
  function decide(choice: Direction) {
    if (!current) return;
    if (choice === 1) updateStatus(current.title, { bookmarked: true });
    setAnnouncement(
      choice === 1
        ? `Added ${current.title} to your WannaWatch list`
        : `Passed on ${current.title}`,
    );
    setDirection(choice);
    setLeaving(null);
    setIndex((i) => i + 1);
    animate(dragX, 0, { duration: 0.3 });
  }

  function startOver() {
    setIndex(0);
    setAnnouncement("Starting over");
  }

  if (!current) {
    return (
      <div className="flex flex-col items-center gap-4 text-center">
        <p aria-live="polite" className="sr-only">
          {announcement}
        </p>
        <LogoEye className="h-16 w-auto" />
        <h2 className="font-display text-3xl uppercase">
          That&apos;s all for today!
        </h2>
        <p className="text-muted-foreground">
          You have {wannaWatchCount} movies on your WannaWatch list. Come back
          tomorrow for 10 new ones.
        </p>
        <Button variant="outline" size="lg" onClick={startOver}>
          <RotateCcw />
          Start over
        </Button>
      </div>
    );
  }

  return (
    // Deck on the left, details of the top card on the right, centred on each other
    <div className="mx-auto grid w-full max-w-5xl items-center gap-12 lg:grid-cols-[auto_minmax(0,1fr)] lg:gap-20">
      <div className="flex flex-col items-center gap-6">
        <DecisionBackground x={dragX} />
        {/* Keeps the heading levels in order (h1 page title → h2 → h3 card titles) */}
        <h2 className="sr-only">Today&apos;s movies</h2>
        {/* Screen readers hear each decision (the flying card is only visual) */}
        <p aria-live="polite" className="sr-only">
          {announcement}
        </p>

        {/* Swiping is done by hand. For the keyboard: focus the deck, then press the
          left arrow to pass or the right arrow to WannaWatch. */}
        {/* All cards share one grid cell, so they sit on top of each other */}
        <div
          tabIndex={0}
          role="group"
          aria-label="Movie deck. Press the left arrow to pass or the right arrow to WannaWatch."
          onKeyDown={(event) => {
            // Only when the deck itself has focus, so the rating slider keeps its arrow keys
            if (event.target !== event.currentTarget || leaving !== null)
              return;
            if (event.key === "ArrowLeft") setLeaving(-1);
            if (event.key === "ArrowRight") setLeaving(1);
          }}
          // pb = room for the edges of the cards behind, which hang below the top card
          className="grid rounded-xl pb-6 outline-none focus-visible:ring-3 focus-visible:ring-ring focus-visible:ring-offset-4 focus-visible:ring-offset-background"
        >
          {/* custom = the direction, handed to the card that is leaving so it flies the right way.
            initial={false}: the first cards are simply there when the page opens. */}
          <AnimatePresence custom={direction} initial={false}>
            {pile.map((movie, position) => {
              const isTop = position === 0;
              const cardStatus = status[movie.title];
              return (
                <motion.div
                  key={movie.title}
                  className="col-start-1 row-start-1"
                  // originY 1 = shrink towards the bottom edge, so the step down is exactly PILE_STEP
                  style={{ zIndex: VISIBLE_CARDS - position, originY: 1 }}
                  // A new card starts hidden right behind the one in front of it and slides
                  // down into place, so there are never more than 3 cards on screen
                  initial={pilePose(position - 1)}
                  animate={pilePose(position)}
                  exit="gone"
                  variants={{
                    gone: (dir: Direction) => ({
                      zIndex: VISIBLE_CARDS + 1, // fly over the pile, not under it
                      x: dir * 700,
                      rotate: dir * 25,
                      opacity: 0,
                      transition: { duration: 0.4, ease: "easeIn" },
                    }),
                  }}
                  transition={{ type: "spring", stiffness: 260, damping: 26 }}
                  // Cards behind the top one can't be reached by mouse, Tab or screen reader
                  inert={!isTop}
                  aria-hidden={!isTop}
                >
                  <SwipeableCard
                    enabled={isTop}
                    leaving={isTop ? leaving : null}
                    dragX={dragX}
                    onDecide={decide}
                  >
                    {(overlay) => (
                      <MovieCard
                        // overlay={overlay}
                        movie={movie}
                        // title={movie.title}
                        // genres={movie.genre}
                        // plot={movie.plot}
                        // imdbScore={movie.imdbScore}
                        // rottenTomatoesScore={movie.rottenTomatoesScore}
                        // posterUrl={movie.image}
                        // watched={cardStatus?.watched}
                        // bookmarked={cardStatus?.bookmarked}
                        // rating={cardStatus?.rating}
                        // details={movie}
                        onRate={(rating) =>
                          updateStatus(movie.title, { watched: true, rating })
                        }
                        onUnwatch={() =>
                          updateStatus(movie.title, {
                            watched: false,
                            rating: undefined,
                          })
                        }
                        onToggleBookmark={() =>
                          updateStatus(movie.title, {
                            bookmarked: !cardStatus?.bookmarked,
                          })
                        }
                        size="w-[clamp(12rem,calc((100dvh-16rem)*0.533),20.8rem)]"
                      />
                    )}
                  </SwipeableCard>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>

      {/* Plain text next to the deck, no box. It follows the top card. */}
      <section aria-label="About this movie" className="max-w-2xl">
        {/* Progress, lined up with the title below it */}
        <p className="mb-3 text-lg font-medium text-pink-text tabular-nums">
          Reviewed {index} of {movies.length}
        </p>
        <MovieDetailsContent
          title={current.title}
          genres={current.genre}
          plot={current.plot}
          imdbScore={current.imdbScore}
          rottenTomatoesScore={current.rottenTomatoesScore}
          details={current}
        />
      </section>
    </div>
  );
}

// The page behind the deck tints while you drag: lime for WannaWatch, pink for pass (20%)
function DecisionBackground({ x }: { x: MotionValue<number> }) {
  const wanna = useTransform(x, [0, SWIPE_DISTANCE], [0, 0.2]);
  const pass = useTransform(x, [-SWIPE_DISTANCE, 0], [0.2, 0]);
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10">
      <motion.div
        style={{ opacity: wanna }}
        className="absolute inset-0 bg-primary"
      />
      <motion.div
        style={{ opacity: pass }}
        className="absolute inset-0 bg-pink"
      />
    </div>
  );
}

type SwipeableCardProps = {
  enabled: boolean;
  /** Where the top card is dragged, shared with the background tint */
  dragX: MotionValue<number>;
  /** Set by the arrow keys: slide this way, then decide */
  leaving: Direction | null;
  onDecide: (direction: Direction) => void;
  /** Gets the overlay to draw inside the card, so it covers exactly the card */
  children: (overlay: ReactNode) => ReactNode;
};

// Makes its card draggable left/right, tilts it while dragging and
// shows a "WannaWatch" or "Pass" overlay depending on the side.
function SwipeableCard({
  enabled,
  leaving,
  dragX,
  onDecide,
  children,
}: SwipeableCardProps) {
  const x = useMotionValue(0); // how far the card is dragged, in px
  const rotate = useTransform(x, [-300, 300], [-12, 12]);
  const wannaOpacity = useTransform(x, [0, SWIPE_DISTANCE], [0, 1]);
  const skipOpacity = useTransform(x, [-SWIPE_DISTANCE, 0], [1, 0]);
  // Only the top card reports its position to the background tint
  useMotionValueEvent(x, "change", (value) => {
    if (enabled) dragX.set(value);
  });
  const dragControls = useDragControls();
  const reduceMotion = useReducedMotion();
  // useEffectEvent: lets the effect below call the latest onDecide
  // without restarting every time the parent re-renders
  const decide = useEffectEvent(onDecide);

  // Arrow key pressed: nudge the card to that side (shows the overlay), then decide
  useEffect(() => {
    if (!leaving) return;
    const nudge = animate(x, leaving * SWIPE_DISTANCE, {
      duration: reduceMotion ? 0 : 0.25,
      onComplete: () => decide(leaving),
    });
    return () => nudge.stop();
  }, [leaving, reduceMotion, x]);

  function startDrag(event: PointerEvent<HTMLDivElement>) {
    // Don't swipe when pressing the card's buttons or its rating side
    // (the title button is allowed: it only opens the details on a tap)
    const target = event.target as HTMLElement;
    if (target.closest("button:not([data-details]), input, [data-no-swipe]"))
      return;
    dragControls.start(event);
  }

  function endDrag(_event: unknown, info: PanInfo) {
    const far = Math.abs(info.offset.x) > SWIPE_DISTANCE;
    const fast = Math.abs(info.velocity.x) > SWIPE_SPEED;
    if (far || fast) {
      onDecide(info.offset.x > 0 ? 1 : -1);
    } else {
      // Not far enough: spring back to the middle
      animate(x, 0, { type: "spring", stiffness: 400, damping: 30 });
    }
  }

  return (
    <motion.div
      className={cn(
        "relative",
        enabled && "cursor-grab active:cursor-grabbing",
      )}
      style={{ x, rotate }}
      drag={enabled ? "x" : false}
      dragListener={false}
      dragControls={dragControls}
      dragMomentum={false}
      onPointerDown={enabled ? startDrag : undefined}
      onDragEnd={endDrag}
    >
      {children(
        <>
          <DecisionOverlay
            opacity={wannaOpacity}
            label="WannaWatch"
            icon={<LogoEye className="h-14 w-auto text-ink" />}
            tone="bg-primary/80"
            tilt="-rotate-6"
          />
          <DecisionOverlay
            opacity={skipOpacity}
            label="Pass"
            icon={
              <span className="relative grid size-16 place-items-center">
                {/* A thick black X behind a white one = a white X with a black border */}
                <X className="absolute size-16 text-ink" strokeWidth={7} />
                <X className="absolute size-16 text-white" strokeWidth={3.5} />
              </span>
            }
            tone="bg-pink/80"
            tilt="rotate-6"
          />
        </>,
      )}
    </motion.div>
  );
}

type DecisionOverlayProps = {
  opacity: MotionValue<number>;
  label: string;
  icon: ReactNode;
  /** Background colour at 80%: lime for WannaWatch, pink for Pass */
  tone: string;
  tilt: string;
};

// Covers the whole card with a coloured 80% layer and a big bold stamp in the middle
// while you drag. It fades in with the drag. Visual only.
function DecisionOverlay({
  opacity,
  label,
  icon,
  tone,
  tilt,
}: DecisionOverlayProps) {
  return (
    <motion.div
      aria-hidden="true"
      style={{ opacity }}
      className={cn(
        "pointer-events-none absolute inset-0 flex items-center justify-center",
        tone,
      )}
    >
      <div className={cn("flex flex-col items-center gap-2", tilt)}>
        {icon}
        {/* White letters with a thick black outline (paint-order draws the outline behind).
            cqw = a % of the card's width, so the text always fits the card. */}
        <span className="font-display text-[10cqw] text-white uppercase [-webkit-text-stroke:0.2em_var(--color-ink)] [paint-order:stroke_fill]">
          {label}
        </span>
      </div>
    </motion.div>
  );
}

export { SwipeDeck };
