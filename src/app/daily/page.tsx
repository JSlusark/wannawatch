import type { Metadata } from "next";

import { DailyPicksView } from "@/views/DailyPicksView";

// The browser tab title (every page needs its own, WCAG 2.4.2)
export const metadata: Metadata = { title: "Today's WannaWatch · WannaWatch" };

export default function Page() {
  return <DailyPicksView />;
}
