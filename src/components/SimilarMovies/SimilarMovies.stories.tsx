import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn } from "storybook/test";

import { movies } from "@/data/movies";
import { mockUserMovies } from "@/data/userMovies";

import { SimilarMovies } from "./SimilarMovies";

const meta = {
  title: "Components/SimilarMovies",
  component: SimilarMovies,
  tags: ["autodocs"],
  parameters: { layout: "padded" },
  // Mock movies: the real page gets them from the vector search
  args: {
    similar: { status: "ok", movies: movies.slice(0, 10) },
    userMovies: mockUserMovies,
    onUpdate: fn(),
  },
} satisfies Meta<typeof SimilarMovies>;

export default meta;
type Story = StoryObj<typeof meta>;

// 10 clickable cards; the ones on the mock lists show their marks
export const Default: Story = {
  play: async ({ canvas }) => {
    await expect(canvas.getAllByRole("article")).toHaveLength(10);
  },
};

// Bookmarking a recommendation hands the change to the page (onUpdate)
export const MarkARecommendation: Story = {
  args: { similar: { status: "ok", movies: movies.slice(0, 1) } },
  play: async ({ args, canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole("button", { name: "Bookmarked" }));
    await expect(args.onUpdate).toHaveBeenCalledWith(movies[0], {
      bookmarked: true,
    });
  },
};

// The movie isn't in the local database, so there's nothing to compare it with
export const NotInDatabase: Story = {
  args: { similar: { status: "not-in-database" } },
  play: async ({ canvas }) => {
    await expect(canvas.queryAllByRole("article")).toHaveLength(0);
    await expect(
      canvas.getByText(/isn't in the recommendations database/),
    ).toBeVisible();
  },
};

// The database didn't answer (e.g. Docker isn't running): the page still works
export const Unavailable: Story = {
  args: { similar: { status: "unavailable" } },
  play: async ({ canvas }) => {
    await expect(canvas.getByText(/can't load right now/)).toBeVisible();
  },
};
