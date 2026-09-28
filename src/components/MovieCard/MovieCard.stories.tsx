import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useState } from "react";
import { expect, fn } from "storybook/test";
import mockMovieData from "@/data/mockData.json";

import type { Rating } from "./BackCard";
import { MovieCard } from "./MovieCard";

const movie = mockMovieData[0];

const meta = {
  component: MovieCard,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
  args: {
    title: movie?.title,
    genres: movie?.genre,
    plot: movie?.plot,
    imdbScore: movie?.imdbScore,
    rottenTomatoesScore: movie?.rottenTomatoesScore,
    posterUrl: movie?.image,
    onUnwatch: fn(),
    onToggleWannaWatch: fn(),
    onRate: fn(),
    size: "w-90",
  },
} satisfies Meta<typeof MovieCard>;

export default meta;
type Story = StoryObj<typeof meta>;

// Buttons toggle for real, so you can click them in Storybook
export const Interactive: Story = {
  render: function Render(args) {
    const [watched, setWatched] = useState(false);
    const [onList, setOnList] = useState(false);
    const [rating, setRating] = useState<Rating>();
    return (
      <MovieCard
        {...args}
        watched={watched}
        bookmarked={onList}
        rating={rating}
        onRate={(value) => {
          setRating(value);
          setWatched(true);
          args.onRate?.(value);
        }}
        onUnwatch={() => {
          setWatched(false);
          setRating(undefined);
          args.onUnwatch?.();
        }}
        onToggleWannaWatch={() => {
          setOnList(!onList);
          args.onToggleWannaWatch?.();
        }}
      />
    );
  },
  // This is a test that runs in Storybook's "Interactions" tab. It simulates a user clicking the "Bookmark" button and checks that the button's aria-pressed attribute changes and that the onToggleWannaWatch callback is called.
  play: async ({ args, canvas, userEvent }) => {
    const save = canvas.getByRole("button", { name: "Bookmarked" });
    await expect(save).toHaveAttribute("aria-pressed", "false");

    await userEvent.click(save);
    await expect(save).toHaveAttribute("aria-pressed", "true");
    await expect(args.onToggleWannaWatch).toHaveBeenCalledOnce();
  },
};
