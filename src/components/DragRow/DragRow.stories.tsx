import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, waitFor } from "storybook/test";

import { DragRow } from "./DragRow";

// 10 numbered boxes, each with a link, so the story shows only the row's behaviour
const ITEMS = Array.from({ length: 10 }, (_, i) => i + 1);

const meta = {
  title: "Components/DragRow",
  component: DragRow,
  tags: ["autodocs"],
  parameters: { layout: "padded" },
  args: {
    children: ITEMS.map((n) => (
      <a
        key={n}
        href={`#item-${n}`}
        className="grid aspect-2/3 place-items-center rounded-xl border-3 border-border bg-card font-display text-4xl outline-none focus-visible:ring-3 focus-visible:ring-ring"
      >
        {n}
      </a>
    )),
  },
} satisfies Meta<typeof DragRow>;

export default meta;
type Story = StoryObj<typeof meta>;

// Drag the row sideways with the mouse or a finger: 3 items in view (2 on a phone)
export const Default: Story = {};

// Keyboard: tabbing to an item out of view slides the row until it's fully visible
export const KeyboardSlidesIntoView: Story = {
  play: async ({ canvas, userEvent }) => {
    const fifth = canvas.getByRole("link", { name: "5" });
    const viewport = fifth.closest("ul")!.parentElement!;
    const inView = () => {
      const box = fifth.getBoundingClientRect();
      const edges = viewport.getBoundingClientRect();
      return box.left >= edges.left - 1 && box.right <= edges.right + 1;
    };
    await expect(inView()).toBe(false);
    for (let i = 0; i < 5; i++) await userEvent.tab();
    await expect(fifth).toHaveFocus();
    await waitFor(() => expect(inView()).toBe(true));
  },
};
