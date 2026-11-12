// The app's addresses, written once. If a URL ever changes, only this file changes.

// One movie's page, by the movie API's id: 531178 → "/movie/531178"
export function movieHref(movieId: number) {
  return `/movie/${movieId}`;
}
