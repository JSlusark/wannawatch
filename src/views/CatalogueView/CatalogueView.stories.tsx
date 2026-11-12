import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect } from "storybook/test";

import { movies } from "@/data/movies";

import { CatalogueView } from "./CatalogueView";

const meta = {
  title: "Pages/Catalogue",
  component: CatalogueView,
  // Mock movies: the real page gets them from the movie API, Storybook never calls it
  args: { movies, page: 1, totalPages: 25 },
  parameters: {
    layout: "fullscreen",
    // Pretend we're on this URL, so the menu highlights the right link
    nextjs: { appDirectory: true, navigation: { pathname: "/catalogue" } },
  },
} satisfies Meta<typeof CatalogueView>;

export default meta;
type Story = StoryObj<typeof meta>;

// First page: only "Next"
export const Default: Story = {
  play: async ({ canvas }) => {
    await expect(
      canvas.queryByRole("link", { name: "Go to previous page" }),
    ).toBeNull();
    await expect(
      canvas.getByRole("link", { name: "Go to next page" }),
    ).toHaveAttribute("href", "/catalogue?page=2");
  },
};

// A page in the middle: both links. "Previous" from page 2 goes to plain /catalogue
export const MiddlePage: Story = {
  args: { page: 2 },
  play: async ({ canvas }) => {
    await expect(
      canvas.getByRole("link", { name: "Go to previous page" }),
    ).toHaveAttribute("href", "/catalogue");
    await expect(
      canvas.getByRole("link", { name: "Go to next page" }),
    ).toHaveAttribute("href", "/catalogue?page=3");
  },
};

// Last page: only "Previous"
export const LastPage: Story = {
  args: { page: 25 },
};

// Everything fits on one page: no page links at all
export const SinglePage: Story = {
  args: { totalPages: 1 },
};
