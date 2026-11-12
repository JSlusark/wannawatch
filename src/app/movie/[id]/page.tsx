import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { saveUserMovie } from "@/server/actions/userMovies";
import { getMovie } from "@/server/movies";
import { getUserMovies } from "@/server/userLibrary";
import { toPositiveInteger } from "@/lib/urlParams";
import { MovieView } from "@/views/MovieView";

type PageProps = {
  // The [id] part of the URL, e.g. /movie/531178 → { id: "531178" }
  params: Promise<{ id: string }>;
};

// The movie in the URL, or the "not found" page when the id is nonsense ("abc") or
// the movie API doesn't know it. getMovie is cached, so the tab title and the page
// share one API call.
async function loadMovie(params: PageProps["params"]) {
  const id = toPositiveInteger((await params).id);
  const movie = id ? await getMovie(id) : null;
  if (!movie) notFound();
  return movie;
}

// The browser tab title: the movie's name (every page needs its own, WCAG 2.4.2)
export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const movie = await loadMovie(params);
  return { title: `${movie.title} · WannaWatch` };
}

export default async function Page({ params }: PageProps) {
  // Both at the same time: neither waits for the other
  const [movie, userMovies] = await Promise.all([
    loadMovie(params),
    getUserMovies(),
  ]);
  return (
    <MovieView movie={movie} userMovies={userMovies} save={saveUserMovie} />
  );
}
