import { Slider } from "@base-ui/react/slider";
import { Check, MousePointer2, X } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import {
  useEffect,
  useId,
  useRef,
  useState,
  type PointerEvent,
  type ReactNode,
  type Ref,
} from "react";

import type { Movie } from "@/data/movies";
import { cn } from "@/lib/utils";

import { StickerIcon, stickerButtonClass } from "./StickerIcon";

// From best (top of the card) to worst (bottom). The number is the score we store.
const LEVELS = [
  { score: 2, label: "Loved it" },
  { score: 1, label: "Liked it" },
  { score: 0, label: "It's ok" },
  { score: -1, label: "Meh..." },
  { score: -2, label: "Hated it" },
] as const;

type Rating = (typeof LEVELS)[number]["score"];

// How big the heart is for each score (1 = full size)
const HEART_SCALE: Record<Rating, number> = {
  2: 2,
  1: 1.3,
  0: 0.8,
  [-1]: 1,
  [-2]: 1,
};

// How full the card is (in % of its height) for each score
const FILL: Record<Rating, number> = {
  2: 95,
  1: 80,
  0: 50,
  [-1]: 30,
  [-2]: 15,
};

type LiquidRatingProps = {
  title: string;
  /** false while the card shows its front: the drag hint only counts down when you can see it */
  active?: boolean;
  onConfirm: (rating: Rating) => void;
  onCancel: () => void;
};

// Back of the card: grab the liquid anywhere and drag it up or down to pick a score.
// A Base UI Slider (the same one shadcn's Slider uses) sits on top for the arrow keys
// and screen readers. The score is a draft until Confirm.
function LiquidRating({
  title,
  active = true,
  onConfirm,
  onCancel,
}: LiquidRatingProps) {
  const [draft, setDraft] = useState<Rating>(0); // always start at "It's ok"
  const fill = FILL[draft];
  // Has the user moved the liquid yet? Once they have, they know how it works: no more hint
  const [touched, setTouched] = useState(false);
  const showHint = useIdleHint(active && !touched);
  const boxRef = useRef<HTMLDivElement>(null);
  // Where the drag started: pointer height and liquid level at that moment
  const dragStart = useRef<{ y: number; fill: number } | null>(null);

  function choose(next: Rating) {
    setTouched(true);
    setDraft(next);
  }

  // Dragging moves the liquid by as much as the pointer moved, wherever you grabbed it,
  // so pressing low in the liquid doesn't make the level jump down to that spot
  function onDragStart(e: PointerEvent<HTMLDivElement>) {
    // Pointer capture: keep receiving the moves even if the pointer leaves the liquid
    e.currentTarget.setPointerCapture(e.pointerId);
    dragStart.current = { y: e.clientY, fill };
    setTouched(true);
  }

  function onDragMove(e: PointerEvent<HTMLDivElement>) {
    const start = dragStart.current;
    const box = boxRef.current;
    if (!start || !box) return;
    // Pointer movement as a % of the card's height (moving up = positive = more liquid)
    const moved =
      ((start.y - e.clientY) / box.getBoundingClientRect().height) * 100;
    choose(closestLevel(start.fill + moved));
  }

  function onDragEnd() {
    dragStart.current = null;
  }
  const text = {
    question: `How was "${title}" ?`,
    answer: ratingLabel(draft),
    score: draft,
  };

  return (
    // Sizes inside follow the card's width with container queries (the card has `@container`)
    <div ref={boxRef} className="absolute inset-0">
      {/* The layers, from bottom to top:
          1. dark text + grey heart  2. liquid  3. white copy cut to the liquid
          4. slider (keyboard only)  5. drag area  6. hint  7. buttons */}
      <div
        aria-hidden="true"
        className={cn(
          "pointer-events-none absolute inset-0 text-card-foreground",
          // Under the liquid (the card face uses `isolate`, so it stays above the card)
          "-z-10",
        )}
      >
        {/* opacity on the whole heart, not a see-through colour: the two halves overlap
            a little, and a see-through colour would look darker there (like a crack) */}
        <RatingLayout
          {...text}
          heartClassName="text-muted-foreground opacity-40"
        />
      </div>

      <Liquid fill={fill} />

      {/* White copy, cut to the liquid's shape: where the liquid covers the dark text
          and grey heart, you see this one instead */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 text-ink motion-safe:transition-[clip-path] motion-safe:duration-500 motion-safe:ease-out"
        style={{ clipPath: `inset(${100 - fill}% 0 0 0)` }}
      >
        <RatingLayout {...text} />
      </div>

      {/* The slider's value is the liquid level in % (0 = bottom, 100 = top of the card),
          so the handle always sits on the liquid's surface. It's only for the keyboard
          (arrow keys jump one level) and screen readers: the mouse and fingers use the
          drag area below, so the slider ignores the pointer (pointer-events-none). */}
      <Slider.Root
        value={fill}
        onValueChange={(value, details) => {
          if (details.reason === "keyboard") choose(nextLevel(draft, value));
        }}
        min={0}
        max={100}
        orientation="vertical"
      >
        <Slider.Control className="pointer-events-none absolute inset-0">
          <Slider.Thumb
            aria-label={text.question}
            getAriaValueText={(_formatted, value) =>
              ratingLabel(closestLevel(value))
            }
            className="group flex h-16 w-full items-end justify-end pr-4 pb-1 motion-safe:transition-[bottom] motion-safe:duration-500 motion-safe:ease-out"
          >
            {/* The visible grip, on the right just under the liquid's surface (away from the heart) */}
            {/* <span className="flex h-6 w-12 items-center justify-center rounded-full bg-secondary-foreground text-secondary shadow-sm group-has-focus-visible:ring-3 group-has-focus-visible:ring-ring">
              <ChevronsUpDown className="size-4" strokeWidth={2.5} />
            </span> */}
          </Slider.Thumb>
        </Slider.Control>
      </Slider.Root>

      {/* Drag area: the whole liquid plus a strip just above its surface (so you can also
          grab the wave itself). It grows and shrinks with the liquid.
          touch-none: on a phone, dragging here moves the liquid instead of scrolling.
          It sits under the buttons layer, so Confirm and Cancel still get their clicks. */}
      <div
        aria-hidden="true"
        className="absolute inset-x-0 bottom-0 cursor-grab touch-none active:cursor-grabbing"
        style={{ height: `calc(${fill}% + 2rem)` }}
        onPointerDown={onDragStart}
        onPointerMove={onDragMove}
        onPointerUp={onDragEnd}
        onPointerCancel={onDragEnd}
      />

      {/* AnimatePresence lets the hint fade out before it's removed */}
      <AnimatePresence>{showHint && <DragHint fill={fill} />}</AnimatePresence>

      {/* A third copy of the same layout with everything made invisible except the
          buttons (`visible` overrides the parent's `invisible`), so they land in the
          right spot. Invisible things are also skipped by screen readers. */}
      <div className="pointer-events-none invisible absolute inset-0">
        <RatingLayout {...text}>
          {/* The icons are the buttons: no box, just the sticker check and X.
              The words are for screen readers (aria-label) and mouse users (title). */}
          <span className="pointer-events-auto visible flex gap-4 @xs:gap-6">
            <button
              type="button"
              aria-label="Confirm"
              title="Confirm"
              onClick={() => onConfirm(draft)}
              className={cn(actionSize, stickerButtonClass)}
            >
              <StickerIcon
                icon={Check}
                variant="default"
                color="text-secondary"
                className={cn("size-full")}
              />
            </button>
            <button
              type="button"
              aria-label="Cancel"
              title="Cancel"
              onClick={onCancel}
              className={cn(actionSize, stickerButtonClass)}
            >
              <StickerIcon
                icon={X}
                variant="default"
                color="text-card"
                className={cn("size-full")}
              />
            </button>
          </span>
        </RatingLayout>
      </div>
    </div>
  );
}

// How long the user can sit still before we show how to rate, and how long the hint stays
const HINT_DELAY_MS = 4000;
const HINT_VISIBLE_MS = 2800;

// While `enabled`: wait 4 seconds, show the hint, hide it, wait 4 seconds again, and so on.
// Stops for good once the user moves the liquid (then `enabled` turns false).
function useIdleHint(enabled: boolean) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!enabled) return;
    let timer: ReturnType<typeof setTimeout>;
    const wait = () => {
      timer = setTimeout(show, HINT_DELAY_MS);
    };
    const show = () => {
      setVisible(true);
      timer = setTimeout(() => {
        setVisible(false);
        wait();
      }, HINT_VISIBLE_MS);
    };
    wait();
    // Leaving the back (or the card going away) cancels the countdown
    return () => clearTimeout(timer);
  }, [enabled]);

  return enabled && visible;
}

// "Drag the juice to rate": a hand on the right side of the liquid's surface that
// pushes up and down twice, next to a short label. Made with Motion: it fades and slides
// in, and fades out when AnimatePresence removes it.
// Hidden from screen readers: the slider already tells them how it works.
// In the card it's shown by useIdleHint (4 seconds without a drag); `loop` keeps the hand
// moving forever, for the Storybook story that shows just the animation.
function DragHint({ fill, loop = false }: { fill: number; loop?: boolean }) {
  // With reduced motion the hand stays still: only the fade in and out remain
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      aria-hidden="true"
      initial={{ opacity: 0, x: 12 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 12 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      // bottom = the liquid level; translate-y-5 (half the hand's 40px) puts the hand's
      // centre on the surface. The label sits above it, so it never covers the answer.
      // gap-8 (32px) is more than the hand's 24px upward stroke, so the two never touch.
      className="pointer-events-none absolute right-3 flex translate-y-5 flex-col items-end gap-8 @xs:right-5"
      style={{ bottom: `${fill}%` }}
    >
      {/* rating box */}
      <span className="max-w-full  px-2 py-1 text-right font-mono text-xs font-bold tracking-wider uppercase text-pink-500 ">
        Drag the juice to rate
      </span>
      <motion.span
        className="size-10"
        // Up, a little below the start, back to the start: twice, easing in and out
        animate={reduceMotion ? undefined : { y: [0, -24, 12, 0] }}
        transition={{
          duration: 1.1,
          ease: "easeInOut",
          delay: 0.2,
          repeat: loop ? Infinity : 1,
          repeatDelay: loop ? 0.6 : 0,
        }}
      >
        {/* A sticker hand like the buttons' icons: no circle behind it */}
        <StickerIcon
          icon={MousePointer2}
          variant="highlight"
          color="text-card"
          className="size-full drop-shadow-brutal-sm"
        />
      </motion.span>
    </motion.div>
  );
}

// Confirm/Cancel size: 40px on a narrow card, 48px from 320px up (same as the
// empty space RatingLayout keeps for them). The icon fills it; p-1 keeps the shadow inside.
const actionSize = "size-10 rounded-lg p-1 @xs:size-12";

type RatingLayoutProps = {
  question: string;
  answer: string;
  score: Rating;
  heartClassName?: string;
  children?: ReactNode;
};

// Question at the top, heart + answer in the middle, buttons at the bottom.
// The answer is the most important text (it changes as you drag), so it gets the big
// display font. The question is only a label, so it's small, monospace and uppercase.
// Drawn three times (dark, white, buttons), so every copy must use exactly the
// same layout to line up on top of each other.
function RatingLayout({
  question,
  answer,
  score,
  heartClassName,
  // Empty space as tall as the buttons, so the text copies stay aligned with them
  children = <span className="block h-10 @xs:h-12" />,
}: RatingLayoutProps) {
  return (
    <div className="flex size-full flex-col items-center justify-between p-4 text-center @3xs:px-6 @3xs:py-8 @xs:py-12">
      <p className="line-clamp-2 font-mono text-xs font-bold tracking-wider uppercase @xs:text-sm">
        {question}
      </p>
      {/* The gap leaves room for the heart when it grows (up to 2x for "I loved it!") */}
      <div className="flex flex-col items-center gap-8 @3xs:gap-12">
        <Heart
          score={score}
          className={cn("size-16 @3xs:size-24 @xs:size-32", heartClassName)}
        />
        <p className="font-display text-xl uppercase @3xs:text-2xl @xs:text-3xl">
          {answer}
        </p>
      </div>
      {children}
    </div>
  );
}

// The heart path, in a 24×24 box (same shape as lucide's heart icon)
const HEART_PATH =
  "M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z";
// The zig-zag crack from the top dip of the heart down to its tip
const CRACK = "12,5 10,9 13,12 10.5,15.5 12,21";
// The right half reaches a bit past the crack so the halves overlap: no thin gap when whole
const CRACK_OVERLAP = "11.6,5 9.6,9 12.6,12 10.1,15.5 11.6,21";

// A heart made of two halves cut along a crack. It shrinks for lower scores,
// and for "I hated it" both halves tip outwards around the bottom point: a broken heart.
function Heart({ score, className }: { score: Rating; className?: string }) {
  const id = useId(); // each copy needs its own clip-path ids
  const broken = score === -2;
  // Spring easing: grows/shrinks a little too far, then settles
  const move =
    "motion-safe:transition-transform motion-safe:duration-500 motion-safe:ease-spring";

  return (
    <svg
      viewBox="0 0 24 24"
      className={cn("fill-current", move, className)}
      style={{ transform: `scale(${HEART_SCALE[score]})` }}
    >
      <defs>
        <clipPath id={`${id}-left`}>
          <polygon points={`0,0 12,0 ${CRACK} 12,24 0,24`} />
        </clipPath>
        <clipPath id={`${id}-right`}>
          <polygon points={`24,0 12,0 ${CRACK_OVERLAP} 12,24 24,24`} />
        </clipPath>
      </defs>
      {/* origin = the heart's bottom tip (12, 21), so the halves hinge open from there */}
      <g
        clipPath={`url(#${id}-left)`}
        className={cn("origin-[12px_21px]", move)}
        style={{
          transform: broken ? "rotate(-12deg)" : undefined,
        }}
      >
        <path d={HEART_PATH} />
      </g>
      <g
        clipPath={`url(#${id}-right)`}
        className={cn("origin-[12px_21px]", move)}
        style={{
          transform: broken ? "rotate(12deg)" : undefined,
        }}
      >
        <path d={HEART_PATH} />
      </g>
    </svg>
  );
}

// The score whose level is nearest to a liquid height (e.g. 60% → 50% → "It's ok")
function closestLevel(fill: number): Rating {
  return LEVELS.reduce((best, level) =>
    Math.abs(FILL[level.score] - fill) < Math.abs(FILL[best.score] - fill)
      ? level
      : best,
  ).score;
}

// Keyboard: arrow up/down moves one level; Home/End jump to the top/bottom level
function nextLevel(current: Rating, fill: number): Rating {
  if (fill >= 100) return 2;
  if (fill <= 0) return -2;
  const step = fill > FILL[current] ? 1 : -1;
  return Math.min(2, Math.max(-2, current + step)) as Rating;
}

function ratingLabel(rating: Rating) {
  return LEVELS.find((level) => level.score === rating)?.label ?? "";
}

// The lime liquid: a block that grows from the bottom, with a moving wave on its surface
function Liquid({ fill }: { fill: number }) {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-x-0 bottom-0 bg-lime motion-safe:transition-[height] motion-safe:duration-500 motion-safe:ease-out"
      style={{ height: `${fill}%` }}
    >
      {/* The SVG is twice as wide as the card and holds the same wave twice.
          Sliding it left by half makes an endless loop with no visible jump. */}
      <svg
        viewBox="0 0 200 10"
        preserveAspectRatio="none"
        className="absolute bottom-[calc(100%-1px)] left-0 h-3 w-[200%] motion-safe:animate-wave"
      >
        <path
          d="M0 5 Q12.5 0 25 5 T50 5 T75 5 T100 5 T125 5 T150 5 T175 5 T200 5 V10 H0 Z"
          className="fill-lime"
        />
        {/* The outline, drawn along the wave only (not down the sides or bottom) */}
        <path
          d="M0 5 Q12.5 0 25 5 T50 5 T75 5 T100 5 T125 5 T150 5 T175 5 T200 5"
          fill="none"
          className="stroke-ink"
          strokeWidth="3"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
    </div>
  );
}

type BackCardProps = {
  movie: Movie;
  backRef: Ref<HTMLDivElement>;
  flipped: boolean;
  onClose: () => void;
  onRate?: (rating: Rating) => void;
};

// BACK: the rating slider. Pre-rotated 180° so it faces you once the card turns
function BackCard({ movie, backRef, flipped, onClose, onRate }: BackCardProps) {
  return (
    <div
      ref={backRef}
      inert={!flipped}
      // Tells a swipe deck not to start a swipe here, so dragging the rating slider works
      data-no-swipe
      className="relative col-start-1 row-start-1 rotate-y-180 backface-hidden"
    >
      {/* @container: the back sizes its content by the card's width, like the front */}
      <div className="@container relative isolate size-full overflow-hidden rounded-xl border-3 border-border bg-card">
        {/* key: a new key = a fresh LiquidRating, so each flip starts from the saved
            score and forgets any unconfirmed draft */}
        <LiquidRating
          key={String(flipped)}
          title={movie.title}
          active={flipped}
          onConfirm={(score) => {
            onClose();
            onRate?.(score);
          }}
          onCancel={onClose}
        />
      </div>
    </div>
  );
}

export {
  BackCard,
  DragHint,
  FILL,
  HINT_DELAY_MS,
  LiquidRating,
  ratingLabel,
  type Rating,
};
