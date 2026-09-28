import { Slider } from "@base-ui/react/slider";
import { Check, ChevronsUpDown, X } from "lucide-react";
import { useId, useState, type ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// From best (top of the card) to worst (bottom). The number is the score we store.
const LEVELS = [
  { score: 2, label: "I loved it!" },
  { score: 1, label: "I liked it" },
  { score: 0, label: "It's ok" },
  { score: -1, label: "Not my thing" },
  { score: -2, label: "I hated it" },
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
  /** How much to scale the content (a narrow card gets a smaller back) */
  scale?: number;
  onConfirm: (rating: Rating) => void;
  onCancel: () => void;
};

// Back of the card: drag the liquid's surface up or down to pick a score.
// It's a Base UI Slider (the same one shadcn's Slider uses), so it also works
// with the arrow keys and screen readers. The score is a draft until Confirm.
function LiquidRating({
  title,
  scale = 1,
  onConfirm,
  onCancel,
}: LiquidRatingProps) {
  const [draft, setDraft] = useState<Rating>(0); // always start at "It's ok"
  const fill = FILL[draft];
  const text = {
    question: `How was ${title}?`,
    answer: ratingLabel(draft),
    score: draft,
  };

  return (
    // zoom scales all the content with the card. The wrapper still fills the whole card.
    <div style={{ zoom: scale }} className="absolute inset-0">
      {/* The layers, from bottom to top:
          1. dark text + grey heart  2. liquid  3. white copy cut to the liquid
          4. slider (the drag handle)  5. buttons */}
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
          so the handle always sits on the liquid's surface. While dragging we snap to the
          closest level; the arrow keys jump one level at a time. */}
      <Slider.Root
        value={fill}
        onValueChange={(value, details) =>
          setDraft(
            details.reason === "keyboard"
              ? nextLevel(draft, value)
              : closestLevel(value),
          )
        }
        min={0}
        max={100}
        orientation="vertical"
      >
        {/* pointer-events-none = tapping the card does nothing;
            only the handle can be grabbed (it turns them back on) */}
        <Slider.Control className="pointer-events-none absolute inset-0">
          <Slider.Thumb
            aria-label={text.question}
            getAriaValueText={(_formatted, value) =>
              ratingLabel(closestLevel(value))
            }
            className="group pointer-events-auto flex h-16 w-full cursor-grab touch-none items-end justify-end pr-4 pb-1 active:cursor-grabbing motion-safe:transition-[bottom] motion-safe:duration-500 motion-safe:ease-out"
          >
            {/* The visible grip, on the right just under the liquid's surface (away from the heart) */}
            {/* <span className="flex h-6 w-12 items-center justify-center rounded-full bg-secondary-foreground text-secondary shadow-sm group-has-focus-visible:ring-3 group-has-focus-visible:ring-ring">
              <ChevronsUpDown className="size-4" strokeWidth={2.5} />
            </span> */}
          </Slider.Thumb>
        </Slider.Control>
      </Slider.Root>

      {/* A third copy of the same layout with everything made invisible except the
          buttons (`visible` overrides the parent's `invisible`), so they land in the
          right spot. Invisible things are also skipped by screen readers. */}
      <div className="pointer-events-none invisible absolute inset-0">
        <RatingLayout {...text}>
          <span className="pointer-events-auto visible flex gap-5">
            <Button
              size="lg"
              variant="secondary"
              onClick={() => onConfirm(draft)}
            >
              <Check strokeWidth={2.5} />
              Confirm
            </Button>
            <Button size="lg" variant="outline" onClick={onCancel}>
              <X strokeWidth={2.5} />
              Cancel
            </Button>
          </span>
        </RatingLayout>
      </div>
    </div>
  );
}

type RatingLayoutProps = {
  question: string;
  answer: string;
  score: Rating;
  heartClassName?: string;
  children?: ReactNode;
};

// Question at the top, heart + score in the middle, buttons at the bottom.
// Drawn three times (dark, white, buttons), so every copy must use exactly the
// same layout to line up on top of each other.
function RatingLayout({
  question,
  answer,
  score,
  heartClassName,
  // Empty space as tall as the buttons, so the text copies stay aligned with them
  children = <span className="block " />,
}: RatingLayoutProps) {
  return (
    <div className="flex size-full flex-col items-center justify-between px-6 pt-15 pb-15 text-center">
      <p className="line-clamp-3 font-display text-2xl leading-tight uppercase">
        {question}
      </p>
      <div className="flex flex-col items-center gap-12">
        <Heart score={score} className={cn("size-32 ", heartClassName)} />
        <p className="font-display text-2xl uppercase">{answer}</p>
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

export { LiquidRating, ratingLabel, type Rating };
