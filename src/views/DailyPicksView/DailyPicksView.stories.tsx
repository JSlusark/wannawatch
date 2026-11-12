import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { movies } from "@/data/movies";
import { mockUserMovies } from "@/data/userMovies";

import { DailyPicksView } from "./DailyPicksView";

// Mock picks, like before: the mock movies not in the mock lists (the real page draws
// 10 random movies from the database)
const picks = movies.filter((movie) => !mockUserMovies[movie.id]).slice(0, 10);

const meta = {
  title: "Pages/Daily Picks",
  component: DailyPicksView,
  args: { movies: picks },
  parameters: {
    layout: "fullscreen",
    // Pretend we're on this URL, so the menu highlights the right link
    nextjs: { appDirectory: true, navigation: { pathname: "/daily" } },
  },
} satisfies Meta<typeof DailyPicksView>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
