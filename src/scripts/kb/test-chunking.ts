import fs from "node:fs/promises";

import path from "path";

import { chunkByTextStructure, chunkDocsByTextStructure } from "@/lib/ai/rag";

// import { normalizeMarkdown, normalizeText } from "@/lib/utils";
import { loadDocs } from "./load-docs";

async function main(fileName?: string) {
  if (fileName) {
    console.log(`=> Testing chunking strategy for file: ${fileName}\n`);

    const filePath = path.join(process.cwd(), "knowledge-base", fileName);
    const fileContent = await fs.readFile(filePath, "utf8");

    // 1. Chunk by periods.
    // const chunks = chunkByPeriods(text);

    // 2. Chunk by markdown H2 sections.
    // const chunks = chunkByMarkdownH2Sections(text).map(normalizeMarkdown);

    // 3. Chunk by paragraphs.
    // const chunks = chunkByParagraphs(text);

    // 4. RecursiveCharacterTextSplitter from LangChain.
    const chunks = await chunkByTextStructure(fileContent);

    console.log(`=> Got ${chunks.length} chunks:\n`);
    console.log(chunks);
  }

  // 4. RecursiveCharacterTextSplitter from LangChain.
  const documents = await loadDocs();
  const chunks = await chunkDocsByTextStructure(documents);

  console.log(`=> Chunked ${documents.length} documents into ${chunks.length} chunks:\n`);
  console.log(chunks);
}

main().catch((err) => {
  console.error("kb:test-chunk failed ❌");
  console.error(err);
  process.exitCode = 1;
});
