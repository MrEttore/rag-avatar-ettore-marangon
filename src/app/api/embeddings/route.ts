import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { reduceEmbeddings } from "@/lib/ai/rag/reduceEmbeddings";

const QuerySchema = z.object({
  dim: z.coerce
    .number()
    .int()
    .refine((v) => v === 2 || v === 3, "dim must be 2 or 3")
    .default(2),
  limit: z.coerce.number().int().positive().max(50_000).default(1000),
});

export async function GET(request: NextRequest) {
  const searchParams = Object.fromEntries(request.nextUrl.searchParams);

  const parsed = QuerySchema.safeParse(searchParams);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid query parameters", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const { dim, limit } = parsed.data;

  try {
    const data = await reduceEmbeddings(dim, limit);
    return NextResponse.json(data, { status: 200 });
  } catch (error: unknown) {
    console.error("Error computing reduced embeddings", error);
    const message = error instanceof Error ? error.message : String(error) || "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
