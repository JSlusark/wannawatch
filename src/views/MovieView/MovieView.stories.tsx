import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn } from "storybook/test";

import { movies } from "@/data/movies";
import { mockUserMovies } from "@/data/userMovies";

import { MovieView } from "./MovieView";

// Mandy: a mock movie with every detail filled in (director, cast, long plot)
const mandy = movies.find((movie) => movie.id === 1)!;
// Paprika: on the mock user's WannaWatch list
const paprika = movies.find((movie) => movie.id === 2)!;

const meta = {
  title: "Pages/Movie",
  component: MovieView,
  // Mock movie: the real page gets it from the movie API, Storybook never calls it
  args: { movie: mandy, userMovies: mockUserMovies, save: fn() },
  parameters: {
    layout: "fullscreen",
    nextjs: { appDirectory: true, navigation: { pathname: "/movie/1" } },
  },
} satisfies Meta<typeof MovieView>;

export default meta;
type Story = StoryObj<typeof meta>;

// A movie the user hasn't marked: the title is the page heading, and bookmarking it
// hands the change to `save` (the server's library in the real app)
export const Default: Story = {
  play: async ({ canvas, args, userEvent }) => {
    await expect(
      canvas.getByRole("heading", { level: 1, name: mandy.title }),
    ).toBeVisible();

    const bookmark = canvas.getByRole("button", { name: "Bookmarked" });
    await expect(bookmark).toHaveAttribute("aria-pressed", "false");
    await userEvent.click(bookmark);
    await expect(bookmark).toHaveAttribute("aria-pressed", "true");
    await expect(args.save).toHaveBeenCalledWith(mandy, { bookmarked: true });
  },
};

// A movie already on WannaWatch: the card opens bookmarked
export const Bookmarked: Story = {
  args: { movie: paprika },
  play: async ({ canvas }) => {
    await expect(
      canvas.getByRole("button", { name: "Bookmarked" }),
    ).toHaveAttribute("aria-pressed", "true");
  },
};

// A movie with no poster and no scores (common for movies the API knows little about)
export const MissingDetails: Story = {
  args: {
    movie: {
      ...mandy,
      id: 999,
      image: null,
      imdbScore: null,
      rottenTomatoesScore: null,
      director: undefined,
      cast: undefined,
    },
  },
};
