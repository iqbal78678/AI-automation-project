import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { createThread } from "@/lib/threads";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Nodely — Chat with your n8n agent" },
      {
        name: "description",
        content:
          "A minimal chat interface for your n8n AI agent workflow. Clean threads, fast replies, powered by your own webhook.",
      },
      { property: "og:title", content: "Nodely — Chat with your n8n agent" },
      {
        property: "og:description",
        content:
          "A minimal chat interface for your n8n AI agent workflow. Clean threads, fast replies, powered by your own webhook.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Index,
});

function Index() {
  const navigate = useNavigate();

  useEffect(() => {
    const thread = createThread();
    void navigate({ to: "/chat/$threadId", params: { threadId: thread.id }, replace: true });
  }, [navigate]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <p className="text-sm text-muted-foreground">Starting a new chat…</p>
    </div>
  );
}
