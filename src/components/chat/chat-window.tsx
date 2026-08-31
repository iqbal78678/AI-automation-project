import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import { useEffect, useMemo, useRef, useState } from "react";
import { Lightbulb, ListChecks, Mail, PanelLeft, PlugZap } from "lucide-react";
import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation";
import {
  Message,
  MessageContent,
  MessageResponse,
} from "@/components/ai-elements/message";
import {
  PromptInput,
  PromptInputFooter,
  PromptInputSubmit,
  PromptInputTextarea,
  type PromptInputMessage,
} from "@/components/ai-elements/prompt-input";
import { Shimmer } from "@/components/ai-elements/shimmer";
import { getWebhookUrl } from "@/lib/settings";
import { WEBHOOK_EVENT } from "@/lib/settings-events";
import { ensureThread, setThreadMessages } from "@/lib/threads";
import { SettingsDialog } from "./settings-dialog";
import logo from "@/assets/logo.png";

function useWebhookUrl() {
  const [url, setUrl] = useState(() => getWebhookUrl());
  useEffect(() => {
    const sync = () => setUrl(getWebhookUrl());
    window.addEventListener(WEBHOOK_EVENT, sync);
    return () => window.removeEventListener(WEBHOOK_EVENT, sync);
  }, []);
  return url;
}

export function ChatWindow({
  threadId,
  onToggleSidebar,
}: {
  threadId: string;
  onToggleSidebar: () => void;
}) {
  const [initialMessages] = useState<UIMessage[]>(() =>
    typeof window === "undefined" ? [] : (ensureThread(threadId).messages ?? []),
  );
  const webhookUrl = useWebhookUrl();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: "/api/chat",
        body: { webhookUrl, sessionId: threadId },
      }),
    [webhookUrl, threadId],
  );

  const { messages, sendMessage, status, error } = useChat({
    id: threadId,
    messages: initialMessages,
    transport,
  });

  // Persist messages into the in-memory thread store.
  useEffect(() => {
    setThreadMessages(threadId, messages);
  }, [threadId, messages]);

  // Keep the composer focused.
  useEffect(() => {
    if (status === "ready") textareaRef.current?.focus();
  }, [status, threadId]);

  const isLoading = status === "submitted" || status === "streaming";
  const isEmpty = messages.length === 0;

  const handleSubmit = async (message: PromptInputMessage) => {
    const text = message.text.trim();
    if (!text || isLoading) return;
    await sendMessage({ text });
  };

  return (
    <div className="flex h-full min-w-0 flex-1 flex-col bg-background">
      <header className="flex items-center gap-3 border-b border-border bg-card/60 px-3 py-2.5 backdrop-blur-sm md:px-5">
        <button
          type="button"
          onClick={onToggleSidebar}
          aria-label="Toggle sidebar"
          className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground md:hidden"
        >
          <PanelLeft className="size-5" />
        </button>
        <img
          src={logo}
          alt=""
          width={24}
          height={24}
          className="rounded-md ring-1 ring-border md:hidden"
        />
        <span className="text-sm font-semibold tracking-tight text-foreground">
          Nodely Chat
        </span>
        <span
          className={
            webhookUrl
              ? "ml-auto flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-600 ring-1 ring-emerald-500/25 dark:text-emerald-400"
              : "ml-auto flex items-center gap-1.5 rounded-full bg-amber-500/10 px-2.5 py-1 text-xs font-medium text-amber-600 ring-1 ring-amber-500/25 dark:text-amber-400"
          }
        >
          <span
            className={
              webhookUrl
                ? "size-1.5 rounded-full bg-emerald-500"
                : "size-1.5 animate-pulse rounded-full bg-amber-500"
            }
          />
          {webhookUrl ? "n8n connected" : "Webhook not set"}
        </span>
      </header>

      <Conversation className="flex-1">
        <ConversationContent className="mx-auto w-full max-w-2xl gap-6 px-4 py-6">
          {isEmpty ? (
            <div className="flex flex-col items-center justify-center gap-4 py-24 text-center">
              <img
                src={logo}
                alt="Nodely logo"
                width={56}
                height={56}
                className="rounded-2xl"
              />
              <div>
                <h1 className="text-lg font-semibold tracking-tight text-foreground">
                  How can I help?
                </h1>
                <p className="mt-1 text-sm text-muted-foreground">
                  Send a message and your n8n workflow will answer.
                </p>
              </div>
              {!webhookUrl && (
                <SettingsDialog>
                  <button
                    type="button"
                    className="mt-2 inline-flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium text-foreground shadow-xs transition-colors hover:bg-accent"
                  >
                    <PlugZap className="size-4" />
                    Connect your n8n webhook
                  </button>
                </SettingsDialog>
              )}
            </div>
          ) : (
            messages.map((message) => {
              const text = message.parts
                .map((p) => (p.type === "text" ? p.text : ""))
                .join("");
              return (
                <Message key={message.id} from={message.role}>
                  <MessageContent>
                    {message.role === "assistant" ? (
                      <MessageResponse>{text}</MessageResponse>
                    ) : (
                      text
                    )}
                  </MessageContent>
                </Message>
              );
            })
          )}
          {status === "submitted" && (
            <Message from="assistant">
              <MessageContent>
                <Shimmer>Thinking…</Shimmer>
              </MessageContent>
            </Message>
          )}
          {error && (
            <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-foreground">
              {error.message || "Something went wrong while contacting n8n."}
            </div>
          )}
        </ConversationContent>
        <ConversationScrollButton />
      </Conversation>

      <div className="mx-auto w-full max-w-2xl px-4 pb-4">
        <PromptInput onSubmit={handleSubmit}>
          <PromptInputTextarea
            ref={textareaRef}
            placeholder="Message your agent…"
            disabled={isLoading}
          />
          <PromptInputFooter className="justify-end">
            <PromptInputSubmit status={status} disabled={isLoading} />
          </PromptInputFooter>
        </PromptInput>
        <p className="pt-2 text-center text-[11px] text-muted-foreground">
          Replies come from your n8n workflow.
        </p>
      </div>
    </div>
  );
}
