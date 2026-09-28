import type { Metadata } from "next";

import { ProfileView } from "@/views/ProfileView";

// The browser tab title (every page needs its own, WCAG 2.4.2)
export const metadata: Metadata = { title: "Profile · WannaWatch" };

export default function Page() {
  return <ProfileView />;
}
