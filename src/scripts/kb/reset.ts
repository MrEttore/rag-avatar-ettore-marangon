import { createScriptDb } from "@/lib/db/client";
import { resetKnowledgeBase } from "@/lib/kb/indexer";

async function main() {
  const { db, close } = createScriptDb();

  console.log("=> Resetting knowledge base (deleting all resources + embeddings)...");
  try {
    await resetKnowledgeBase(db);
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
