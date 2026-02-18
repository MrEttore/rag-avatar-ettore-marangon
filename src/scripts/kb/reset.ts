import { createScriptDb } from "@/lib/db/client";
import { resourcesTable } from "@/lib/db/schema/resources";

async function main() {
  const { db, close } = createScriptDb();

  console.log("=> Resetting knowledge base (deleting all resources + embeddings)...");
  try {
    await db.delete(resourcesTable);
    console.log("=> Done ✅");
  } finally {
    await close();
  }
}

main().catch((err) => {
  console.error("kb:reset failed ❌");
  console.error(err);
  process.exitCode = 1;
});
