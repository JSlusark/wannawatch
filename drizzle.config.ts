import { defineConfig } from "drizzle-kit";

// drizzle-kit runs outside Next.js, so it doesn't read .env.local by itself.
// Node can load it (no extra package needed).
process.loadEnvFile(".env.local");

const url = process.env.DATABASE_URL;
if (!url) {
  throw new Error("DATABASE_URL is missing in .env.local");
}

// Settings for drizzle-kit, the command-line tool that turns schema.ts into SQL
// files (migrations) and runs them on the database
export default defineConfig({
  dialect: "postgresql",
  schema: "./src/server/db/schema.ts", // where the tables are described
  out: "./drizzle", // where the generated SQL files go
  dbCredentials: { url },
});
