import type { Metadata } from "next";

import { CatalogueView } from "@/views/CatalogueView";

// The browser tab title (every page needs its own, WCAG 2.4.2)
export const metadata: Metadata = { title: "Movie catalogue · WannaWatch" };

export default function Page() {
  return <CatalogueView />;
}
