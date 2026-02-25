import { ChevronRightIcon } from "@heroicons/react/24/solid";
import Link from "next/link";

import { EXPLORER_CONFIG } from "@/config/embeddings";

export default function ChatHeader() {
  const dims = EXPLORER_CONFIG.dims.default;
  const limit = EXPLORER_CONFIG.limit.default;

  return (
    <header className="mb-3 sm:mb-5">
      <div className="flex items-start justify-between gap-3 sm:items-end sm:gap-4">
        <div className="min-w-0 flex-1 space-y-2">
          <p className="text-[0.65rem] font-semibold tracking-[0.3em] text-indigo-300 uppercase sm:text-xs">
            Ettore Marangon&apos;s RAG Avatar
          </p>
          <h1 className="text-2xl font-semibold text-white sm:text-3xl md:text-4xl">Talk to me</h1>
        </div>

        <Link
          href={`/embedding-explorer?dims=${dims}&limit=${limit}`}
          className="inline-flex shrink-0 items-center justify-center gap-0.5 self-end rounded-md bg-indigo-500/40 px-2.5 py-1.5 text-xs font-medium whitespace-nowrap text-zinc-200 transition-colors duration-300 hover:bg-indigo-500/60 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-zinc-950 focus:outline-none sm:gap-1 sm:px-3 sm:py-2 sm:text-sm"
        >
          Visualize embeddings
          <ChevronRightIcon className="size-4 text-zinc-200 sm:size-5" />
        </Link>
      </div>
    </header>
  );
}
