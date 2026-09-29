import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { fn } from "storybook/test";

import mockMovieData from "@/data/mockData.json";

import { DragHint, FILL, HINT_DELAY_MS, LiquidRating } from "./BackCard";

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
      // @container: the content picks its sizes from this box's width, like on the real card
      <div className="@container relative isolate aspect-2/3 w-90 overflow-hidden rounded-xl border-3 border-border bg-card">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof LiquidRating>;

export default meta;
type Story = StoryObj<typeof meta>;

// Confirm and Cancel show up in the Actions panel.
// Wait 4 seconds without dragging to see the "Drag the juice to rate" hint appear.
export const Default: Story = {};

// Just the "Drag the juice to rate" hint, playing on repeat, so you can look at the
// animation without waiting.
// In the real card it's triggered by a timer: if the user hasn't dragged the liquid
// (or used the arrow keys) HINT_DELAY_MS (4 seconds) after the back appears, the hint
// shows for about 3 seconds, then hides, and comes back after another 4 idle seconds.
// It stops for good as soon as the user moves the liquid.
export const DragHintAnimation: Story = {
  name: "Drag hint animation",
  parameters: {
    docs: {
      description: {
        story: `Plays on repeat here. In the card it appears after ${HINT_DELAY_MS / 1000} seconds without a drag, and stops once the user moves the liquid.`,
      },
    },
  },
  render: (args) => (
    <>
      {/* active={false}: the back's own timer stays off, so only this looping hint shows */}
      <LiquidRating {...args} active={false} />
      {/* FILL[0] = the starting level ("It's ok"), where the hint sits in the real card */}
      <DragHint fill={FILL[0]} loop />
    </>
  ),
};
