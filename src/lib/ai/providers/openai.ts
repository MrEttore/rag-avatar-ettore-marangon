import { createOpenAI } from "@ai-sdk/openai";

import { env } from "@/config/env";

export const openai = createOpenAI({
  apiKey: env.OPENAI_API_KEY,
});
