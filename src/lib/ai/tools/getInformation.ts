import { tool } from "ai";
import z from "zod";

import { env } from "@/config/env";
import { findRelevantContent } from "@/lib/ai/rag/embedding";

export const getInformation = tool({
  description: `Get information from your knowledge base to answer user's questions about ${env.PERSONA_NAME}.`,
  inputSchema: z.object({
    question: z.string().describe("The user's question"),
  }),
  execute: async ({ question }) => findRelevantContent(question),
});
