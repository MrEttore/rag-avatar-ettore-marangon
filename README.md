<p align="center">
	<img src="public/icon.svg" alt="Logo" width="140" draggable="false"/>
</p>

# RAG Avatar Agent <!-- omit in toc -->

> A personal AI avatar powered by Retrieval-Augmented Generation (RAG), grounded in a private knowledge base.

![TypeScript](https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white)
![Next JS](https://img.shields.io/badge/Next-black?style=for-the-badge&logo=next.js&logoColor=white)
![Vercel](https://img.shields.io/badge/vercel-%23000000.svg?style=for-the-badge&logo=vercel&logoColor=white)
![ChatGPT](https://img.shields.io/badge/openai-74aa9c?style=for-the-badge&logo=openai&logoColor=white)
![LangChain](https://img.shields.io/badge/langchain-%231C3C3C.svg?style=for-the-badge&logo=langchain&logoColor=white)
![Drizzle](https://img.shields.io/badge/Drizzle-%23000000?style=for-the-badge&logo=drizzle&logoColor=C5F74F)
![Postgres](https://img.shields.io/badge/postgres-%23316192.svg?style=for-the-badge&logo=postgresql&logoColor=white)

> **📣 Handcrafted Code**: This project was built the old-fashioned way, with deliberate architecture, debugging, and iteration. No vibe-coding shortcuts.

## Table of Contents <!-- omit in toc -->

- [🔍 Overview](#-overview)
- [💡 Why This Project?](#-why-this-project)
- [✨ Key Features](#-key-features)
- [🏗️ Tech Stack \& Architecture](#️-tech-stack--architecture)
- [📁 Project Structure](#-project-structure)
- [🙏 Acknowledgements](#-acknowledgements)

## 🔍 Overview

**What It Is:** This project is a personal **RAG avatar agent** that answers questions as me, in first person, using a private, curated knowledge base (KB). It combines a chat UI, a tool-enabled agent, vector retrieval over pgvector embeddings, and markdown-safe rendering for grounded answers.

**Why It Matters:** Generic LLM responses can sound plausible but drift from factual personal details. This project solves that by grounding responses in owned source documents, then exposing retrieval behavior through an embedding explorer so quality can be inspected visually, not just assumed.

This project demonstrates:

- **Grounded Persona QA:** Agent replies are constrained by retrieved KB excerpts and explicit system rules (identity, tone, privacy, no fabrication).
- **Production-Oriented RAG Pipeline:** End-to-end ingestion flow from docs → chunking → OpenAI embeddings → pgvector indexing → similarity retrieval.
- **Observability for Retrieval Quality:** A dedicated embedding explorer (2D/3D UMAP) to inspect semantic clusters by KB category.

> Note: the KB folder is intentionally gitignored and not public in this repository. The data is private by design.

## 💡 Why This Project?

I wanted an AI website assistant that can speak with my voice and context, but without hallucinating about my background. Instead of hardcoding profile text into prompts, I built a proper retrieval layer over a structured personal KB, then wired it into a tool-calling chat agent.

The second goal was educational: build a clean, modern RAG stack end-to-end using Next.js, Vercel's AI SDK, Drizzle, pgvector, and LangChain, while keeping architecture simple enough to evolve quickly.

Furthermore, I treat this project as an ongoing lab: I keep updating the private KB over time (new experiences, projects, and context added bit by bit) and continuously refine the RAG pipeline as the dataset grows.

**What I Learned:**

- **Prompt + Tool Contract Design:** Reliability improves when the system prompt enforces clear tool usage boundaries (when to retrieve, what is authoritative, what must never be invented).
- **Chunking Trade-offs:** Recursive chunking (`chunkSize: 800`, `chunkOverlap: 150`) gives a practical balance between recall and contextual coherence for personal docs, while alternative strategies are tested continuously.
- **Vector Search Tuning:** Similarity thresholds, top-k limits, and deterministic UMAP projection are critical for predictable retrieval and analysis.
- **RAG DX Workflows:** Custom scripts (`kb:ingest`, `kb:reset`, `kb:test-chunking`, `kb:visualize`) dramatically speed up iteration on data quality.
- **UI for Trust:** Showing tool-call status and rendering markdown safely improves user trust and usability in agent responses.

## ✨ Key Features

- **Persona-Driven Agent:** `AvatarAgent` answers in first person as the configured persona (`PERSONA_NAME`) and applies explicit guardrails for privacy and factual grounding.
- **Tool-Based Retrieval:** `getInformation` tool fetches relevant chunks via vector similarity search and is invoked during personal factual queries.
- **Streaming Chat Experience:** Real-time responses through the AI SDK transport with visible “thinking” / “using tool” state in the UI.
- **Knowledge Base Ingestion Pipeline:** Private docs are loaded, chunked, embedded, and stored in PostgreSQL + pgvector.
- **Embedding Explorer:** Separate page to visualize embeddings in 2D/3D with category color-coding and hover previews.
- **Chunking Strategy Playground:** The project includes active experimentation with chunking approaches. Promising strategies are iterated on and integrated over time.
- **Developer Utilities:** Scripts for migrations, DB checks, KB reset/ingestion, chunking inspection, and standalone visualization experiments.

## 🏗️ Tech Stack & Architecture

This project combines a Next.js app, a tool-enabled LLM agent, and a vector-backed retrieval layer.

### Frontend <!-- omit in toc -->

- **Next.js:** Chat interface and embedding explorer pages.
- **Tailwind CSS v4:** Minimal, dark-themed UI styling and layout.
- **React Markdown:** Safe markdown rendering for model output.
- **Plotly:** Interactive 2D/3D embedding visualization in-browser.

### Backend / AI Layer <!-- omit in toc -->

- **Vercel AI SDK:** Streaming chat orchestration and tool-calling flow.
- **OpenAI Provider:**
  - Chat model: `gpt-5-mini`
  - Embeddings model: `text-embedding-3-small`
- **Agent Design:** `AvatarAgent` enforces identity, grounding, privacy constraints, and step-limited tool execution.

### Data Layer <!-- omit in toc -->

- **PostgreSQL + pgvector:** Stores chunk embeddings (`vector(1536)`) with HNSW cosine index.
- **Drizzle ORM:** Schema, migrations, and typed DB access.
- **LangChain Text Splitters:** Recursive document chunking for ingestion.

### Why UMAP in the Explorer (vs t-SNE) <!-- omit in toc -->

- **Better fit for iterative workflows:** UMAP is generally faster and more scalable as embedding sets grow, which is useful for repeated exploration during ongoing KB updates.
- **More stable neighborhood structure:** In practice, UMAP tends to preserve local relationships while keeping a more interpretable global layout for category-level inspection.
- **Production-friendly interactivity:** Faster reduction and deterministic seeding (seed 42 in this project) make the explorer more consistent and responsive.
- **t-SNE is still useful for experiments:** I still keep t-SNE tooling in scripts for comparison and sanity checks, but UMAP is the default for the in-app embeddings explorer.

### Architecture Overview <!-- omit from toc -->

```text
┌───────────────────────────────────────────────────────────────┐
│                  NEXT.JS APP (UI + API ROUTES)                │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │ Chat UI                                                 │  │
│  │ • Prompt examples                                       │  │
│  │ • Streaming messages                                    │  │
│  │ • Tool call status indicator                            │  │
│  └─────────────────────────────────────────────────────────┘  │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │ Embedding Explorer                                      │  │
│  │ • 2D/3D UMAP reduction                                  │  │
│  │ • Plotly interactive scatter                            │  │
│  └─────────────────────────────────────────────────────────┘  │
└───────────────────────────────────────────────────────────────┘
						    │
							│ /api/chat + /api/embeddings
							▼
┌───────────────────────────────────────────────────────────────┐
│                      AVATAR AGENT LAYER                       │
│ ┌─────────────────────────────────────────────────────────┐   │
│ │ • system prompt with strict persona + privacy rules     │   │
│ │ • tool calling (`getInformation`)                       │   │
│ │ • streaming generation (`gpt-5-mini`)                   │   │
│ └─────────────────────────────────────────────────────────┘   │
└───────────────────────────────────────────────────────────────┘
							 │
							 │ semantic retrieval
							 ▼
┌───────────────────────────────────────────────────────────────┐
│                 RAG + VECTOR STORE (POSTGRES)                 │
│ ┌─────────────────────────────────────────────────────────┐   │
│ │ • docs loader (knowledge-base/**/*.md)                  │   │
│ │ • chunking (LangChain recursive splitter)               │   │
│ │ • embeddings (text-embedding-3-small)                   │   │
│ │ • pgvector similarity search (cosine + HNSW index).     │   │
│ └─────────────────────────────────────────────────────────┘   │
└───────────────────────────────────────────────────────────────┘
```

**Key Architectural Decisions:**

- **Tool as Retrieval Boundary:** The model cannot claim persona facts without consulting retrieval for relevant personal/professional questions.
- **Database-Backed RAG:** Embeddings live in PostgreSQL (not in-memory), making ingestion repeatable and queries production-friendly.
- **Separation of Concerns:** Ingestion scripts are isolated from request-time chat APIs, so indexing and serving can evolve independently.
- **Retrieval Introspection:** Explorer endpoint (`/api/embeddings`) makes embedding-space quality visible for faster tuning.

**Data Flow:**

1. Private documents are loaded from a local, gitignored `knowledge-base/` folder.
2. Documents are chunked and embedded.
3. Chunks + vectors are stored in the `resources` and `embeddings` tables.
4. User sends a chat message to `/api/chat`.
5. `AvatarAgent` streams a response and calls `getInformation` when needed.
6. Tool performs vector similarity search and returns relevant excerpts.
7. Final grounded response is streamed back to the UI.

## 📁 Project Structure

```text
.
├── knowledge-base/                  # Local private KB (gitignored)
│   ├── education/
│   ├── personal/
│   ├── professional/
│   ├── projects/
│   └── ...
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── chat/route.ts        # Chat endpoint (agent response)
│   │   │   └── embeddings/route.ts  # Reduced embedding data endpoint
│   │   ├── embedding-explorer/      # Embedding explorer page
│   │   ├── layout.tsx
│   │   └── page.tsx                 # Main chat page
│   ├── config/                      # Env and UI config
│   ├── features/
│   │   ├── chat/                    # Chat UI components
│   │   └── embeddings/              # Explorer UI + plot components
│   ├── lib/
│   │   ├── ai/
│   │   │   ├── agents/AvatarAgent.ts
│   │   │   ├── rag/                 # Chunking, embeddings, reduction
│   │   │   └── tools/getInformation.ts
│   │   ├── db/
│   │   │   ├── schema/              # Drizzle schemas
│   │   │   ├── migrations/
│   │   │   └── client.ts
│   │   └── utils/
│   ├── scripts/kb/                  # Ingestion, reset, test, visualize scripts
│   └── types/
├── drizzle.config.ts
├── package.json
└── README.md
```

## 🙏 Acknowledgements

- **OpenAI:** For robust chat and embedding APIs used in the agent + retrieval pipeline.
- **Vercel AI SDK:** For excellent abstractions around streaming and tool-enabled chat.
- **Drizzle + pgvector ecosystem:** For making typed SQL + vector search clean in TypeScript.
- **LangChain:** For practical document loading and chunking primitives.
- **[Ed Donner](https://github.com/ed-donner):** For high-quality GenAI engineering learning resources that inspired parts of the implementation approach.

---

<p align="center">
	Made with ❤️ by <a href="https://github.com/MrEttore">Ettore Marangon</a>
</p>

<p align="center">
	<sub>⭐ If you found this project helpful, consider giving it a star!</sub>
</p>
