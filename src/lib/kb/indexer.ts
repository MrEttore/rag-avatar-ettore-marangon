import type { PostgresJsDatabase } from "drizzle-orm/postgres-js";

import { generateEmbeddingsFromChunks } from "@/lib/ai/rag/embedding";
import { db } from "@/lib/db/client";
import { embeddingsTable } from "@/lib/db/schema/embeddings";
import { resourcesTable } from "@/lib/db/schema/resources";

type Db = PostgresJsDatabase<Record<string, never>>;

export async function initKnowledgeBase(
  input: {
    source: string;
    content: string;
    chunker: (content: string) => string[];
  },
  dbOverride?: Db,
): Promise<{ resourceId: string; chunks: number }> {
  const { source, content, chunker } = input;

  const database = (dbOverride ?? db) as Db;

  const [resource] = await database.insert(resourcesTable).values({ source, content }).returning();

  const chunks = chunker(content);
  const embeddings = await generateEmbeddingsFromChunks(chunks);

  if (embeddings.length > 0) {
    await database.insert(embeddingsTable).values(
      embeddings.map((embedding) => ({
        resourceId: resource.id,
        ...embedding,
      })),
    );
  }

  return { resourceId: resource.id, chunks: embeddings.length };
}

export async function resetKnowledgeBase(dbOverride?: Db): Promise<void> {
  const database = (dbOverride ?? db) as Db;
  await database.delete(resourcesTable);
}
