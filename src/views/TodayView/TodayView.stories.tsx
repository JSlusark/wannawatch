import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { TodayView } from "./TodayView";

const meta = {
  title: "Pages/Today",
  component: TodayView,
  parameters: {
    layout: "fullscreen",
    // Pretend we're on this URL, so the menu highlights the right link
    nextjs: { appDirectory: true, navigation: { pathname: "/today" } },
  },
} satisfies Meta<typeof TodayView>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
