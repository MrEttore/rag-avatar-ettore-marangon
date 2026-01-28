import { OpenAIProvider } from "@ai-sdk/openai";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { convertToModelMessages, streamText, UIMessage } from "ai";
import fs from "fs/promises";
import path from "path";

import { openai } from "@/lib/ai/providers";

// TODO: Build logging for each agent step.

export class PersonaAgent {
  private provider: OpenAIProvider;
  private systemPrompt: string =
    "You are acting as Ettore Marangon. You are answering questions on Ettore Marangon's website, particularly questions related to Ettore Marangon's career, background, skills and experience. Your responsibility is to represent Ettore Marangon for interactions on his website as faithfully as possible. You are given a summary of Ettore Marangon's background and LinkedIn profile which you can use to answer questions. Be professional and engaging, as if talking to a potential client or future employer who came across the website. If you don't know the answer, say so. Respond in Markdown.";
  private linkedInCache: { pageContent: string; metadata?: Record<string, unknown> } | null = null;
  private summaryCache: { pageContent: string; metadata?: Record<string, unknown> } | null = null;

  public constructor() {
    this.provider = openai;
    this.sayHello();
  }

  public async respond(messages: UIMessage[]): Promise<Response> {
    console.log("System Prompt:\n");
    console.log(await this.buildSystemPrompt());

    const result = streamText({
      model: this.provider("gpt-4o-mini"),
      system: await this.buildSystemPrompt(),
      messages: await convertToModelMessages(messages),
    });

    return result.toUIMessageStreamResponse();
  }

  public async getLinkedInText(): Promise<string> {
    const doc = await this.loadLinkedInDocument();
    return doc?.pageContent ?? "";
  }

  public async getSummaryText(): Promise<string> {
    const doc = await this.loadSummaryDocument();
    return doc?.pageContent ?? "";
  }

  private async buildSystemPrompt(): Promise<string> {
    const linkedInDoc = await this.loadLinkedInDocument();
    const summaryDoc = await this.loadSummaryDocument();

    let prompt = this.systemPrompt;

    prompt += `\n\n## LinkedIn Profile:\n${linkedInDoc?.pageContent ?? ""}`;
    prompt += `\n\n## Summary:\n${summaryDoc?.pageContent ?? ""}`;
    prompt += `\n\nWith this context, please chat with the user, always staying in character as Ettore Marangon.`;

    return prompt;
  }

  private async loadLinkedInDocument(): Promise<{
    pageContent: string;
    metadata?: Record<string, unknown>;
  } | null> {
    if (this.linkedInCache) return this.linkedInCache;

    const pdfPath = path.join(process.cwd(), "public/me", "linkedin.pdf");
    const loader = new PDFLoader(pdfPath);
    const docs = await loader.load();

    const cleaned = docs
      .map((doc) => ({
        ...doc,
        pageContent: this.normalizeText(doc.pageContent),
      }))
      .filter((doc) => doc.pageContent.length > 0);

    const content = cleaned.map((d) => d.pageContent).join("\n");

    this.linkedInCache = content.length
      ? {
          pageContent: content,
          metadata: { source: "linkedin.pdf" },
        }
      : null;

    return this.linkedInCache;
  }

  private async loadSummaryDocument(): Promise<{
    pageContent: string;
    metadata?: Record<string, unknown>;
  } | null> {
    if (this.summaryCache) return this.summaryCache;

    const summaryPath = path.join(process.cwd(), "public/me", "summary.txt");
    const summaryText = await fs.readFile(summaryPath, "utf8");
    const summary = this.normalizeText(summaryText);

    this.summaryCache = summary.length
      ? {
          pageContent: summary,
          metadata: { source: "summary.txt" },
        }
      : null;

    return this.summaryCache;
  }

  private normalizeText(text: string): string {
    return text
      .replace(/-\n/g, "")
      .replace(/\n{2,}/g, "\n")
      .replace(/[ \t]{2,}/g, " ")
      .trim();
  }

  private sayHello(): void {
    console.log("\x1b[33m\x1b[3m=> PersonaAgent | Initialized.\x1b[0m");
  }
}
