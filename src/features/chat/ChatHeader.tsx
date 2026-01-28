export default function ChatHeader() {
  return (
    <header className="mb-6 flex flex-col gap-2 sm:mb-8">
      <p className="text-[0.65rem] font-semibold tracking-[0.3em] text-indigo-300 uppercase sm:text-xs">
        Chat Studio
      </p>
      <h1 className="text-2xl font-semibold text-white sm:text-3xl lg:text-4xl">Talk to me</h1>
    </header>
  );
}
