import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { fn } from "storybook/test";

import mockMovieData from "@/data/mockData.json";

import { LiquidRating } from "./BackCard";

const movie = mockMovieData[0];

// The back of the movie card on its own, without having to flip the card first.
// Drag the grip on the liquid (or focus it and use the arrow keys) to change the score.
const meta = {
  title: "Components/MovieCard/BackCard",
  component: LiquidRating,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
  args: {
    title: movie?.title ?? "Mandy",
    onConfirm: fn(),
    onCancel: fn(),
  },
  // LiquidRating fills whatever box it's in, so give it the same card face as the real back
  decorators: [
    (Story) => (
      <div className="relative isolate aspect-2/3 w-90 overflow-hidden rounded-2xl border-3 border-foreground bg-card">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof LiquidRating>;

export default meta;
type Story = StoryObj<typeof meta>;

// Confirm and Cancel show up in the Actions panel
export const Default: Story = {};
