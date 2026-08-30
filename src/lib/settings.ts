const WEBHOOK_KEY = "n8n-chat-webhook-url";

// Default n8n webhook for this project — used until the user overrides it
// in Settings.
const DEFAULT_WEBHOOK_URL =
  "https://iqbal124421.app.n8n.cloud/webhook-test/06e46e04-13a3-4868-9adb-b1557dda4526";

export function getWebhookUrl(): string {
  if (typeof window === "undefined") return DEFAULT_WEBHOOK_URL;
  return window.localStorage.getItem(WEBHOOK_KEY) ?? DEFAULT_WEBHOOK_URL;
}

export function setWebhookUrl(url: string) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(WEBHOOK_KEY, url.trim());
}
