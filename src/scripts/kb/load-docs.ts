import fs from "node:fs/promises";
import path from "node:path";

import { DirectoryLoader } from "@langchain/classic/document_loaders/fs/directory";
import { TextLoader } from "@langchain/classic/document_loaders/fs/text";
import type { Document } from "@langchain/core/documents";

const KB_DIR = "knowledge-base";

export async function loadDocs() {
  const kbAbsPath = path.join(process.cwd(), KB_DIR);

  const entries = await fs.readdir(kbAbsPath, { withFileTypes: true });
  const folders = entries.filter((entry) => entry.isDirectory()).map((entry) => entry.name);

  const documents: Document[] = [];

  for (const folder of folders) {
    const folderPath = path.join(kbAbsPath, folder);
    const docType = folder;

    const loader = new DirectoryLoader(
      folderPath,
      {
        ".md": (path) => new TextLoader(path),
      },
      true,
    );

    const folderDocs = await loader.load();

    for (const doc of folderDocs) {
      const relativeSource = path
        .relative(process.cwd(), doc.metadata.source)
        .replaceAll(path.sep, "/");
      doc.metadata = { ...doc.metadata, source: relativeSource, docType };
      documents.push(doc);
    }
  }

  return documents;
}

async function main() {
  await loadDocs();
}

main().catch((err) => {
  console.error("Loading Docs failed ❌");
  console.error(err);
  process.exitCode = 1;
});
