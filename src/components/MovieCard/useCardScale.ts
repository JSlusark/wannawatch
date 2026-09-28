import { useLayoutEffect, useRef, useState } from "react";

// The card's content was designed for a card this wide (px). A narrower card gets
// its content scaled down by the same amount, a wider one scaled up.
const DESIGN_WIDTH = 330;

// Measures an element (the card) and returns how much its content should be scaled,
// e.g. 0.5 for a card half as wide as the design. The content then gets `zoom: scale`:
// zoom shrinks text, icons and spacing together, and the layout inside adapts.
function useCardScale<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [scale, setScale] = useState(1);

  useLayoutEffect(() => {
    const element = ref.current;
    if (!element) return;
    const update = () =>
      setScale(Math.max(0.3, element.offsetWidth / DESIGN_WIDTH));
    update();
    // Runs again whenever the card changes size (window resize, another grid column...)
    const observer = new ResizeObserver(update);
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return [ref, scale] as const;
}

export { useCardScale };
