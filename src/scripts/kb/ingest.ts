import { eq, sql } from "drizzle-orm";

import { chunkDocsByTextStructure, generateEmbeddings } from "@/lib/ai/rag";
import { createScriptDb } from "@/lib/db/client";
import { embeddingsTable } from "@/lib/db/schema/embeddings";
import { resourcesTable } from "@/lib/db/schema/resources";

import { loadDocs } from "./load-docs";

// TODO: Implement ingestion with PGVectorStore integration (?).

async function main() {
  const { db, close } = createScriptDb();

  try {
    const docs = await loadDocs();
    console.log(`=> Loaded ${docs.length} docs from KN.`);

    let totalChunks = 0;
    let totalEmbeddings = 0;

    for (const doc of docs) {
      const content = doc.pageContent;
      const source = doc.metadata.source;

      const [resource] = await db
        .insert(resourcesTable)
        .values({ source, content })
        .onConflictDoUpdate({
          target: resourcesTable.source,
          set: {
            content,
            updatedAt: sql`now()`,
          },
        })
        .returning();

      // TODO: Different chunking strategies based on doc type.
      const chunks = await chunkDocsByTextStructure([doc]);
      totalChunks += chunks.length;

      const embeddings = await generateEmbeddings(chunks);
      totalEmbeddings += embeddings.length;

      await db.delete(embeddingsTable).where(eq(embeddingsTable.resourceId, resource.id));

      if (embeddings.length > 0) {
        await db.insert(embeddingsTable).values(
          embeddings.map((e) => ({
            resourceId: resource.id,
            content: e.content,
            embedding: e.embedding,
          })),
        );
      }

      console.log(
        `- Ingested ${source} (resource=${resource.id}, chunks=${chunks.length}, embeddings=${embeddings.length})`,
      );
    }

    console.log(`=> Done. Inserted/updated ${docs.length} resources.`);
    console.log(`=> Total chunks: ${totalChunks}. Total embeddings: ${totalEmbeddings}.`);
  } finally {
    await close();
  }
}

main().catch((err) => {
  console.error("Ingestion failed ❌");
  console.error(err);
  process.exitCode = 1;
});
