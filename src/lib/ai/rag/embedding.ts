import { embed, embedMany } from "ai";
import { cosineDistance, desc, gt, sql } from "drizzle-orm";

import { openai } from "@/lib/ai/providers";
import { chunkByMarkdownH2Sections } from "@/lib/ai/rag";
import { db } from "@/lib/db/client";
import { embeddingsTable } from "@/lib/db/schema/embeddings";

export const generateEmbeddings = async (
  value: string,
): Promise<Array<{ embedding: number[]; content: string }>> => {
  const chunks = chunkByMarkdownH2Sections(value);

  return generateEmbeddingsFromChunks(chunks);
};

export const generateEmbeddingsFromChunks = async (
  chunks: string[],
): Promise<Array<{ embedding: number[]; content: string }>> => {
  if (chunks.length === 0) return [];

  const { embeddings } = await embedMany({
    model: openai.embedding("text-embedding-ada-002"),
    values: chunks,
  });

  return embeddings.map((e, i) => ({ content: chunks[i], embedding: e }));
};

export const generateEmbedding = async (value: string): Promise<number[]> => {
  const input = value.replace(/\s+/g, " ").trim();

  const { embedding } = await embed({
    model: openai.embedding("text-embedding-ada-002"),
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
    .where(gt(similarity, 0.5))
    .orderBy((t) => desc(t.similarity))
    .limit(5);

  return similarGuides;
};
