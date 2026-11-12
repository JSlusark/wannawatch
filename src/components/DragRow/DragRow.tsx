"use client";

import {
  animate,
  motion,
  useMotionValue,
  useReducedMotion,
} from "motion/react";
import {
  Children,
  useRef,
  type FocusEvent,
  type MouseEvent,
  type ReactNode,
} from "react";

import { cn } from "@/lib/utils";

type DragRowProps = {
  /** The items: each one becomes a list item of the row */
  children: ReactNode;
  className?: string;
};

// One row of items you drag sideways by hand (mouse or finger), 3 in view at a time.
// Made with Motion's drag (the library the swipe deck already uses):
// - a fling glides on, then stops exactly at the start of an item (modifyTarget)
// - the row can't be pulled past its first or last item (dragConstraints)
// - a click at the end of a drag doesn't open the item under the pointer
// - Tab to an item that's out of view and the row slides to show it
function DragRow({ children, className }: DragRowProps) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const rowRef = useRef<HTMLUListElement>(null);
  const x = useMotionValue(0); // how far the row is moved left, in px (0 or less)
  const dragged = useRef(false);
  const reduceMotion = useReducedMotion();

  // The distance from one item's start to the next one's (item width + gap)
  function step() {
    const [first, second] = rowRef.current?.children ?? [];
    if (!first || !second) return 1;
    return (
      second.getBoundingClientRect().left - first.getBoundingClientRect().left
    );
  }

  // Keyboard: the focused item isn't fully in view → slide the row just enough.
  // Measured on screen (getBoundingClientRect), so page margins don't count.
  function showFocused(event: FocusEvent<HTMLUListElement>) {
    const item = (event.target as HTMLElement).closest("li");
    const row = rowRef.current;
    const viewport = viewportRef.current;
    if (!item || !row || !viewport) return;
    const edges = viewport.getBoundingClientRect(); // the visible part, on screen
    const box = item.getBoundingClientRect();
    let shift = 0;
    if (box.left < edges.left) shift = edges.left - box.left;
    else if (box.right > edges.right) shift = edges.right - box.right;
    if (!shift) return;
    // Never past the first item, or the last item's end
    const minX = Math.min(0, edges.right - edges.left - row.offsetWidth);
    const next = Math.max(minX, Math.min(0, x.get() + shift));
    animate(x, next, { duration: reduceMotion ? 0 : 0.3 });
  }

  // A drag ends with a click on whatever is under the pointer: swallow that one click
  function blockClickAfterDrag(event: MouseEvent) {
    if (!dragged.current) return;
    event.preventDefault();
    event.stopPropagation();
    dragged.current = false;
  }

  return (
    // Outside: overflow-x-clip hides the items out of view. "clip", not "hidden": a hidden
    // box can still be scrolled by the browser when something inside gets focus, which
    // would fight with the drag. px-2/-mx-2 keep room for the cards' focus ring at the edges.
    <div className={cn("-mx-2 overflow-x-clip px-2 py-2", className)}>
      {/* Inside, with no padding: the visible box. The drag limit is measured from it
          (padding would let the row slide 8px too far), and the items take their width
          from it (@container + cqw, below). */}
      <div ref={viewportRef} className="@container">
        <motion.ul
          ref={rowRef}
          drag="x"
          style={{ x }}
          dragConstraints={viewportRef}
          dragElastic={0.1} // pulling past the ends gives only a little
          // With reduced motion, a fling doesn't glide: it only snaps to the nearest item
          dragTransition={{
            power: reduceMotion ? 0 : 0.3,
            // How quickly the glide slows down. Motion's default (700ms) kept the row
            // drifting for over 3 seconds; 200ms settles in well under a second
            timeConstant: 200,
            modifyTarget: (target) => Math.round(target / step()) * step(),
          }}
          onPointerDown={() => (dragged.current = false)}
          onDragStart={() => (dragged.current = true)}
          onClickCapture={blockClickAfterDrag}
          // The browser's own drag (the one that drops a link or picture into another tab)
          // would take over from the row's drag as soon as you press on a card's link
          onDragStartCapture={(event) => event.preventDefault()}
          onFocus={showFocused}
          className="flex w-max cursor-grab gap-6 active:cursor-grabbing max-sm:gap-3"
        >
          {Children.map(children, (child) => (
            // 3 in view: each item is a third of the visible box (100cqw), minus its share of
            // the 2 gaps. On a phone, 2 in view (minus 1 gap): a third of a phone is ~106px,
            // too narrow for a movie card (its title ran into its buttons).
            // The row itself is as wide as all its items (w-max): it must be wider than
            // the box, or the drag limit (dragConstraints) leaves no room to move.
            <li className="w-[calc((100cqw-3rem)/3)] shrink-0 max-sm:w-[calc((100cqw-0.75rem)/2)]">
              {child}
            </li>
          ))}
        </motion.ul>
      </div>
    </div>
  );
}

export { DragRow };
