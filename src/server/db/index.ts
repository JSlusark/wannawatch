import "server-only"; // triggers a build error to avoid browser imports

import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import { USE_STATIC_MOVIES } from "@/server/static/queries";

import * as schema from "./schema";

// With the static movies (src/server/static/) the database is never asked anything,
// so the deployed site can run without one. postgres() only connects on the first
// query, so creating it with no address is harmless
const url = process.env.DATABASE_URL;
if (!url && !USE_STATIC_MOVIES) {
  throw new Error("DATABASE_URL is missing in .env.local");
}

// The connection to Postgres. In development, Next.js reloads files every time I
// save, and each reload would open a new set of connections until Postgres refuses
// more. Keeping the connection on globalThis (which survives reloads) reuses it.
const globalForDb = globalThis as unknown as {
  dbClient?: ReturnType<typeof postgres>;
};
const client = globalForDb.dbClient ?? (url ? postgres(url) : postgres());
if (process.env.NODE_ENV !== "production") {
  globalForDb.dbClient = client;
}

// What the rest of the server code imports: `db.select().from(movies)`…
export const db = drizzle(client, { schema });
