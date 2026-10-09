import { Bookmark } from "lucide-react";

import { cn } from "@/lib/utils";

import {
  StickerIcon,
  posterButtonClass,
  stickerButtonClass,
  stickerSize,
} from "./StickerIcon";

type BookmarkButtonProps = {
  bookmarked: boolean;
  onToggle?: () => void;
};

// The bookmark on top of the poster: white, or filled with the brand colour once saved
function BookmarkButton({ bookmarked, onToggle }: BookmarkButtonProps) {
  return (
    <button
      type="button"
      aria-label="Bookmarked"
      aria-pressed={bookmarked}
      onClick={() => onToggle?.()}
      className={cn(stickerButtonClass, posterButtonClass)}
    >
      <StickerIcon
        icon={Bookmark}
        variant="highlight"
        color={bookmarked ? "text-primary" : "text-on-media"}
        className={stickerSize}
      />
    </button>
  );
}

export { BookmarkButton };
