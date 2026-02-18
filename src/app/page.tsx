"use client";

import { useChat } from "@ai-sdk/react";
import { LightBulbIcon, WrenchIcon } from "@heroicons/react/24/solid";
import { DefaultChatTransport } from "ai";
import { useState } from "react";
import ReactMarkdown from "react-markdown";
import rehypeSanitize from "rehype-sanitize";
import remarkGfm from "remark-gfm";

import { ChatHeader } from "@/features/chat";
import ChatInput from "@/features/chat/ChatInput";
import PromptExamples from "@/features/chat/PromptExamples";

export default function ChatPage() {
  const [input, setInput] = useState("");
  const [currentToolCall, setCurrentToolCall] = useState<string | null>(null);

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

        {/* TODO: Build component rendering agent actions (e.g., thinking, calling tools, etc...) */}
        <main className="relative min-h-0 flex-1 overflow-y-auto">
          {/* AGENT STATUS */}
          <div className="sticky top-0 z-20 flex h-8 items-center gap-2 bg-zinc-950 px-2 text-amber-50">
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
                <span className="animate-pulse text-sm font-extralight italic">Thinking...</span>
              </p>
            )}
          </div>

          <div
            aria-hidden="true"
            className="pointer-events-none sticky top-8 z-10 h-8 bg-linear-to-b from-zinc-950 via-zinc-950/70 to-transparent"
          />
          {/* TODO: Build carousel component for prompt examples. */}
          {!hasMessages && <PromptExamples onClick={setInput} />}

          {hasMessages && (
            <div className="flex flex-col gap-4 sm:gap-6">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[88%] space-y-2 rounded-3xl px-4 py-3 text-sm leading-relaxed shadow-lg sm:max-w-[75%] sm:px-5 sm:py-4 sm:text-base ${
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
