import { UIMessage } from "ai";
import { NextRequest } from "next/server";

import { PersonaAgent } from "@/lib/ai/agents/PersonaAgent";

const personaAgent = new PersonaAgent();

export async function POST(request: NextRequest) {
  const { messages }: { messages: UIMessage[] } = await request.json();

  const response = await personaAgent.respond(messages);

  return response;
}
