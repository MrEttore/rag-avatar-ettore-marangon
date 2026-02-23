"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { EXPLORER_CONFIG } from "@/config/embeddings";

type Props = {
  dims: 2 | 3;
  limit: 250 | 500 | 750 | 1000;
};

export default function EmbeddingExplorerHeader({ dims, limit }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const updateParams = (nextDims: 2 | 3, nextLimit: 250 | 500 | 750 | 1000) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("dims", String(nextDims));
    params.set("limit", String(nextLimit));
    router.replace(`${pathname}?${params.toString()}`);
  };

  return (
    <header className="mb-4 space-y-2 rounded-xl border border-zinc-800/70 bg-zinc-900/60 p-2 backdrop-blur-sm sm:mb-6 sm:p-3">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
        <div className="space-y-2.5">
          <h1 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl md:text-4xl">
            Embedding Explorer
          </h1>
          <p className="max-w-2xl text-sm leading-relaxed text-zinc-400">
            This page visualises the agent&apos;s knowledge base embeddings using UMAP reduction.
            Each point is a document chunk, coloured by category. Hover a point to preview its
            content.
          </p>
        </div>
      </div>
      <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center sm:gap-4">
        <p className="inline-flex w-fit rounded-md border border-zinc-700/70 bg-zinc-800/50 px-2 py-1 text-xs text-zinc-300">
          UMAP • seed 42
        </p>
        <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto sm:gap-3">
          <label className="flex items-center gap-2 text-xs text-zinc-300">
            <span className="whitespace-nowrap">DIMS</span>
            <select
              value={dims}
              onChange={(e) =>
                updateParams(
                  EXPLORER_CONFIG.dims.options.find(
                    (option) => option === Number(e.target.value),
                  ) ?? 2,
                  limit,
                )
              }
              className="rounded-md border border-zinc-700/70 bg-zinc-800/70 px-2 py-1 text-xs text-zinc-100 transition-colors outline-none hover:border-zinc-600 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/40"
            >
              <option value={2}>2D</option>
              <option value={3}>3D</option>
            </select>
          </label>

          <label className="flex items-center gap-2 text-xs text-zinc-300">
            <span className="whitespace-nowrap">LIMIT</span>
            <select
              value={limit}
              onChange={(e) =>
                updateParams(
                  dims,
                  EXPLORER_CONFIG.limit.options.find(
                    (option) => option === Number(e.target.value),
                  ) ?? 1000,
                )
              }
              className="rounded-md border border-zinc-700/70 bg-zinc-800/70 px-2 py-1 text-xs text-zinc-100 transition-colors outline-none hover:border-zinc-600 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/40"
            >
              {EXPLORER_CONFIG.limit.options.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>
    </header>
  );
}
