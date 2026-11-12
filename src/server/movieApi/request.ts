// Plain code with no Next.js parts, so the app *and* the scripts in scripts/ can use it.
// The Next.js-only lines ("server-only", connection()) live in src/server/movies.ts,
// the file the pages call.

// The movie API we use (Trakt). Its address and header names are fixed by the service.
const MOVIE_API_URL = "https://api.trakt.tv";

// An error that keeps the API's status code, so the caller can tell
// "this movie doesn't exist" (404) from "the API is down" (500)
export class MovieApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
    this.name = "MovieApiError";
  }
}

// What comes back: the body (still unchecked) and the headers, which hold extra
// information such as how many pages a list has
type MovieApiResponse = { data: unknown; headers: Headers };

// Layer 1: talks to the movie API. Every request needs the same address and the same
// headers, so they live here and nowhere else.
export async function requestMovieApi(
  path: string,
  params: Record<string, string> = {},
): Promise<MovieApiResponse> {
  const apiKey = process.env.MOVIE_API_KEY;
  if (!apiKey) {
    throw new Error("MOVIE_API_KEY is missing at env.local");
  }

  const url = new URL(path, MOVIE_API_URL);
  url.search = new URLSearchParams(params).toString();

  const res = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      "trakt-api-version": "2", // which version of the API
      "trakt-api-key": apiKey, // who is asking (the app)
      // Which program is asking. The API blocks Node's default one with 403
      "User-Agent": "WannaWatch/0.1",
    },
    cache: "no-store", // not implemented yet
  });

  // 429 = "too many requests". Retry-After says how many seconds to wait.
  // Waiting and retrying comes with caching (step 4); for now, a clear error.
  if (res.status === 429) {
    console.error("Movie API rate limit:", res.headers.get("X-Ratelimit"));
    throw new MovieApiError(
      `Movie API says too many requests: try again in ${res.headers.get("Retry-After") ?? "a few"} seconds`,
      res.status,
    );
  }
  if (!res.ok) {
    throw new MovieApiError(
      `Movie API ${path} failed: ${res.status} ${res.statusText}`,
      res.status,
    );
  }
  return { data: await res.json(), headers: res.headers };
}
