import Link from "next/link";

export default function EmbeddingExplorerFooter() {
  return (
    <footer className="mt-4 flex shrink-0 items-center justify-end sm:mt-6">
      <Link
        href="/"
        className="inline-flex shrink-0 items-center justify-center rounded-md bg-indigo-500 px-3.5 py-2 text-sm font-medium whitespace-nowrap text-white transition-colors duration-300 hover:bg-indigo-400 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-zinc-950 focus:outline-none"
      >
        Back to chat
      </Link>
    </footer>
  );
}
