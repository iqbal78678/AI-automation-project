import { useState, type ReactNode } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { getWebhookUrl, setWebhookUrl } from "@/lib/settings";
import { WEBHOOK_EVENT } from "@/lib/settings-events";

export function SettingsDialog({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [url, setUrl] = useState("");

  const save = () => {
    setWebhookUrl(url);
    window.dispatchEvent(new Event(WEBHOOK_EVENT));
    setOpen(false);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (next) setUrl(getWebhookUrl());
        setOpen(next);
      }}
    >
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>n8n connection</DialogTitle>
          <DialogDescription>
            Paste the webhook URL of your n8n Chat Trigger (or Webhook) node.
            The app sends each message as{" "}
            <code className="rounded bg-muted px-1 py-0.5 text-xs">
              {"{ action: \"sendMessage\", sessionId, chatInput }"}
            </code>{" "}
            and reads the reply from <code className="rounded bg-muted px-1 py-0.5 text-xs">output</code>{" "}
            (or <code className="rounded bg-muted px-1 py-0.5 text-xs">text</code>,{" "}
            <code className="rounded bg-muted px-1 py-0.5 text-xs">message</code>…).
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-3">
          <Input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://your.app.n8n.cloud/webhook/…/chat"
            type="url"
            autoFocus
          />
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={save} disabled={!url.trim()}>
              Save
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
