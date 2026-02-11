import fs from "node:fs/promises";

import path from "path";

import { chunkByMarkdownH2Sections, chunkByParagraphs, chunkByPeriods } from "@/lib/ai/rag";
import { normalizeMarkdown, normalizeText } from "@/lib/utils";

async function main(fileName: string) {
  console.log(`=> Testing chunking strategy for file: ${fileName}\n`);

  const filePath = path.join(process.cwd(), "knowledge", fileName);
  const fileContent = await fs.readFile(filePath, "utf8");
  const text = normalizeText(fileContent);

  // console.log(fileContent);

  // 1. Chunk by periods.
  // const chunks = chunkByPeriods(text);

  // 2. Chunk by markdown H2 sections.
  // const chunks = chunkByMarkdownH2Sections(text).map(normalizeMarkdown);

  // 3. Chunk by paragraphs.
  const chunks = chunkByParagraphs(text);

  console.log(`=> Got ${chunks.length} chunks:\n`);
  console.log(chunks);
}

main("personal.txt").catch((err) => {
  console.error("kb:test-chunk failed ❌");
  console.error(err);
  process.exitCode = 1;
});
