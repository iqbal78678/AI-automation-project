const WEBHOOK_KEY = "n8n-chat-webhook-url-v3";

// Default n8n webhook for this project — used until the user overrides it
// in Settings. Production URL (requires the workflow to be Active in n8n);
// the /webhook-test/ variant only answers once after clicking
// "Execute workflow" in the n8n editor.
const DEFAULT_WEBHOOK_URL =
  "https://iqbal124421.app.n8n.cloud/webhook/dfd4b8ed-d524-477d-8634-acedd03ca00a";

export function getWebhookUrl(): string {
  if (typeof window === "undefined") return DEFAULT_WEBHOOK_URL;
  return window.localStorage.getItem(WEBHOOK_KEY) ?? DEFAULT_WEBHOOK_URL;
}

export function setWebhookUrl(url: string) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(WEBHOOK_KEY, url.trim());
}
