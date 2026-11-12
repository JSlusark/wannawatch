import type { Metadata } from "next";

import { LandingView } from "@/views/LandingView";

export const metadata: Metadata = {
  // The browser tab title (every page needs its own, WCAG 2.4.2)
  title: "Welcome · WannaWatch",
  // Hidden for now (nothing links here until sign up exists), so ask search
  // engines not to list it
  robots: { index: false },
};

export default function Page() {
  return <LandingView />;
}
