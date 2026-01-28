import { useMemo } from "react";

import { PROMPT_EXAMPLES } from "@/config/chat";

type Props = {
  onClick: (example: string) => void;
};

export default function PromptExamples({ onClick }: Props) {
  const placeholderExamples = useMemo(() => PROMPT_EXAMPLES, []);

  return (
    <div className="mx-1 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {placeholderExamples.map((example) => (
        <button
          key={example}
          type="button"
          onClick={() => onClick(example)}
          className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-left text-sm text-zinc-200 transition hover:z-10 hover:scale-101 hover:cursor-pointer hover:border-indigo-400/40 hover:bg-indigo-500/10 sm:text-base"
        >
          {example}
        </button>
      ))}
    </div>
  );
}
