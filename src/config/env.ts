import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  server: {
    NODE_ENV: z.enum(["development", "test", "production"]).default("development"),

    DATABASE_URL: z.string().min(1),

    OPENAI_API_KEY: z.string().min(1),

    ANTHROPIC_API_KEY: z.string().min(1),

    PERSONA_NAME: z.string().min(1),
  },

  client: {
    // NEXT_PUBLIC_* only
  },

  experimental__runtimeEnv: {
    // Keep empty until you actually add NEXT_PUBLIC_* vars
  },
});
