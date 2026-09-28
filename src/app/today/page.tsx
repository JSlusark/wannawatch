import type { Metadata } from "next";

import { TodayView } from "@/views/TodayView";

// The browser tab title (every page needs its own, WCAG 2.4.2)
export const metadata: Metadata = { title: "Today's WannaWatch · WannaWatch" };

export default function Page() {
  return <TodayView />;
}
