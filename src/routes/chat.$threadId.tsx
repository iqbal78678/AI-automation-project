import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { ChatWindow } from "@/components/chat/chat-window";
import { ThreadSidebar } from "@/components/chat/thread-sidebar";
import { ensureThread } from "@/lib/threads";

export const Route = createFileRoute("/chat/$threadId")({
  head: () => ({
    meta: [
      { title: "Chat — Nodely" },
      {
        name: "description",
        content: "Chat with your n8n AI agent workflow.",
      },
      { property: "og:title", content: "Chat — Nodely" },
      {
        property: "og:description",
        content: "Chat with your n8n AI agent workflow.",
      },
    ],
  }),
  component: ChatPage,
});

function ChatPage() {
  const { threadId } = Route.useParams();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Make sure the thread exists (client-side only store).
  if (typeof window !== "undefined") ensureThread(threadId);

  return (
    <div className="flex h-dvh overflow-hidden bg-background">
      {/* Desktop sidebar */}
      <aside className="hidden w-64 shrink-0 border-r border-sidebar-border md:block">
        <ThreadSidebar activeThreadId={threadId} />
      </aside>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <button
            type="button"
            aria-label="Close sidebar"
            className="absolute inset-0 bg-foreground/20"
            onClick={() => setSidebarOpen(false)}
          />
          <aside className="absolute inset-y-0 left-0 w-72 border-r border-sidebar-border">
            <ThreadSidebar
              activeThreadId={threadId}
              onNavigate={() => setSidebarOpen(false)}
            />
          </aside>
        </div>
      )}

      <ChatWindow
        key={threadId}
        threadId={threadId}
        onToggleSidebar={() => setSidebarOpen((v) => !v)}
      />
    </div>
  );
}
