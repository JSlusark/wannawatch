import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import * as schema from "@/server/db/schema";

// The database connection for scripts. The app uses src/server/db/index.ts instead,
// which has Next.js-only parts. A script must close the connection when it's done,
// otherwise Node keeps waiting and the script never ends.
export function connectDb() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error("DATABASE_URL is missing in .env.local");
  }
  const client = postgres(url);
  return { db: drizzle(client, { schema }), close: () => client.end() };
}
