import type { Metadata } from "next";

import { saveUserMovie } from "@/server/actions/userMovies";
import { getLibrary } from "@/server/userLibrary";
import { ProfileView } from "@/views/ProfileView";

// The browser tab title (every page needs its own, WCAG 2.4.2)
export const metadata: Metadata = { title: "Profile · WannaWatch" };

// Reads the mock library on every visit, so movies marked in the catalogue show up here
export default async function Page() {
  const library = await getLibrary();
  return <ProfileView library={library} save={saveUserMovie} />;
}
