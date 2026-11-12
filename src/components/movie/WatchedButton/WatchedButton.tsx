import { Check } from "lucide-react";
import type { Ref } from "react";

import { cn } from "@/lib/utils";

// import { ratingLabel, type Rating } from "./BackCard";
import {
  StickerIcon,
  posterButtonClass,
  stickerButtonClass,
  stickerSize,
} from "@/components/StickerIcon";


type WatchScore = 2 | 1 | 0 | -1 | -2;

type WatchedButtonProps = {
  ref?: Ref<HTMLButtonElement>;
  isWatched: boolean;
  watchScore: WatchScore | null;
  onToggle?: () => void;
};

// color: the check icon. labelColor: the score text, which sits on the thick black
// outline: purple-500 text there is only 3.3:1, so the text uses the lighter 400 (5.9:1)
const WATCH_SCORES = [
  { score: 2, label: "Loved it", color: "text-pink-500" },
  { score: 1, label: "Liked it", color: "text-pink-500" },
  { score: 0, label: "It's ok", color: "text-secondary" },
  { score: -1, label: "Meh...", color: "text-secondary" },
  { score: -2, label: "Hated it", color: "text-secondary" },
] as const;

function WatchedButton({
  ref,
  isWatched,
  watchScore,
  onToggle,
}: WatchedButtonProps) {
  const displayedScore = WATCH_SCORES.find((item) => item.score === watchScore); // undefined for non-watched movies

  // console.log("WatchedButton props:", { isWatched, watchScore, onToggle });
  // console.log("Score found:", displayedScore);
  return (
    <button
      ref={ref}
      type="button"
      aria-label={
        isWatched ? `Watched ${displayedScore?.label}` : "Not watched"
      }
      aria-pressed={isWatched}
      onClick={() => onToggle?.()}
      className={cn(
        stickerButtonClass,
        posterButtonClass, 
      )}
    >
      <StickerIcon
        icon={Check}
        variant="default"
        color={displayedScore?.color ?? ""} 
        className={stickerSize}
      />
      <WatchedLabel
        score={displayedScore?.label}
        color={displayedScore?.color}
      />
    </button>
  );
}

function WatchedLabel({ score, color }: { score?: string; color?: string }) {
  if (score === undefined) return null;
  return (
    <span
      className={cn(
        `font-display leading-none whitespace-nowrap uppercase sticker-text-size sticker-outline ${color}`,
      )}
    >
      {score}
    </span>
  );
}

export { WatchedButton };
