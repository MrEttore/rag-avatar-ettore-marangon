import { Client } from "pg";

import { env } from "@/config/env";

async function main() {
  console.log("=> Testing DB connection...\n");
  if (!env.DATABASE_URL) throw new Error("DATABASE_URL is missing");

  console.log("=> Database URL: ", env.DATABASE_URL, "\n");

  const client = new Client({ connectionString: env.DATABASE_URL });
  await client.connect();

  const res = await client.query("select 1 as ok");
  console.log("DB OK:", res.rows[0]);

  await client.end();
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
