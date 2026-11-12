import "server-only"; // triggers a build error to avoid browser imports

import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import * as schema from "./schema";

const url = process.env.DATABASE_URL;
if (!url) {
  throw new Error("DATABASE_URL is missing in .env.local");
}

// The connection to Postgres. In development, Next.js reloads files every time I
// save, and each reload would open a new set of connections until Postgres refuses
// more. Keeping the connection on globalThis (which survives reloads) reuses it.
const globalForDb = globalThis as unknown as {
  dbClient?: ReturnType<typeof postgres>;
};
const client = globalForDb.dbClient ?? postgres(url);
if (process.env.NODE_ENV !== "production") {
  globalForDb.dbClient = client;
}

// What the rest of the server code imports: `db.select().from(movies)`…
export const db = drizzle(client, { schema });
