-- Creates the "movies" table, which stores information about movies, including their IDs from various sources, title, year, runtime, plot, poster URL, genres, director, cast, ratings, and an embedding vector for machine learning purposes. The table also includes timestamps for when the scores were last updated and when the record was created.
CREATE TABLE "movies" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "movies_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"trakt_id" integer NOT NULL,
	"imdb_id" text,
	"tmdb_id" integer,
	"title" text NOT NULL,
	"year" integer,
	"runtime" integer,
	"plot" text,
	"poster_url" text,
	"genres" text[] DEFAULT '{}' NOT NULL,
	"director" text,
	"cast" text[],
	"imdb_rating" real,
	"rotten_tomatoes_score" integer,
	"scores_updated_at" timestamp with time zone,
	"embedding" vector(384),
	"embedding_model" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "movies_trakt_id_unique" UNIQUE("trakt_id")
);
