import type { UIMessage } from "ai";

export type ChatThread = {
  id: string;
  title: string;
  createdAt: number;
  messages: UIMessage[];
};

const threads = new Map<string, ChatThread>();
const listeners = new Set<() => void>();
let version = 0;

function emit() {
  version++;
  for (const l of listeners) l();
}

export function subscribeThreads(cb: () => void) {
  listeners.add(cb);
  return () => {
    listeners.delete(cb);
  };
}

export function getThreadsVersion() {
  return version;
}

export function listThreads(): ChatThread[] {
  return [...threads.values()].sort((a, b) => b.createdAt - a.createdAt);
}

export function getThread(id: string): ChatThread | undefined {
  return threads.get(id);
}

export function createThread(id?: string): ChatThread {
  const thread: ChatThread = {
    id: id ?? crypto.randomUUID(),
    title: "New chat",
    createdAt: Date.now(),
    messages: [],
  };
  threads.set(thread.id, thread);
  emit();
  return thread;
}

export function ensureThread(id: string): ChatThread {
  return getThread(id) ?? createThread(id);
}

function deriveTitle(messages: UIMessage[]): string {
  const first = messages.find((m) => m.role === "user");
  if (!first) return "New chat";
  const text = first.parts
    .map((p) => (p.type === "text" ? p.text : ""))
    .join("")
    .trim();
  if (!text) return "New chat";
  return text.length > 40 ? text.slice(0, 40) + "…" : text;
}

export function setThreadMessages(id: string, messages: UIMessage[]) {
  const thread = threads.get(id);
  if (!thread) return;
  thread.messages = messages;
  thread.title = deriveTitle(messages);
  emit();
}

export function deleteThread(id: string) {
  threads.delete(id);
  emit();
}
