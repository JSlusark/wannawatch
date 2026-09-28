import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { ProfileView } from "./ProfileView";

const meta = {
  title: "Pages/Profile",
  component: ProfileView,
  parameters: {
    layout: "fullscreen",
    // Pretend we're on this URL, so the menu highlights the right link
    nextjs: { appDirectory: true, navigation: { pathname: "/profile" } },
  },
} satisfies Meta<typeof ProfileView>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
