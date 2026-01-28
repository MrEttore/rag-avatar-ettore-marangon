"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { useState } from "react";
import ReactMarkdown from "react-markdown";
import rehypeSanitize from "rehype-sanitize";
import remarkGfm from "remark-gfm";

import { ChatHeader } from "@/features/chat";
import PromptExamples from "@/features/chat/PromptExamples";

// TODO: Use chat status to render loading state.

export default function ChatPage() {
  const [input, setInput] = useState("");
  const { /*status,*/ messages, sendMessage } = useChat({
    transport: new DefaultChatTransport({
      api: "/api/chat",
    }),
  });

  const hasMessages = messages.length > 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    sendMessage({ text: input });
    setInput("");
  };

  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-linear-to-b from-zinc-950 via-zinc-950 to-zinc-900">
      <div className="mx-auto flex min-h-0 w-full max-w-4xl flex-1 flex-col px-3 pt-6 pb-4 sm:px-6 sm:pt-10 sm:pb-6 lg:px-8">
        <ChatHeader />

        <main className="relative min-h-0 flex-1 overflow-y-auto">
          {!hasMessages ? (
            <PromptExamples onClick={setInput} />
          ) : (
            <div className="flex flex-col gap-4 sm:gap-6">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[88%] rounded-3xl px-4 py-3 text-sm leading-relaxed shadow-lg sm:max-w-[75%] sm:px-5 sm:py-4 sm:text-base ${
                      message.role === "user"
                        ? "bg-indigo-500 text-white shadow-indigo-500/15"
                        : "bg-white/10 text-zinc-100 shadow-black/15"
                    }`}
                  >
                    {message.parts.map((part, i) => {
                      switch (part.type) {
                        case "text":
                          return (
                            <div
                              key={`${message.id}-${i}`}
                              className="prose prose-invert max-w-none text-sm sm:text-base"
                            >
                              <ReactMarkdown
                                remarkPlugins={[remarkGfm]}
                                rehypePlugins={[rehypeSanitize]}
                              >
                                {part.text}
                              </ReactMarkdown>
                            </div>
                          );
                        default:
                          return null;
                      }
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>

        <form className="mt-4 sm:mt-6" onSubmit={handleSubmit}>
          <div className="flex items-center gap-2 rounded-3xl border border-white/10 bg-white/5 p-2 shadow-xl shadow-black/30 sm:gap-3 sm:p-3">
            <input
              className="flex-1 bg-transparent px-2 py-2 text-sm text-white placeholder:text-zinc-500 focus:outline-none sm:py-3 sm:text-base"
              value={input}
              placeholder="Say something..."
              onChange={(e) => setInput(e.currentTarget.value)}
            />
            <button
              type="submit"
              className="rounded-2xl bg-indigo-500 px-4 py-2 text-sm font-semibold text-white transition hover:cursor-pointer hover:bg-indigo-400 sm:px-5 sm:py-3"
            >
              Send
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
