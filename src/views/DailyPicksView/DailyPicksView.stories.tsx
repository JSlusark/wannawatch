import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { DailyPicksView } from "./DailyPicksView";

const meta = {
  title: "Pages/Daily Picks",
  component: DailyPicksView,
  parameters: {
    layout: "fullscreen",
    // Pretend we're on this URL, so the menu highlights the right link
    nextjs: { appDirectory: true, navigation: { pathname: "/daily" } },
  },
} satisfies Meta<typeof DailyPicksView>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
