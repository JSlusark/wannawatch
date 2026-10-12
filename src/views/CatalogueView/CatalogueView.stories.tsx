import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { movies } from "@/data/movies";

import { CatalogueView } from "./CatalogueView";

const meta = {
  title: "Pages/Catalogue",
  component: CatalogueView,
  // Mock movies: the real page gets them from the movie API, Storybook never calls it
  args: { movies },
  parameters: {
    layout: "fullscreen",
    // Pretend we're on this URL, so the menu highlights the right link
    nextjs: { appDirectory: true, navigation: { pathname: "/catalogue" } },
  },
} satisfies Meta<typeof CatalogueView>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
