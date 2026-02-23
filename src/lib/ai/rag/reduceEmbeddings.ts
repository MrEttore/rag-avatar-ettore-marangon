import { asc, eq } from "drizzle-orm";
import { UMAP } from "umap-js";

import { db } from "@/lib/db/client";
import { embeddingsTable } from "@/lib/db/schema/embeddings";
import { resourcesTable } from "@/lib/db/schema/resources";

const DEFAULT_UMAP_SEED = 42;

export type DocType = "professional" | "personal" | "education" | "projects" | "unknown";

/**
 * Type describing the payload returned to the client for plotting.
 */
export type EmbeddingPlotData = {
  dims: number;
  x: number[];
  y: number[];
  z: number[];
  colors: string[];
  text: string[];
};

/**
 * Determine the document category based on the source URL/filename.
 *
 * @param source The path or URL stored in the resource record
 */
export function inferDocTypeFromSource(source: string): DocType {
  const parts = source.split("/");
  const kbIdx = parts.indexOf("knowledge-base");
  const maybe = (kbIdx >= 0 ? parts[kbIdx + 1] : parts[0]) ?? "unknown";
  if (
    maybe === "professional" ||
    maybe === "personal" ||
    maybe === "education" ||
    maybe === "projects"
  ) {
    return maybe;
  }
  return "unknown";
}

/**
 * Assign a colour to each document type. These colours are used for the
 * markers in the Plotly scatter/scatter3d plot.
 */
export function colorForDocType(docType: DocType): string {
  const palette: Record<DocType, string> = {
    professional: "#ef4444",
    personal: "#3b82f6",
    education: "#f97316",
    projects: "#22c55e",
    unknown: "#6b7280",
  };
  return palette[docType];
}

/**
 * Clamp a numeric value between a lower and upper bound. Used to ensure
 * sensible defaults for dimensionality-reduction parameters.
 */
function clamp(n: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, n));
}

/**
 * Small, fast seeded PRNG (Mulberry32) that returns values in [0, 1). Used to ensure that UMAP produces the same output for the same input on every run.
 */
function createSeededRandom(seed: number): () => number {
  let state = seed >>> 0;

  return () => {
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t ^= t + Math.imul(t ^ (t >>> 7), 61 | t);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Retrieve embeddings from the database and run UMAP dimensionality
 * reduction on them. The returned object is ready to be
 * consumed by Plotly on the client.
 *
 * @param dims Number of dimensions to reduce to (2 or 3)
 * @param limit Maximum number of points to fetch (default 1000)
 */
export async function reduceEmbeddings(dims: 2 | 3 = 2, limit = 1000): Promise<EmbeddingPlotData> {
  const clampedLimit = clamp(limit, 50, 5000);

  const rows = await db
    .select({
      embedding: embeddingsTable.embedding,
      content: embeddingsTable.content,
      source: resourcesTable.source,
    })
    .from(embeddingsTable)
    .innerJoin(resourcesTable, eq(resourcesTable.id, embeddingsTable.resourceId))
    .orderBy(asc(resourcesTable.id), asc(embeddingsTable.id))
    .limit(clampedLimit);

  if (rows.length < 5) {
    throw new Error(
      "Not enough points to reduce/plot (need at least 5). Add more documents to your knowledge base first.",
    );
  }

  const vectors = rows.map((r) => r.embedding);
  const docTypes = rows.map((r) => inferDocTypeFromSource(r.source));
  const colors = docTypes.map((t) => colorForDocType(t));
  const hoverText = rows.map((r, i) => {
    const preview = (r.content ?? "").replace(/\s+/g, " ").trim().slice(0, 180);
    return `Type: ${docTypes[i]}\nSource: ${r.source}\nText: ${preview}…`;
  });

  const nNeighbors = clamp(Math.floor(rows.length / 20), 5, 30);
  const minDist = 0.1;
  const spread = 1.0;
  const nEpochs = 250;

  const umap = new UMAP({
    nComponents: dims,
    nNeighbors,
    minDist,
    spread,
    nEpochs,
    random: createSeededRandom(DEFAULT_UMAP_SEED),
  });

  const reduced: number[][] = umap.fit(vectors);
  const x = reduced.map((p) => p[0]);
  const y = reduced.map((p) => p[1]);
  const z = dims === 3 ? reduced.map((p) => p[2]) : [];

  return {
    dims,
    x,
    y,
    z,
    colors,
    text: hoverText,
  };
}
