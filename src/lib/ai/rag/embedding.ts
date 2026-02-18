import type { Document } from "@langchain/core/documents";
import { embed, embedMany } from "ai";
import { cosineDistance, desc, gt, sql } from "drizzle-orm";

import { openai } from "@/lib/ai/providers";
import { db } from "@/lib/db/client";
import { embeddingsTable } from "@/lib/db/schema/embeddings";

export const generateEmbeddings = async (
  chunks: Document[],
): Promise<Array<{ embedding: number[]; content: string }>> => {
  if (chunks.length === 0) return [];

  const { embeddings } = await embedMany({
    model: openai.embedding("text-embedding-3-small"),
    values: chunks.map((chunk) => chunk.pageContent),
  });

  return embeddings.map((e, i) => ({ content: chunks[i].pageContent, embedding: e }));
};

export const generateEmbedding = async (value: string): Promise<number[]> => {
  const input = value.replace(/\s+/g, " ").trim();

  const { embedding } = await embed({
    model: openai.embedding("text-embedding-3-small"),
    value: input,
  });

  return embedding;
};

export const findRelevantContent = async (userQuery: string) => {
  const userQueryEmbedded = await generateEmbedding(userQuery);
  const similarity = sql<number>`1 - (${cosineDistance(embeddingsTable.embedding, userQueryEmbedded)})`;

  const similarGuides = await db
    .select({ name: embeddingsTable.content, similarity })
    .from(embeddingsTable)
    .where(gt(similarity, 0.2))
    .orderBy((t) => desc(t.similarity))
    .limit(8);

  return similarGuides;
};
