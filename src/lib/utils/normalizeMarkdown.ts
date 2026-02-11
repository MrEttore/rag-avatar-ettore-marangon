export const normalizeMarkdown = (markdownChunk: string): string => {
  return markdownChunk
    .replace(/\r\n/g, "\n")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
};
