import { useEffect, useSyncExternalStore } from "react";

// Only one MovieCard on the page may show its back (the rating side) at a time.
// Flipping a card turns any other flipped card back to its front; that card's
// unconfirmed rating is thrown away, so it doesn't count as watched.
//
// How: one small shared value outside React, "the id of the card that is flipped".
// Every card subscribes to it with useSyncExternalStore (React's built-in way to read
// a value that lives outside React), so when it changes, every card re-renders and
// checks "is it me?". No provider or parent wiring needed: it works in every grid,
// the swipe deck, and across the two lists on the profile page.

let flippedId: string | null = null;
const listeners = new Set<() => void>();

function setFlippedId(id: string | null) {
  flippedId = id;
  listeners.forEach((notify) => notify());
}

function subscribe(notify: () => void) {
  listeners.add(notify);
  return () => {
    listeners.delete(notify);
  };
}

/** Works like useState(false) for "is this card flipped?", but only one card can be true */
function useSingleFlip(id: string) {
  const flipped =
    useSyncExternalStore(
      subscribe,
      () => flippedId,
      () => null, // on the server nothing is flipped
    ) === id;

  // A flipped card that leaves the page (e.g. filtered out) frees the slot
  useEffect(
    () => () => {
      if (flippedId === id) setFlippedId(null);
    },
    [id],
  );

  function setFlipped(value: boolean) {
    if (value) setFlippedId(id);
    // Turning back only clears the slot if it's still ours
    else if (flippedId === id) setFlippedId(null);
  }

  return [flipped, setFlipped] as const;
}

export { useSingleFlip };
