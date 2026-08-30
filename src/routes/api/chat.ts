import { createFileRoute } from "@tanstack/react-router";
import {
  createUIMessageStream,
  createUIMessageStreamResponse,
  type UIMessage,
} from "ai";

type ChatRequestBody = {
  messages?: UIMessage[];
  webhookUrl?: string;
  sessionId?: string;
};

function lastUserText(messages: UIMessage[]): string {
  for (let i = messages.length - 1; i >= 0; i--) {
    const m = messages[i];
    if (!m || m.role !== "user") continue;
    const text = m.parts
      .map((p) => (p.type === "text" ? p.text : ""))
      .join("")
      .trim();
    if (text) return text;
  }
  return "";
}

function extractReply(payload: unknown): string {
  if (typeof payload === "string") return payload;
  if (Array.isArray(payload)) {
    if (payload.length === 0) return "";
    return extractReply(payload[0]);
  }
  if (payload && typeof payload === "object") {
    const obj = payload as Record<string, unknown>;
    for (const key of ["output", "text", "message", "response", "reply", "content", "answer"]) {
      const v = obj[key];
      if (typeof v === "string" && v.trim()) return v;
    }
    return JSON.stringify(payload, null, 2);
  }
  return String(payload ?? "");
}

export const Route = createFileRoute("/api/chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const body = (await request.json()) as ChatRequestBody;
        const messages = body.messages;
        if (!Array.isArray(messages)) {
          return new Response("Messages are required", { status: 400 });
        }

        const webhookUrl = (body.webhookUrl ?? "").trim();
        if (!webhookUrl) {
          return new Response(
            "No n8n webhook URL configured. Open Settings in the sidebar and paste your webhook URL.",
            { status: 400 },
          );
        }
        try {
          new URL(webhookUrl);
        } catch {
          return new Response("The configured webhook URL is not valid.", {
            status: 400,
          });
        }

        const chatInput = lastUserText(messages);
        const sessionId = body.sessionId ?? "default";

        let upstream: Response;
        try {
          upstream = await fetch(webhookUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              action: "sendMessage",
              sessionId,
              chatInput,
            }),
          });
        } catch {
          return new Response(
            "Could not reach your n8n webhook. Check that the URL is correct and the workflow is active.",
            { status: 502 },
          );
        }

        const rawText = await upstream.text();
        if (!upstream.ok) {
          return new Response(
            `n8n returned an error (${upstream.status}): ${rawText.slice(0, 300)}`,
            { status: 502 },
          );
        }

        let reply: string;
        try {
          reply = extractReply(JSON.parse(rawText));
        } catch {
          reply = rawText;
        }
        if (!reply.trim()) {
          reply =
            "The workflow ran but returned an empty response. Check the 'Respond to Webhook' node output in n8n.";
        }

        const stream = createUIMessageStream({
          execute: ({ writer }) => {
            const id = "text-1";
            writer.write({ type: "text-start", id });
            writer.write({ type: "text-delta", id, delta: reply });
            writer.write({ type: "text-end", id });
          },
        });

        return createUIMessageStreamResponse({ stream });
      },
    },
  },
});
