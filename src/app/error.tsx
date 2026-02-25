"use client";

import Link from "next/link";
import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="flex min-h-dvh flex-col items-center justify-center bg-linear-to-b from-zinc-950 via-zinc-950 to-zinc-900 px-6 text-center text-zinc-100">
      <p className="text-sm font-medium tracking-wide text-zinc-400">Something went wrong</p>
      <h1 className="mt-2 text-3xl font-semibold sm:text-4xl">Unexpected application error</h1>
      <p className="mt-3 max-w-md text-sm text-zinc-300 sm:text-base">
        An unexpected error occurred while loading this page.
      </p>

      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <button
          type="button"
          onClick={reset}
          className="inline-flex cursor-pointer items-center rounded-md bg-zinc-100 px-4 py-2 text-sm font-medium text-zinc-950 transition hover:bg-zinc-200 focus-visible:ring-2 focus-visible:ring-zinc-300 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950 focus-visible:outline-none"
        >
          Try again
        </button>

        <Link
          href="/"
          className="inline-flex items-center rounded-md border border-zinc-700 px-4 py-2 text-sm font-medium text-zinc-100 transition hover:bg-zinc-800 focus-visible:ring-2 focus-visible:ring-zinc-300 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950 focus-visible:outline-none"
        >
          Go back home
        </Link>
      </div>
    </main>
  );
}
