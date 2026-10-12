import type { Metadata } from "next";

import { getPopularMovies } from "@/server/movies";
import { CatalogueView } from "@/views/CatalogueView";

// The browser tab title (every page needs its own, WCAG 2.4.2)
export const metadata: Metadata = { title: "Movie catalogue · WannaWatch" };

// A Server Component: runs on the server, so it can ask the movie API directly and the
// secret key never reaches the browser
export default async function Page() {
  const movies = await getPopularMovies();
  console.log("Catalogue page: got", movies.length, "movies");
  return <CatalogueView movies={movies} />;
}
