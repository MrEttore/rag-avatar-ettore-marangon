import type { Config } from "drizzle-kit";

// Keep this file dependency-free: dotenv-cli (via package.json scripts) loads `.env.local`.
// In CI/production, DATABASE_URL should be provided by the environment.
const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("DATABASE_URL is not defined");
}

export default {
  dialect: "postgresql",
  schema: "./src/lib/db/schema/index.ts",
  out: "./src/lib/db/migrations",
  dbCredentials: {
    url: databaseUrl,
  },
} satisfies Config;
