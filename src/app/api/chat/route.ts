import { UIMessage } from "ai";
import { NextRequest } from "next/server";

import { AvatarAgent } from "@/lib/ai/agents/AvatarAgent";

export const runtime = "nodejs";

const avatarAgent = new AvatarAgent();

export async function POST(request: NextRequest) {
  const { messages }: { messages: UIMessage[] } = await request.json();

  const response = await avatarAgent.respond(messages);

  return response;
}
