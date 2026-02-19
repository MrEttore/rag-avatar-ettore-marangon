"use client";

import { useChat } from "@ai-sdk/react";
import { LightBulbIcon, WrenchIcon } from "@heroicons/react/24/solid";
import { DefaultChatTransport } from "ai";
import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import rehypeSanitize from "rehype-sanitize";
import remarkGfm from "remark-gfm";

import { ChatHeader } from "@/features/chat";
import ChatInput from "@/features/chat/ChatInput";
import PromptExamples from "@/features/chat/PromptExamples";

export default function ChatPage() {
  const [input, setInput] = useState("");
  const [currentToolCall, setCurrentToolCall] = useState<string | null>(null);
  const chatScrollRef = useRef<HTMLElement | null>(null);

  const { status, messages, sendMessage } = useChat({
    transport: new DefaultChatTransport({
      api: "/api/chat",
    }),
    onToolCall({ toolCall }) {
      setCurrentToolCall(toolCall.toolName);
    },
    onFinish() {
      setCurrentToolCall(null);
    },
  });

  console.log(messages);

  const hasMessages = messages.length > 0;
  const isThinking = status === "submitted" || status === "streaming";
  const isCallingTool = currentToolCall !== null;

  useEffect(() => {
    if (!hasMessages) return;

    const frame = requestAnimationFrame(() => {
      const container = chatScrollRef.current;
      if (!container) return;

      container.scrollTo({
        top: container.scrollHeight,
        behavior: status === "streaming" ? "auto" : "smooth",
      });
    });

    return () => cancelAnimationFrame(frame);
  }, [messages, status, hasMessages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    sendMessage({ text: input });
    setInput("");
  };

  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-linear-to-b from-zinc-950 via-zinc-950 to-zinc-900">
      <div className="mx-auto flex min-h-0 w-full max-w-4xl flex-1 flex-col px-4 pt-4 pb-3 sm:px-6 sm:pt-8 sm:pb-5 lg:px-8 lg:pt-10 lg:pb-6">
        <ChatHeader />

        {/* TODO: Build component rendering agent actions (e.g., thinking, calling tools, etc...) */}
        <main ref={chatScrollRef} className="relative min-h-0 flex-1 overflow-y-auto pr-1">
          {hasMessages && (
            <>
              {/* AGENT STATUS */}
              <div className="sticky top-0 z-20 flex min-h-9 items-center gap-2 bg-zinc-950/95 px-2 py-1 text-amber-50 backdrop-blur-sm">
                {isCallingTool && (
                  <p className="flex items-center gap-1">
                    <WrenchIcon className="size-4 text-amber-100/50" />
                    <span className="animate-pulse text-sm font-extralight italic">
                      Using tool: {currentToolCall}
                    </span>
                  </p>
                )}
                {isThinking && !isCallingTool && (
                  <p className="flex items-center gap-1">
                    <LightBulbIcon className="size-4 text-amber-100/50" />
                    <span className="animate-pulse text-sm font-extralight italic">
                      Thinking...
                    </span>
                  </p>
                )}
              </div>

              <div
                aria-hidden="true"
                className="pointer-events-none sticky top-9 z-10 h-8 bg-linear-to-b from-zinc-950 via-zinc-950/70 to-transparent"
              />
            </>
          )}

          {!hasMessages && <PromptExamples onClick={setInput} />}

          {hasMessages && (
            <div className="flex flex-col gap-4 pb-2 sm:gap-6 sm:pb-3">
              {messages.map((message) => (
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

        <ChatInput input={input} onInput={setInput} onSubmit={handleSubmit} />
      </div>
    </div>
  );
}
