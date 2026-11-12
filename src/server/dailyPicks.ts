import "server-only"; // build error if a browser component ever imports this file

import { and, gte, isNotNull, notInArray, sql } from "drizzle-orm";
import { connection } from "next/server";

import type { Movie } from "@/data/movies";
import { db } from "@/server/db";
import { cardColumns, toMovie } from "@/server/db/movieRows";
import { movies } from "@/server/db/schema";
import { withScores } from "@/server/scores";

// How many movies the Daily 10 has
const DAILY_COUNT = 10;
// Feature films only: the table also has shorts (a 4-minute Pixar short came up), and
// 1,311 of its movies are under an hour. 27,432 are left to choose from
const MIN_RUNTIME_MINUTES = 60;

// Today's 10 suggestions, from your movies table: 10 random movies on every visit
// (a mock until the real recommendations pick them from your taste).
// Only feature-length movies with a poster and a plot (a card without them isn't worth
// swiping), and
// never one already in your lists (`skip`: the ids you watched or bookmarked).
export async function getDailyPicks(skip: number[]): Promise<Movie[]> {
  // A new draw on every visit, never one fixed at build time
  await connection();

  const rows = await db
    .select(cardColumns)
    .from(movies)
    .where(
      and(
        isNotNull(movies.posterUrl),
        isNotNull(movies.plot),
        gte(movies.runtime, MIN_RUNTIME_MINUTES),
        skip.length > 0 ? notInArray(movies.traktId, skip) : undefined,
      ),
    )
    // random() gives every row a new random number; sorting by it shuffles the table.
    // Fine for ~29,000 rows (a few milliseconds)
    .orderBy(sql`random()`)
    .limit(DAILY_COUNT);

  return withScores(rows.map(toMovie));
}
