import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";

import { asc, eq } from "drizzle-orm";
import open from "open";
import TSNE from "tsne-js";

import { createScriptDb } from "@/lib/db/client";
import { embeddingsTable } from "@/lib/db/schema/embeddings";
import { resourcesTable } from "@/lib/db/schema/resources";

const CONFIG = {
  limit: 2000,
  perplexity: 30,
  learningRate: 100,
  iterations: 500,
  earlyExaggeration: 4.0,
  plotlyCdn: "https://cdn.plot.ly/plotly-2.27.0.min.js",
};

type DocType = "professional" | "personal" | "education" | "projects" | "unknown";

function clamp(n: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, n));
}

function inferDocTypeFromSource(source: string): DocType {
  const parts = source.split("/");
  const kbIdx = parts.indexOf("knowledge-base");
  const maybe = (kbIdx >= 0 ? parts[kbIdx + 1] : parts[0]) ?? "unknown";

  if (
    maybe === "professional" ||
    maybe === "personal" ||
    maybe === "education" ||
    maybe === "projects"
  )
    return maybe;
  return "unknown";
}

function colorForDocType(docType: DocType): string {
  const palette: Record<DocType, string> = {
    professional: "red",
    personal: "blue",
    education: "orange",
    projects: "green",
    unknown: "gray",
  };
  return palette[docType];
}

async function main(dims: 2 | 3) {
  const limit = clamp(CONFIG.limit, 10, 5000);

  const { db, close } = createScriptDb();

  try {
    const rows = await db
      .select({
        embedding: embeddingsTable.embedding,
        content: embeddingsTable.content,
        source: resourcesTable.source,
      })
      .from(embeddingsTable)
      .innerJoin(resourcesTable, eq(resourcesTable.id, embeddingsTable.resourceId))
      .orderBy(asc(resourcesTable.id))
      .limit(limit);

    if (rows.length < 5) {
      throw new Error("Not enough points to reduce/plot (need at least 5).");
    }

    const vectors = rows.map((r) => r.embedding);
    const docTypes = rows.map((r) => inferDocTypeFromSource(r.source));
    const colors = docTypes.map(colorForDocType);

    const hoverText = rows.map((r, i) => {
      const preview = (r.content ?? "").replace(/\s+/g, " ").trim().slice(0, 180);
      return `Type: ${docTypes[i]}<br>Source: ${r.source}<br>Text: ${preview}...`;
    });

    const perplexity = clamp(CONFIG.perplexity, 5, Math.floor((rows.length - 1) / 3) || 5);

    const tsne = new TSNE({
      dim: dims,
      perplexity,
      earlyExaggeration: CONFIG.earlyExaggeration,
      learningRate: CONFIG.learningRate,
      nIter: CONFIG.iterations,
      metric: "euclidean",
    });

    tsne.init({
      data: vectors,
      type: "dense",
    });

    tsne.run();

    const reduced: number[][] = tsne.getOutputScaled();

    const x = reduced.map((p) => p[0]);
    const y = reduced.map((p) => p[1]);
    const z = dims === 3 ? reduced.map((p) => p[2]) : [];

    const html = `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>KB Embeddings (t-SNE ${dims}D)</title>
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <script src="${CONFIG.plotlyCdn}"></script>
    <style>
      body { margin: 0; font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial; }
      #plot { width: 100vw; height: 100vh; }
      .badge {
        position: fixed; top: 12px; left: 12px; z-index: 10;
        background: rgba(0,0,0,0.72); color: #fff; padding: 8px 10px;
        border-radius: 10px; font-size: 12px;
      }
      .badge code { color: #b3e5ff; }
    </style>
  </head>
  <body>
    <div class="badge">
      <div><b>KB Embeddings</b></div>
      <div>method: <code>t-SNE</code> | dims: <code>${dims}</code> | points: <code>${rows.length}</code></div>
      <div>docTypes: <code>professional</code> <code>personal</code> <code>education</code></div>
    </div>
    <div id="plot"></div>
    <script>
      const dims = ${dims};
      const x = ${JSON.stringify(x)};
      const y = ${JSON.stringify(y)};
      const z = ${JSON.stringify(z)};
      const colors = ${JSON.stringify(colors)};
      const text = ${JSON.stringify(hoverText)};

      const trace = dims === 2
        ? {
            type: "scattergl",
            mode: "markers",
            x, y,
            text,
            hoverinfo: "text",
            marker: { size: 5, color: colors, opacity: 0.8 }
          }
        : {
            type: "scatter3d",
            mode: "markers",
            x, y, z,
            text,
            hoverinfo: "text",
            marker: { size: 4, color: colors, opacity: 0.8 }
          };

      const layout = dims === 2
        ? {
            title: "t-SNE ${dims}D Embedding View",
            xaxis: { title: "x" },
            yaxis: { title: "y" },
            margin: { l: 50, r: 20, t: 60, b: 40 }
          }
        : {
            title: "t-SNE ${dims}D Embedding View",
            scene: { xaxis: { title: "x" }, yaxis: { title: "y" }, zaxis: { title: "z" } },
            margin: { l: 0, r: 0, t: 60, b: 0 }
          };

      Plotly.newPlot("plot", [trace], layout, { responsive: true, displayModeBar: true });
    </script>
  </body>
</html>`;

    const outPath = path.join(os.tmpdir(), `kb-embeddings-tsne-${dims}d-${Date.now()}.html`);
    await fs.writeFile(outPath, html, "utf8");

    console.log(`✅ Wrote: ${outPath}`);
    console.log("🚀 Opening in browser...");

    await open(outPath, { wait: false });
  } finally {
    await close();
  }
}

const arg = process.argv[2]?.toLowerCase();
const dims = arg === "2d" ? 2 : arg === "3d" ? 3 : 3;

main(dims).catch((err) => {
  console.error("kb:visualize failed ❌");
  console.error(err);
  process.exitCode = 1;
});
