import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center bg-linear-to-b from-zinc-950 via-zinc-950 to-zinc-900 px-6 text-center text-zinc-100">
      <p className="text-sm font-medium tracking-wide text-zinc-400">404</p>
      <h1 className="mt-2 text-3xl font-semibold sm:text-4xl">Page not found</h1>
      <p className="mt-3 max-w-md text-sm text-zinc-300 sm:text-base">
        The page you’re looking for doesn’t exist.
      </p>

      <Link
        href="/"
        className="mt-8 inline-flex items-center rounded-md bg-zinc-100 px-4 py-2 text-sm font-medium text-zinc-950 transition hover:bg-zinc-200 focus-visible:ring-2 focus-visible:ring-zinc-300 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950 focus-visible:outline-none"
      >
        Go back home
      </Link>
    </main>
  );
}
