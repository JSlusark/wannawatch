import type { Metadata } from "next";

import { getDailyPicks } from "@/server/dailyPicks";
import { getUserMovies } from "@/server/userLibrary";
import { DailyPicksView } from "@/views/DailyPicksView";

// The browser tab title (every page needs its own, WCAG 2.4.2)
export const metadata: Metadata = { title: "Today's WannaWatch · WannaWatch" };

export default async function Page() {
  // Movies already in your lists are never suggested again
  const userMovies = await getUserMovies();
  const marked = Object.entries(userMovies)
    .filter(([, mark]) => mark.watched || mark.bookmarked)
    .map(([id]) => Number(id));

  const movies = await getDailyPicks(marked);
  return <DailyPicksView movies={movies} />;
}
