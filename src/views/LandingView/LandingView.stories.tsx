import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { LandingView } from "./LandingView";

const meta = {
  title: "Pages/Landing",
  component: LandingView,
  parameters: {
    layout: "fullscreen",
    // Pretend we're on this URL, so the menu highlights the right link
    nextjs: { appDirectory: true, navigation: { pathname: "/" } },
  },
} satisfies Meta<typeof LandingView>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
