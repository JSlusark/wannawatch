import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn, within } from "storybook/test";

import { movies, type Movie, type SimilarMovies } from "@/data/movies";
import { mockUserMovies } from "@/data/userMovies";

import { MovieView } from "./MovieView";

// Mandy: a mock movie with every detail filled in (director, cast, long plot)
const mandy = movies.find((movie) => movie.title === "Mandy")!;
// Paprika: on the mock user's WannaWatch list
const paprika = movies.find((movie) => movie.title === "Paprika")!;

// Mock recommendations: 10 other mock movies (the real page asks the vector search,
// which never recommends a movie to itself)
function similarTo(movie: Movie): SimilarMovies {
  return {
    status: "ok",
    movies: movies.filter((other) => other.id !== movie.id).slice(0, 10),
  };
}
const similar = similarTo(mandy);

const meta = {
  title: "Pages/Movie",
  component: MovieView,
  // Mock movie: the real page gets it from the movie API, Storybook never calls it
  args: { movie: mandy, similar, userMovies: mockUserMovies, save: fn() },
  parameters: {
    layout: "fullscreen",
    nextjs: { appDirectory: true, navigation: { pathname: "/movie/308070" } },
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

    // The big card (named after the movie): the recommendations have buttons too
    const card = within(canvas.getByRole("article", { name: mandy.title }));
    const bookmark = card.getByRole("button", { name: "Bookmarked" });
    await expect(bookmark).toHaveAttribute("aria-pressed", "false");
    await userEvent.click(bookmark);
    await expect(bookmark).toHaveAttribute("aria-pressed", "true");
    await expect(args.save).toHaveBeenCalledWith(mandy, { bookmarked: true });

    // Under the details: 10 recommendations, each a link to its own movie page
    const recommendations = canvas.getByRole("region", {
      name: "More like this",
    });
    await expect(recommendations.querySelectorAll("article")).toHaveLength(10);
    const first = similar.status === "ok" ? similar.movies[0]! : mandy;
    await expect(
      canvas.getByRole("link", { name: first.title }),
    ).toHaveAttribute("href", `/movie/${first.id}`);
  },
};

// A movie already on WannaWatch: the card opens bookmarked
export const Bookmarked: Story = {
  args: { movie: paprika, similar: similarTo(paprika) },
  play: async ({ canvas }) => {
    const card = within(canvas.getByRole("article", { name: paprika.title }));
    await expect(
      card.getByRole("button", { name: "Bookmarked" }),
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
