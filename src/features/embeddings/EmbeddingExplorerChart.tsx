import { EmbeddingPlot } from "@/features/embeddings";
import { reduceEmbeddings } from "@/lib/ai/rag";

export type Props = {
  dims: 2 | 3;
  limit: number;
};

export default async function EmbeddingExplorerChart({ dims, limit }: Props) {
  const data = await reduceEmbeddings(dims, limit);

  return <EmbeddingPlot data={data} />;
}
