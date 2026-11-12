import {
  integer, // refers
  pgTable,
  real,
  text,
  timestamp,
  vector,
} from "drizzle-orm/pg-core";

// How many numbers the embedding model gives for every text. bge-small-en-v1.5
// always gives 384. If the model changes, this changes too and every movie is
// embedded again (vectors from different models can't be compared).
export const EMBEDDING_DIMENSIONS = 384;

// Movies: one row per movie, shared by every user. The facts about a movie, as in
// docs/backend/backend-plan.md, plus its embedding. What a user did with a movie
// (watched, score, WannaWatch) will live in a separate table.
export const movies = pgTable("movies", {
  // The database makes the id itself: 1, 2, 3…
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),

  // The movie API's id. Unique: this is what stops the same movie being saved twice
  traktId: integer("trakt_id").notNull().unique(),
  // Other sites' ids, kept in case we ever switch API
  imdbId: text("imdb_id"),
  tmdbId: integer("tmdb_id"),

  title: text("title").notNull(),
  year: integer("year"),
  runtime: integer("runtime"), // minutes
  plot: text("plot"),
  posterUrl: text("poster_url"), // only the address of the image
  genres: text("genres").array().notNull().default([]),
  director: text("director"),
  cast: text("cast").array(),

  imdbRating: real("imdb_rating"), // 8.8
  rottenTomatoesScore: integer("rotten_tomatoes_score"), // 79
  scoresUpdatedAt: timestamp("scores_updated_at", { withTimezone: true }),

  // The movie's meaning as 384 numbers. Empty until the embed script has run on it
  embedding: vector("embedding", { dimensions: EMBEDDING_DIMENSIONS }),
  // Which model made the embedding, so I know which rows to redo if it changes
  embeddingModel: text("embedding_model"),

  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

// The TypeScript types Drizzle works out from the table: a row as it comes back
// from the database, and a row as I send it in (the id and defaults are optional)
export type MovieRow = typeof movies.$inferSelect;
export type NewMovieRow = typeof movies.$inferInsert;
