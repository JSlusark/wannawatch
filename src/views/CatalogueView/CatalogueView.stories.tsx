import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { CatalogueView } from "./CatalogueView";

const meta = {
  title: "Pages/Catalogue",
  component: CatalogueView,
  parameters: {
    layout: "fullscreen",
    // Pretend we're on this URL, so the menu highlights the right link
    nextjs: { appDirectory: true, navigation: { pathname: "/catalogue" } },
  },
} satisfies Meta<typeof CatalogueView>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
