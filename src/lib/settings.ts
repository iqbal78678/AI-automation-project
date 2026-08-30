const WEBHOOK_KEY = "n8n-chat-webhook-url";

export function getWebhookUrl(): string {
  if (typeof window === "undefined") return "";
  return window.localStorage.getItem(WEBHOOK_KEY) ?? "";
}

export function setWebhookUrl(url: string) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(WEBHOOK_KEY, url.trim());
}
