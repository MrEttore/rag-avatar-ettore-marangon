type Props = {
  input: string;
  onInput: (value: string) => void;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
};

export default function ChatInput({ input, onInput, onSubmit }: Props) {
  return (
    <form className="mt-2 sm:mt-4" onSubmit={onSubmit}>
      <div className="flex items-center gap-2 rounded-3xl border border-white/10 bg-white/5 p-2 shadow-xl shadow-black/30 sm:gap-3 sm:p-3">
        <input
          className="flex-1 bg-transparent px-2 py-2 text-sm text-white placeholder:text-zinc-500 focus:outline-none sm:py-3 sm:text-base"
          value={input}
          placeholder="Say something..."
          onChange={(e) => onInput(e.currentTarget.value)}
        />
        <button
          type="submit"
          className="rounded-2xl bg-indigo-500 px-4 py-2 text-sm font-semibold text-white transition hover:cursor-pointer hover:bg-indigo-400 sm:px-5 sm:py-3"
        >
          Send
        </button>
      </div>
    </form>
  );
}
