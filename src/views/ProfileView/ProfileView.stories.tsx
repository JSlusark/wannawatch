import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { movies } from "@/data/movies";
import { mockUserMovies } from "@/data/userMovies";

import { ProfileView } from "./ProfileView";

// The same starting lists the server's mock library has (src/server/userLibrary.ts)
const library = movies.flatMap((movie) => {
  const userMovie = mockUserMovies[movie.id];
  return userMovie ? [{ movie, userMovie }] : [];
});

const meta = {
  title: "Pages/Profile",
  component: ProfileView,
  args: { library },
  parameters: {
    layout: "fullscreen",
    // Pretend we're on this URL, so the menu highlights the right link
    nextjs: { appDirectory: true, navigation: { pathname: "/profile" } },
  },
} satisfies Meta<typeof ProfileView>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
