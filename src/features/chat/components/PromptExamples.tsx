import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/solid";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { PROMPT_EXAMPLES } from "@/config/chat";

type Props = {
  onClick: (example: string) => void;
};

const SCROLL_TOLERANCE = 4;

export default function PromptExamples({ onClick }: Props) {
  const placeholderExamples = useMemo(() => PROMPT_EXAMPLES, []);
  const carouselRef = useRef<HTMLDivElement>(null);
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);

  const updateScrollState = useCallback(() => {
    const carousel = carouselRef.current;
    if (!carousel) return;

    const maxScrollLeft = carousel.scrollWidth - carousel.clientWidth;

    setCanScrollPrev(carousel.scrollLeft > SCROLL_TOLERANCE);
    setCanScrollNext(carousel.scrollLeft < maxScrollLeft - SCROLL_TOLERANCE);
  }, []);

  const scrollByCard = useCallback((direction: -1 | 1) => {
    const carousel = carouselRef.current;
    if (!carousel) return;

    const firstCard = carousel.querySelector<HTMLElement>("[data-prompt-card='true']");
    if (!firstCard) return;

    const gap = Number.parseFloat(window.getComputedStyle(carousel).gap || "0") || 0;

    carousel.scrollBy({
      left: direction * (firstCard.offsetWidth + gap),
      behavior: "smooth",
    });
  }, []);

  useEffect(() => {
    const carousel = carouselRef.current;
    if (!carousel) return;

    updateScrollState();

    const handleScroll = () => updateScrollState();

    carousel.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", updateScrollState);

    return () => {
      carousel.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", updateScrollState);
    };
  }, [updateScrollState, placeholderExamples.length]);

  return (
    <div className="relative mx-1 my-2 sm:my-3">
      <p className="mb-2 px-12 text-center text-xs text-zinc-400 sm:mb-3 sm:text-sm">
        Pick a starter prompt to prefill the chat, then send it or edit it first.
      </p>

      <button
        type="button"
        aria-label="Show previous prompt"
        onClick={() => scrollByCard(-1)}
        disabled={!canScrollPrev}
        className="absolute top-[60%] left-0 z-10 -translate-y-1/2 rounded-full border border-white/10 bg-zinc-900/90 p-2 text-zinc-100 backdrop-blur-sm transition enabled:hover:cursor-pointer enabled:hover:border-indigo-400/40 enabled:hover:bg-indigo-500/20 disabled:cursor-not-allowed disabled:opacity-30"
      >
        <ChevronLeftIcon className="size-4 sm:size-5" />
      </button>

      <div
        ref={carouselRef}
        className="mx-12 flex snap-x snap-mandatory gap-3 overflow-x-auto scroll-smooth px-1 py-2 sm:gap-4 [&::-webkit-scrollbar]:hidden"
      >
        {placeholderExamples.map((example) => (
          <button
            key={example}
            type="button"
            data-prompt-card="true"
            onClick={() => onClick(example)}
            className="min-h-24 w-full shrink-0 snap-start rounded-2xl border border-white/10 bg-white/5 px-2 py-1 text-left text-sm leading-relaxed text-zinc-200 transition hover:z-10 hover:cursor-pointer hover:border-indigo-400/40 hover:bg-indigo-500/10 sm:px-3 sm:py-2 sm:text-base md:basis-[calc(50%-0.5rem)] lg:basis-[calc(33.333%-0.666rem)]"
          >
            {example}
          </button>
        ))}
      </div>

      <button
        type="button"
        aria-label="Show next prompt"
        onClick={() => scrollByCard(1)}
        disabled={!canScrollNext}
        className="absolute top-[60%] right-0 z-10 -translate-y-1/2 rounded-full border border-white/10 bg-zinc-900/90 p-2 text-zinc-100 backdrop-blur-sm transition enabled:hover:cursor-pointer enabled:hover:border-indigo-400/40 enabled:hover:bg-indigo-500/20 disabled:cursor-not-allowed disabled:opacity-30"
      >
        <ChevronRightIcon className="size-4 sm:size-5" />
      </button>
    </div>
  );
}
