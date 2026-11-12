import type { ReactNode } from "react";

// How wide a card in the spotlight is: as big as the screen's height allows (so the
// whole card fits without scrolling), between 12rem and 20.8rem
const SPOTLIGHT_CARD_SIZE =
  "w-[clamp(12rem,calc((100dvh-16rem)*0.533),20.8rem)]";

type MovieSpotlightProps = {
  /** Left: the card (the Daily 10 puts its swipe deck here) */
  card: ReactNode;
  /** Right: what the movie is about */
  children: ReactNode;
};

// One movie in the spotlight: its card on the left and its details on the right,
// centred on each other. On a phone they stack, card first.
// Shared by the Daily 10 and the movie page, so both always look the same.
function MovieSpotlight({ card, children }: MovieSpotlightProps) {
  return (
    <div className="mx-auto grid w-full max-w-5xl items-center gap-12 lg:grid-cols-[auto_minmax(0,1fr)] lg:gap-20">
      <div className="flex flex-col items-center gap-6">{card}</div>
      {/* Plain text next to the card, no box */}
      <section aria-label="About this movie" className="max-w-2xl">
        {children}
      </section>
    </div>
  );
}

export { MovieSpotlight, SPOTLIGHT_CARD_SIZE };
