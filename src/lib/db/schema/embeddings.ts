import { index, pgTable, text, varchar, vector } from "drizzle-orm/pg-core";

import { resourcesTable } from "@/lib/db/schema/resources";
import { nanoid } from "@/lib/utils/nanoid";

export const embeddingsTable = pgTable(
  "embeddings",
  {
    id: varchar("id", { length: 191 })
      .primaryKey()
      .$defaultFn(() => nanoid()),
    resourceId: varchar("resource_id", { length: 191 })
      .notNull()
      .references(() => resourcesTable.id, {
        onDelete: "cascade",
      }),
    content: text("content").notNull(),
    embedding: vector("embedding", { dimensions: 1536 }).notNull(),
  },
  (table) => [index("embeddingIndex").using("hnsw", table.embedding.op("vector_cosine_ops"))],
);
