import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useState } from "react";
import { action } from "storybook/actions";
import { expect, fn } from "storybook/test";

import mockMovieData from "@/data/mockData.json";
import type { Movie } from "@/data/movies";

import {
  HINT_DELAY_MS,
  LiquidRating,
  ratingLabel,
  type Rating,
} from "./BackCard";
import { FrontCard } from "./FrontCard";
import { MovieCard } from "./MovieCard";

// Mandy: not watched, not bookmarked
const movie = mockMovieData[0] as Movie;

// From best to worst, like on the back of the card
const RATINGS: Rating[] = [2, 1, 0, -1, -2];

const meta = {
  title: "Components/MovieCard/DefaultCard",
  component: MovieCard,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
  args: {
    movie,
    onRate: fn(),
    onUnwatch: fn(),
    onToggleBookmark: fn(),
    size: "w-90",
  },
} satisfies Meta<typeof MovieCard>;

export default meta;
type Story = StoryObj<typeof meta>;

// A front that only shows a state: no tilt, no flip, nothing to click.
// inert = the browser ignores clicks and Tab inside it.
function StaticFront({ movie, id }: { movie: Movie; id: string }) {
  return (
    <FrontCard
      movie={movie}
      titleId={id}
      inert
      watchedRef={null}
      onToggleWatch={() => {}}
    />
  );
}

// A row of static fronts, each with a caption saying which state it shows
function StateGrid({
  cards,
}: {
  cards: { id: string; caption: string; movie: Movie }[];
}) {
  return (
    <ul className="grid grid-cols-[repeat(auto-fill,minmax(14rem,1fr))] gap-6">
      {cards.map((card) => (
        <li key={card.id}>
          <figure className="flex flex-col gap-2">
            <StaticFront id={card.id} movie={card.movie} />
            <figcaption className="font-mono text-sm">{card.caption}</figcaption>
          </figure>
        </li>
      ))}
    </ul>
  );
}

// The whole card, working like in the app: hover to tilt, ✓ to flip and rate,
// bookmark to add it to WannaWatch. The story remembers what you do, like a page would.
export const Card: Story = {
  render: function Render(args) {
    const [current, setCurrent] = useState(args.movie);
    return (
      <MovieCard
        {...args}
        movie={current}
        onRate={(rating) => {
          // Watched takes the movie off the WannaWatch list
          setCurrent((m) => ({
            ...m,
            isWatched: true,
            watchScore: rating,
            isBookmarked: false,
          }));
          args.onRate?.(rating);
        }}
        onUnwatch={() => {
          setCurrent((m) => ({ ...m, isWatched: false, watchScore: null }));
          args.onUnwatch?.();
        }}
        onToggleBookmark={() => {
          // Bookmarking makes it "not watched yet" again
          setCurrent((m) =>
            m.isBookmarked
              ? { ...m, isBookmarked: false }
              : { ...m, isBookmarked: true, isWatched: false, watchScore: null },
          );
          args.onToggleBookmark?.();
        }}
      />
    );
  },
  // Runs in the Interactions tab: clicks the bookmark and checks it turns on
  play: async ({ args, canvas, userEvent }) => {
    const bookmark = canvas.getByRole("button", { name: "Bookmarked" });
    await expect(bookmark).toHaveAttribute("aria-pressed", "false");

    await userEvent.click(bookmark);
    await expect(bookmark).toHaveAttribute("aria-pressed", "true");
    await expect(args.onToggleBookmark).toHaveBeenCalledOnce();
  },
};

// Just the front, with working buttons: ✓ marks it watched and the bookmark adds it to
// WannaWatch. The card never turns, so the score is a fixed "It's ok" (0).
export const FrontInteractive: Story = {
  parameters: { controls: { disable: true } },
  render: function Render(args) {
    const [current, setCurrent] = useState(args.movie);
    return (
      <div className="w-90">
        <FrontCard
          movie={current}
          titleId="front"
          inert={false}
          watchedRef={null}
          onToggleWatch={() => {
            // Watched takes the movie off the WannaWatch list
            setCurrent((m) =>
              m.isWatched
                ? { ...m, isWatched: false, watchScore: null }
                : { ...m, isWatched: true, watchScore: 0, isBookmarked: false },
            );
            action("onToggleWatch")();
          }}
          onToggleBookmark={() => {
            // Bookmarking makes it "not watched yet" again
            setCurrent((m) =>
              m.isBookmarked
                ? { ...m, isBookmarked: false }
                : { ...m, isBookmarked: true, isWatched: false, watchScore: null },
            );
            args.onToggleBookmark?.();
          }}
        />
      </div>
    );
  },
  // Clicking ✓ turns it on without turning the card: no rating slider appears
  play: async ({ canvas, userEvent }) => {
    const watched = canvas.getByRole("button", { name: "Not watched" });
    await userEvent.click(watched);
    await expect(watched).toHaveAttribute("aria-pressed", "true");
    await expect(canvas.queryByRole("slider")).toBeNull();
  },
};

// The Watched button in every state: not watched, then one card per score
export const WatchStates: Story = {
  name: "Watch states",
  parameters: { layout: "padded", controls: { disable: true } },
  render: () => (
    <StateGrid
      cards={[
        {
          id: "not-watched",
          caption: "Not watched",
          movie: { ...movie, isWatched: false, isBookmarked: false },
        },
        ...RATINGS.map((rating) => ({
          id: `watched-${rating}`,
          caption: ratingLabel(rating),
          movie: {
            ...movie,
            isWatched: true,
            watchScore: rating,
            isBookmarked: false,
          },
        })),
      ]}
    />
  ),
};

// The Bookmark button off and on
export const BookmarkStates: Story = {
  name: "Bookmark states",
  parameters: { layout: "padded", controls: { disable: true } },
  render: () => (
    <StateGrid
      cards={[
        {
          id: "not-bookmarked",
          caption: "Not bookmarked",
          movie: { ...movie, isWatched: false, isBookmarked: false },
        },
        {
          id: "bookmarked",
          caption: "Bookmarked",
          movie: { ...movie, isWatched: false, isBookmarked: true },
        },
      ]}
    />
  ),
};

// The back on its own: drag the liquid (or use the arrow keys) to pick a score.
// Confirm and Cancel only show up in the Actions panel: there's no card here to turn.
export const BackInteractive: Story = {
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story: `Wait ${HINT_DELAY_MS / 1000} seconds without dragging to see the "Drag the juice to rate" hint. It stops once you move the liquid.`,
      },
    },
  },
  render: (args) => (
    // The same card face as the real back
    <div className="@container relative isolate aspect-2/3 w-90 overflow-hidden rounded-xl border-3 border-border bg-card">
      {/* active: the back is "facing you", so its hint timer runs */}
      <LiquidRating
        title={movie.title}
        active
        onConfirm={(rating) => args.onRate?.(rating)}
        onCancel={action("onCancel")}
      />
    </div>
  ),
};
