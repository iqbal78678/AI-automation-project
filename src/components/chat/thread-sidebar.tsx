import { Link, useNavigate } from "@tanstack/react-router";
import { MessageSquare, Plus, Settings, Trash2 } from "lucide-react";
import { useEffect, useState, useSyncExternalStore } from "react";
import {
  createThread,
  deleteThread,
  getThreadsVersion,
  listThreads,
  subscribeThreads,
} from "@/lib/threads";
import { cn } from "@/lib/utils";
import logo from "@/assets/logo.png";
import { SettingsDialog } from "./settings-dialog";

export function ThreadSidebar({
  activeThreadId,
  onNavigate,
}: {
  activeThreadId: string;
  onNavigate?: () => void;
}) {
  const navigate = useNavigate();
  useSyncExternalStore(subscribeThreads, getThreadsVersion, getThreadsVersion);
  // Gate on mount so SSR and first client render match (thread store is
  // client-only).
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const threads = mounted ? listThreads() : [];

  const newChat = () => {
    const thread = createThread();
    void navigate({
      to: "/chat/$threadId",
      params: { threadId: thread.id },
    });
    onNavigate?.();
  };

  return (
    <div className="flex h-full w-full flex-col bg-sidebar">
      <div className="flex items-center gap-2.5 px-4 pt-5 pb-4">
        <img src={logo} alt="Nodely logo" width={28} height={28} className="rounded-md" />
        <span className="text-[15px] font-semibold tracking-tight text-sidebar-foreground">
          Nodely
        </span>
      </div>

      <div className="px-3">
        <button
          type="button"
          onClick={newChat}
          className="flex w-full items-center gap-2 rounded-lg border border-sidebar-border bg-background px-3 py-2 text-sm font-medium text-sidebar-foreground shadow-xs transition-colors hover:bg-sidebar-accent"
        >
          <Plus className="size-4" />
          New chat
        </button>
      </div>

      <div className="mt-4 flex-1 overflow-y-auto px-3 pb-3">
        <p className="px-2 pb-2 text-xs font-medium tracking-wide text-muted-foreground uppercase">
          Chats
        </p>
        {threads.length === 0 ? (
          <p className="px-2 text-sm text-muted-foreground">No chats yet</p>
        ) : (
          <ul className="flex flex-col gap-0.5">
            {threads.map((thread) => {
              const active = thread.id === activeThreadId;
              return (
                <li key={thread.id} className="group relative">
                  <div
                    className={cn(
                      "flex items-center rounded-lg transition-colors",
                      active
                        ? "bg-sidebar-accent"
                        : "hover:bg-sidebar-accent/60",
                    )}
                  >
                    <Link
                      to="/chat/$threadId"
                      params={{ threadId: thread.id }}
                      onClick={onNavigate}
                      className={cn(
                        "flex min-w-0 flex-1 items-center gap-2 px-3 py-2 text-sm",
                        active
                          ? "font-medium text-sidebar-accent-foreground"
                          : "text-sidebar-foreground/80",
                      )}
                    >
                      <MessageSquare className="size-3.5 shrink-0 text-muted-foreground" />
                      <span className="truncate">{thread.title}</span>
                    </Link>
                    <button
                      type="button"
                      aria-label={`Delete ${thread.title}`}
                      onClick={() => {
                        const wasActive = thread.id === activeThreadId;
                        deleteThread(thread.id);
                        if (wasActive) {
                          const remaining = listThreads();
                          const next = remaining[0] ?? createThread();
                          void navigate({
                            to: "/chat/$threadId",
                            params: { threadId: next.id },
                          });
                        }
                      }}
                      className="mr-1.5 hidden rounded-md p-1.5 text-muted-foreground transition-colors group-hover:block hover:bg-background hover:text-foreground"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <div className="border-t border-sidebar-border p-3">
        <SettingsDialog>
          <button
            type="button"
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-sidebar-foreground/80 transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
          >
            <Settings className="size-4" />
            Settings
          </button>
        </SettingsDialog>
        <p className="px-3 pt-2 text-[11px] leading-snug text-muted-foreground">
          Chats live in this session only and clear on refresh.
        </p>
      </div>
    </div>
  );
}
