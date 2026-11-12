import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { saveUserMovie } from "@/server/actions/userMovies";
import { getPopularMovies, toPageNumber } from "@/server/movies";
import { getUserMovies } from "@/server/userLibrary";
import { CatalogueView } from "@/views/CatalogueView";

// The browser tab title (every page needs its own, WCAG 2.4.2)
export const metadata: Metadata = { title: "Movie catalogue · WannaWatch" };

type PageProps = {
  // What's after the "?" in the URL, e.g. /catalogue?page=2 → { page: "2" }
  searchParams: Promise<{ page?: string | string[] }>;
};

// A Server Component: runs on the server, so it can ask the movie API directly and the
// secret key never reaches the browser
export default async function Page({ searchParams }: PageProps) {
  const page = toPageNumber((await searchParams).page);
  // Both at the same time: neither waits for the other
  const [moviePage, userMovies] = await Promise.all([
    getPopularMovies(page),
    getUserMovies(),
  ]);
  console.log(
    "Catalogue page",
    page,
    ": got",
    moviePage.movies.length,
    "movies",
  );

  // Past the last page (e.g. ?page=999): the API sends no movies and says "0 pages",
  // so we can't know where the list ends. Start again from page 1
  if (page > moviePage.totalPages) {
    redirect("/catalogue");
  }

  return (
    <CatalogueView
      {...moviePage}
      userMovies={userMovies}
      save={saveUserMovie}
    />
  );
}
