import type { Document } from "@langchain/core/documents";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";

// Chunking strategy 1.
export const chunkByPeriods = (input: string): string[] => {
  return input
    .trim()
    .split(".")
    .filter((i) => i !== "");
};

// Chunking strategy 2.
export const chunkByMarkdownH2Sections = (input: string): string[] => {
  const text = input.replace(/\r\n/g, "\n").trim();

  // Split at lines that start with "## " (H2), but keep the delimiter by using a capturing group.
  const parts = text.split(/^(\s*## .*)$/gm);

  const chunks: string[] = [];
  for (let i = 0; i < parts.length; i++) {
    const part = parts[i];
    if (!part) continue;

    // If this part is an H2 header, stitch it with the following body (if any).
    if (/^\s*## /.test(part)) {
      const body = parts[i + 1] ?? "";
      const chunk = `${part}\n${body}`.trim();
      if (chunk) chunks.push(chunk);
      i++; // skip body because we consumed it
    } else if (i === 0) {
      // Optional: content before the first H2 (preamble). Keep it if meaningful.
      const chunk = part.trim();
      if (chunk) chunks.push(chunk);
    }
  }

  return chunks;
};

// Chunking  strategy 3.
export const chunkByParagraphs = (input: string): string[] => {
  return input
    .trim()
    .split(/\n{2,}/)
    .filter((i) => i !== "");
};

// Chunking strategy 4.
// TODO: Experiment with different chunk sizes and overlaps.
const splitter = new RecursiveCharacterTextSplitter({ chunkSize: 800, chunkOverlap: 150 });

export const chunkByTextStructure = (input: string): Promise<string[]> => {
  const chunks = splitter.splitText(input);

  return chunks;
};

export const chunkDocsByTextStructure = (docs: Document[]): Promise<Document[]> => {
  const chunks = splitter.splitDocuments(docs);

  return chunks;
};
