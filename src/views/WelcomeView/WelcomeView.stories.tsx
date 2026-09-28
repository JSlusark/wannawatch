import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { WelcomeView } from "./WelcomeView";

const meta = {
  title: "Pages/Welcome",
  component: WelcomeView,
  parameters: {
    layout: "fullscreen",
    // Pretend we're on this URL, so the menu highlights the right link
    nextjs: { appDirectory: true, navigation: { pathname: "/" } },
  },
} satisfies Meta<typeof WelcomeView>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
