import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import { env } from "@/config/env";

if (!env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not defined");
}

const client = postgres(env.DATABASE_URL);
export const db = drizzle(client);

export function createScriptDb() {
  const scriptClient = postgres(env.DATABASE_URL, { max: 1 });
  const scriptDb = drizzle(scriptClient);

  return {
    db: scriptDb,
    close: async () => {
      await scriptClient.end({ timeout: 5 });
    },
  };
}
