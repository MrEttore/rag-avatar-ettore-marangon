import { UIDataTypes, UIMessage, UITools } from "ai";

export function hasRenderableText(message: UIMessage<unknown, UIDataTypes, UITools>) {
  return message.parts.some((part) => part.type === "text" && part.text.trim().length > 0);
}
