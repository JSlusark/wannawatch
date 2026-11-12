import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useState } from "react";
import { action } from "storybook/actions";
import { expect, fn } from "storybook/test";

import mockMovieData from "@/data/mockData.json";
import type { Movie } from "@/data/movies";
import type { UserMovie } from "@/data/userMovies";
import { movieHref } from "@/lib/routes";

import {
  HINT_DELAY_MS,
  LiquidRating,
  ratingLabel,
  type Rating,
} from "./BackCard";
import { FrontCard } from "./FrontCard";
import { MovieCard } from "./MovieCard";

// Mandy
const movie = mockMovieData[0] as Movie;

// Not watched, not bookmarked
const NOT_IN_LISTS: UserMovie = { watched: false, bookmarked: false };

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
function StaticFront({
  movie,
  userMovie,
  id,
}: {
  movie: Movie;
  userMovie?: UserMovie;
  id: string;
}) {
  return (
    <FrontCard
      movie={movie}
      userMovie={userMovie}
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
  cards: { id: string; caption: string; movie: Movie; userMovie?: UserMovie }[];
}) {
  return (
    <ul className="grid grid-cols-[repeat(auto-fill,minmax(14rem,1fr))] gap-6">
      {cards.map((card) => (
        <li key={card.id}>
          <figure className="flex flex-col gap-2">
            <StaticFront
              id={card.id}
              movie={card.movie}
              userMovie={card.userMovie}
            />
            <figcaption className="font-mono text-sm">
              {card.caption}
            </figcaption>
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
    const [userMovie, setUserMovie] = useState<UserMovie>(
      args.userMovie ?? NOT_IN_LISTS,
    );
    return (
      <MovieCard
        {...args}
        userMovie={userMovie}
        onRate={(rating) => {
          // Watched takes the movie off the WannaWatch list
          setUserMovie({ watched: true, bookmarked: false, rating });
          args.onRate?.(rating);
        }}
        onUnwatch={() => {
          setUserMovie((s) => ({ ...s, watched: false, rating: undefined }));
          args.onUnwatch?.();
        }}
        onToggleBookmark={() => {
          // Bookmarking makes it "not watched yet" again
          setUserMovie((s) =>
            s.bookmarked
              ? { ...s, bookmarked: false }
              : { watched: false, bookmarked: true },
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

// A card in a grid: clicking anywhere opens the movie's page (a link covers the card).
// The Watched and Bookmark buttons sit on top of the link, so they still do their own job.
export const Clickable: Story = {
  args: { href: movieHref(movie.id) },
  play: async ({ args, canvas, userEvent }) => {
    // One link, named after the movie, going to its page
    const link = canvas.getByRole("link", { name: movie.title });
    await expect(link).toHaveAttribute("href", movieHref(movie.id));

    // Keyboard (from the top of the page): the link comes first, then the two buttons
    await userEvent.tab();
    await expect(link).toHaveFocus();
    await userEvent.tab();
    await expect(
      canvas.getByRole("button", { name: "Not watched" }),
    ).toHaveFocus();

    // Clicking the bookmark toggles it, it doesn't follow the link
    await userEvent.click(canvas.getByRole("button", { name: "Bookmarked" }));
    await expect(args.onToggleBookmark).toHaveBeenCalledOnce();
  },
};

// Just the front, with working buttons: ✓ marks it watched and the bookmark adds it to
// WannaWatch. The card never turns, so the score is a fixed "It's ok" (0).
export const FrontInteractive: Story = {
  parameters: { controls: { disable: true } },
  render: function Render(args) {
    const [userMovie, setUserMovie] = useState<UserMovie>(NOT_IN_LISTS);
    return (
      <div className="w-90">
        <FrontCard
          movie={args.movie}
          userMovie={userMovie}
          titleId="front"
          inert={false}
          watchedRef={null}
          onToggleWatch={() => {
            // Watched takes the movie off the WannaWatch list
            setUserMovie((s) =>
              s.watched
                ? { ...s, watched: false, rating: undefined }
                : { watched: true, bookmarked: false, rating: 0 },
            );
            action("onToggleWatch")();
          }}
          onToggleBookmark={() => {
            // Bookmarking makes it "not watched yet" again
            setUserMovie((s) =>
              s.bookmarked
                ? { ...s, bookmarked: false }
                : { watched: false, bookmarked: true },
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
          movie,
          userMovie: NOT_IN_LISTS,
        },
        ...RATINGS.map((rating) => ({
          id: `watched-${rating}`,
          caption: ratingLabel(rating),
          movie,
          userMovie: { watched: true, bookmarked: false, rating },
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
          movie,
          userMovie: NOT_IN_LISTS,
        },
        {
          id: "bookmarked",
          caption: "Bookmarked",
          movie,
          userMovie: { watched: false, bookmarked: true },
        },
      ]}
    />
  ),
};

// What the card looks like when data is missing: first the poster link can't be found,
// then there are no scores (the API doesn't always have them), then nothing at all
export const MissingData: Story = {
  name: "Missing data",
  parameters: { layout: "padded", controls: { disable: true } },
  render: () => (
    <StateGrid
      cards={[
        {
          id: "no-poster",
          caption: "No poster",
          movie: { ...movie, image: null },
        },
        {
          id: "no-scores",
          caption: "No scores",
          movie: { ...movie, imdbScore: null, rottenTomatoesScore: null },
        },
        {
          id: "no-data",
          caption: "No movie data",
          movie: {
            id: 0,
            title: "",
            imdbScore: null,
            rottenTomatoesScore: null,
            genre: [],
            plot: "",
            image: null,
            year: null,
          },
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
