import { sql } from "drizzle-orm";
import { pgTable, text, timestamp, uniqueIndex, varchar } from "drizzle-orm/pg-core";
import { z } from "zod";

import { nanoid } from "@/lib/utils";

export const resourcesTable = pgTable(
  "resources",
  {
    id: varchar("id", { length: 191 })
      .primaryKey()
      .$defaultFn(() => nanoid()),
    source: text("source").notNull(),
    content: text("content").notNull(),
    createdAt: timestamp("created_at")
      .notNull()
      .default(sql`now()`),
    updatedAt: timestamp("updated_at")
      .notNull()
      .default(sql`now()`),
  },
  (table) => [uniqueIndex("resources_source_unique").on(table.source)],
);

// Schema for resources - used to validate API requests
export const insertResourceSchema = z.object({
  content: z.string().min(1),
  source: z.string().min(1).optional(),
});

// Type for resources - used to type API request params and within Components
export type NewResourceParams = z.infer<typeof insertResourceSchema>;
