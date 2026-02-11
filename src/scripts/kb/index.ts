import fs from "fs/promises";
import path from "path";

import { chunkByMarkdownH2Sections, chunkByParagraphs } from "@/lib/ai/rag";
import { createScriptDb } from "@/lib/db/client";
import { initKnowledgeBase } from "@/lib/kb/indexer";

const DEFAULT_DIR = "knowledge";
const ALLOWED_EXTS = new Set([".txt", ".md"]);

async function walk(dir: string): Promise<string[]> {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const results: string[] = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...(await walk(fullPath)));
    } else if (entry.isFile()) {
      results.push(fullPath);
    }
  }

  return results;
}

function getChunker(ext: string): (content: string) => string[] {
  if (ext === ".md") return chunkByMarkdownH2Sections;
  return chunkByParagraphs;
}

async function main() {
  const { db, close } = createScriptDb();

  const absDir = path.join(process.cwd(), DEFAULT_DIR);

  console.log(`=> Indexing knowledge from: ${absDir}`);

  const files = (await walk(absDir))
    .filter((f) => ALLOWED_EXTS.has(path.extname(f).toLowerCase()))
    .sort();

  if (files.length === 0) {
    console.log("=> No .txt/.md files found. Nothing to index.");
    return;
  }

  let totalChunks = 0;

  try {
    for (const filePath of files) {
      const rel = path.relative(process.cwd(), filePath);
      const source = `file:${rel}`;
      const ext = path.extname(filePath).toLowerCase();

      const content = await fs.readFile(filePath, "utf8");

      const { resourceId, chunks } = await initKnowledgeBase(
        { source, content, chunker: getChunker(ext) },
        db,
      );
      totalChunks += chunks;

      console.log(`- Initialized ${source} (resource=${resourceId}, chunks=${chunks})`);
    }

    console.log(`=> Done. Files=${files.length} chunks=${totalChunks}`);
  } finally {
    await close();
  }
}

main().catch((err) => {
  console.error("Indexing failed ❌");
  console.error(err);
  process.exitCode = 1;
});
