import { UIDataTypes, UIMessage, UITools } from "ai";
import ReactMarkdown from "react-markdown";
import rehypeSanitize from "rehype-sanitize";
import remarkGfm from "remark-gfm";

import { hasRenderableText } from "@/features/chat/utils";

type Props = {
  messages: UIMessage<unknown, UIDataTypes, UITools>[];
};

export default function ChatMessages({ messages }: Props) {
  const lastMessage = messages.at(-1);
  const showTypingPlaceholder =
    lastMessage?.role === "assistant" && !hasRenderableText(lastMessage);

  return (
    <div className="flex flex-col gap-4 pb-2 sm:gap-6 sm:pb-3">
      {messages.map((message) => {
        const renderedParts = message.parts
          .map((part, i) => {
            switch (part.type) {
              case "text": {
                if (!part.text.trim()) return null;

                return (
                  <div
                    key={`${message.id}-${i}`}
                    className="prose prose-invert max-w-none text-sm sm:text-base"
                  >
                    <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeSanitize]}>
                      {part.text}
                    </ReactMarkdown>
                  </div>
                );
              }
              default:
                return null;
            }
          })
          .filter(Boolean);

        if (renderedParts.length === 0) return null;

        return (
          <div
            key={message.id}
            className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[92%] space-y-2 rounded-3xl px-4 py-3 text-sm leading-relaxed shadow-lg sm:max-w-[82%] sm:px-5 sm:py-4 sm:text-base md:max-w-[75%] lg:max-w-[70%] ${
                message.role === "user"
                  ? "bg-indigo-500 text-white shadow-indigo-500/15"
                  : "bg-white/10 text-zinc-100 shadow-black/15"
              }`}
            >
              {renderedParts}
            </div>
          </div>
        );
      })}

      {showTypingPlaceholder && (
        <div className="flex justify-start px-2 text-xs text-zinc-400 sm:text-sm">
          <span className="animate-pulse rounded-xl bg-white/10 px-2 py-1 shadow-black/15">
            ...
          </span>
        </div>
      )}
    </div>
  );
}
