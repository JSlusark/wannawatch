/**
This component is used in the MovieCard to display a sticker icon (check for watched movies or bookmark for wannawatch).
It takes an icon component, a color, a variant (solid or outline), and optional className for styling.
The icon is rendered with appropriate styles based on the variant and color provided.
*/

import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

const SHAPE = 3; // The width of the icon can be solid (filled) or outline (hollow).
const BORDER = 1; // the size of icon border
const layer = "size-full";
const stickerButton =
  "group/sticker cursor-pointer outline-none focus-visible:ring-3 focus-visible:ring-ring motion-safe:transition-transform motion-safe:duration-100 hover:-translate-y-0.5 active:translate-x-0.5 active:translate-y-0.5";
const stickerShadow =
  "drop-shadow-brutal-sm group-hover/sticker:drop-shadow-brutal/80 group-active/sticker:drop-shadow-none";

  type StickerIconProps = {
  icon: LucideIcon;
  color: string;
  variant: "highlight" | "default";
  /** Size (e.g. "size-8"). The hard shadow is built in */
  className?: string;
};

function StickerIcon({ icon: Icon, color, variant, className }: StickerIconProps) {
  return (
    // Both layers sit in the same grid cell, on top of each other
    <span
      aria-hidden="true"
      className={cn(
        "grid shrink-0 *:col-start-1 *:row-start-1",
        stickerShadow,
        className,
      )}
    >
      {variant === "highlight" ? (
        <Icon
          className={cn(layer, color, "fill-current stroke-border")}
          strokeWidth={BORDER * 2}
        />
      ) : (
        <>
          {/* Wide line in the border colour underneath... */}
          <Icon
            className={cn(layer, "text-border")}
            strokeWidth={SHAPE + BORDER * 4}
          />
          {/* ...and the coloured line on top: 2 units of border show on each side */}
          <Icon className={cn(layer, color)} strokeWidth={SHAPE} />
        </>
      )}
    </span>
  );
}



export { StickerIcon, stickerButton };
