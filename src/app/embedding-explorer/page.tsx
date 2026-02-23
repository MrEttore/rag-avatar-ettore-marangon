import type { Metadata } from "next";
import { Suspense } from "react";

import { EXPLORER_CONFIG } from "@/config/embeddings";
import {
  EmbeddingExplorerChart,
  EmbeddingExplorerFooter,
  EmbeddingExplorerHeader,
} from "@/features/embeddings";

export const metadata: Metadata = {
  title: "Embedding Explorer",
  description: "Visualise UMAP reduced knowledge base embeddings in 2D or 3D.",
};

type Props = {
  searchParams: Promise<{
    dims: string;
    limit: string;
  }>;
};

export default async function EmbeddingExplorerPage({ searchParams }: Props) {
  const params = await searchParams;

  const dims = EXPLORER_CONFIG.dims.options.find((option) => option === Number(params?.dims)) ?? 2;
  const limit =
    EXPLORER_CONFIG.limit.options.find((option) => option === Number(params?.limit)) ?? 1000;

  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-linear-to-b from-zinc-950 via-zinc-950 to-zinc-900">
      <div className="mx-auto flex min-h-0 w-full max-w-4xl flex-1 flex-col px-4 pt-4 pb-3 sm:px-6 sm:pt-8 sm:pb-5 lg:px-8 lg:pt-10 lg:pb-6">
        <EmbeddingExplorerHeader dims={dims} limit={limit} />

        <main className="aspect-square min-h-0 w-full flex-1 overflow-hidden rounded-xl">
          <Suspense
            fallback={
              <div className="flex h-full animate-pulse items-center justify-center text-indigo-400 italic">
                Loading…
              </div>
            }
          >
            <EmbeddingExplorerChart dims={dims} limit={limit} />
          </Suspense>
        </main>

        <EmbeddingExplorerFooter />
      </div>
    </div>
  );
}
