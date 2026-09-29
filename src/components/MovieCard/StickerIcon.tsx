import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

type StickerIconProps = {
  icon: LucideIcon;
  /** Colour of the icon's body, as a text colour class (e.g. "text-pink-500") */
  color: string;
  /**
   * "filled": a closed shape (bookmark, hand) gets its inside painted with `color`.
   * "line": a line icon (check, X) becomes a thick line in `color`.
   * Either way it gets a 2px outline in the border colour, like our buttons.
   */
  shape: "filled" | "line";
  /** Size, and the hard shadow (e.g. "size-8 drop-shadow-brutal-sm") */
  className?: string;
};

// An icon that *is* the button: no box around it. It borrows the button's style instead:
// the outline acts as the border, the body colour as the fill, plus a hard shadow
// (drop-shadow follows the icon's shape, a box-shadow would draw a rectangle).
//
// Line widths are in the icon's own units (its drawing is 24 units wide), so they grow with
// the icon: a big check gets a thick line and a thicker border, instead of looking thin.
//
// THE BORDER RULE: every sticker's border is 2 units = 1/12 of the icon's size (the
// bookmark's border, e.g. 6px on a 72px icon). Line icons and sticker text copy it.
function StickerIcon({ icon: Icon, color, shape, className }: StickerIconProps) {
  return (
    // Both layers sit in the same grid cell, on top of each other
    <span
      aria-hidden="true"
      className={cn(
        "grid shrink-0 *:col-start-1 *:row-start-1",
        className,
      )}
    >
      {shape === "filled" ? (
        // One layer: body colour inside (fill-current), a 2-unit border on the edge
        <Icon
          className={cn(layer, color, "fill-current stroke-border")}
          strokeWidth={BORDER * 2}
        />
      ) : (
        <>
          {/* Wide line in the border colour underneath... */}
          <Icon
            className={cn(layer, "text-border")}
            strokeWidth={LINE + BORDER * 4}
          />
          {/* ...and the coloured line on top: 2 units of border show on each side */}
          <Icon className={cn(layer, color)} strokeWidth={LINE} />
        </>
      )}
    </span>
  );
}

// In icon units (24 = the icon's full width).
// A filled shape's stroke is centred on its edge, so BORDER * 2 = 2 units of visible border.
const BORDER = 1;
// Thickness of the coloured line of a line icon (check, X)
const LINE = 3;

// size-full on each layer (not only the wrapper): shadcn's Button and Toggle shrink any
// svg that has no size- class of its own to 16px
const layer = "size-full";

// Hover lifts the icon and grows its shadow; pressing pushes it into the shadow
// (it moves by the shadow's 2px, so it looks flat against the card).
// Put `stickerButton` on the button and `stickerShadow` on its StickerIcon.
const stickerButton =
  "group/sticker cursor-pointer outline-none focus-visible:ring-3 focus-visible:ring-ring motion-safe:transition-transform motion-safe:duration-100 hover:-translate-y-0.5 active:translate-x-0.5 active:translate-y-0.5";
const stickerShadow =
  "drop-shadow-brutal-sm group-hover/sticker:drop-shadow-brutal group-active/sticker:drop-shadow-none";

export { StickerIcon, stickerButton, stickerShadow };
