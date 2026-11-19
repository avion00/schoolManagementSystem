import { useRef, useState, type ChangeEvent, type DragEvent, type KeyboardEvent } from "react";
import { Loader2, Lock, Paperclip, Send, Smile, X } from "lucide-react";
import { toast } from "sonner";

import { AttachmentPreview } from "@/components/messages/AttachmentPreview";
import { Button } from "@/components/ui/button";
import { uploadFile } from "@/api/files";
import { errorMessage } from "@/api/http";
import type { ChatMessage, ChatUser, MessageAttachment } from "@/api/types/messages";
import { mapAttachment } from "@/lib/messagesService";
import { cn } from "@/lib/utils";

const QUICK_EMOJIS = ["😀", "😂", "👍", "🎉", "❤️", "🙏", "😢", "🔥"];

export function MessageComposer({
  onSend,
  onTyping,
  replyingTo,
  replyingToSender,
  onCancelReply,
  disabled = false,
  disabledReason,
}: {
  /** Resolves when the server has the message; the draft is kept if it fails. */
  onSend: (body: string, attachments: MessageAttachment[]) => Promise<unknown>;
  onTyping: () => void;
  replyingTo?: ChatMessage;
  replyingToSender?: ChatUser;
  onCancelReply?: () => void;
  disabled?: boolean;
  disabledReason?: string;
}) {
  const [text, setText] = useState("");
  const [attachments, setAttachments] = useState<MessageAttachment[]>([]);
  const [showEmojis, setShowEmojis] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(0);
  const [sending, setSending] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Files upload as soon as they're picked; the message carries their ids.
  async function addFiles(files: FileList | null) {
    if (!files?.length) return;
    const list = Array.from(files);
    if (attachments.length + list.length > 10) { toast.error("Attach at most 10 files per message."); return; }
    setUploading((n) => n + list.length);
    for (const f of list) {
      try {
        const stored = await uploadFile(f);
        setAttachments((prev) => [...prev, mapAttachment(stored)]);
      } catch (e) {
        toast.error(`${f.name}: ${errorMessage(e)}`);
      } finally {
        setUploading((n) => n - 1);
      }
    }
  }

  async function handleSend() {
    if (disabled || sending || uploading) return;
    if (!text.trim() && attachments.length === 0) return;
    setSending(true);
    try {
      await onSend(text.trim(), attachments);
      setText("");
      setAttachments([]);
      setShowEmojis(false);
    } catch (e) {
      toast.error(errorMessage(e, "Message not sent."));
    } finally {
      setSending(false);
    }
  }

  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  function handleDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setDragging(false);
    if (disabled) return;
    addFiles(e.dataTransfer.files);
  }

  if (disabled) {
    return (
      <div className="flex items-center gap-2 border-t border-border/60 bg-muted/40 px-4 py-3.5 text-[12.5px] text-muted-foreground">
        <Lock className="h-3.5 w-3.5" />
        {disabledReason ?? "You don't have permission to send messages in this conversation."}
      </div>
    );
  }

  return (
    <div
      className={cn("relative shrink-0 border-t border-border/60 bg-card", dragging && "bg-primary/5")}
      onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
    >
      {replyingTo && (
        <div className="flex items-center justify-between gap-2 border-b border-border/60 bg-muted/40 px-4 py-2">
          <div className="min-w-0">
            <p className="text-[11px] font-medium text-primary">Replying to {replyingToSender?.name ?? "message"}</p>
            <p className="truncate text-[12px] text-muted-foreground">{replyingTo.body || "Attachment"}</p>
          </div>
          <Button variant="ghost" size="icon" className="h-6 w-6 shrink-0" onClick={onCancelReply}>
            <X className="h-3.5 w-3.5" />
          </Button>
        </div>
      )}

      {attachments.length > 0 && (
        <div className="flex flex-wrap gap-2 border-b border-border/60 px-4 py-2.5">
          {attachments.map((a) => (
            <div key={a.id} className="w-56">
              <AttachmentPreview attachment={a} dense onRemove={() => setAttachments((prev) => prev.filter((x) => x.id !== a.id))} />
            </div>
          ))}
        </div>
      )}

      {showEmojis && (
        <div className="flex flex-wrap gap-1 border-b border-border/60 px-4 py-2">
          {QUICK_EMOJIS.map((emoji) => (
            <button
              key={emoji}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-[16px] hover:bg-muted"
              onClick={() => setText((t) => t + emoji)}
            >
              {emoji}
            </button>
          ))}
        </div>
      )}

      <div className="flex items-end gap-2 px-3 py-3">
        <input ref={fileInputRef} type="file" multiple className="hidden" onChange={(e: ChangeEvent<HTMLInputElement>) => addFiles(e.target.files)} />
        <Button variant="ghost" size="icon" className="h-9 w-9 shrink-0 text-muted-foreground" onClick={() => fileInputRef.current?.click()} aria-label="Attach file">
          <Paperclip className="h-4.5 w-4.5" />
        </Button>
        <Button
          variant="ghost" size="icon"
          className={cn("h-9 w-9 shrink-0 text-muted-foreground", showEmojis && "bg-muted text-foreground")}
          onClick={() => setShowEmojis((s) => !s)}
          aria-label="Emoji"
        >
          <Smile className="h-4.5 w-4.5" />
        </Button>

        <textarea
          value={text}
          onChange={(e) => { setText(e.target.value); onTyping(); }}
          onKeyDown={handleKeyDown}
          placeholder="Write a message... (Enter to send, Shift+Enter for new line)"
          rows={1}
          className="max-h-32 flex-1 resize-none rounded-xl border border-input bg-background px-3.5 py-2.5 text-[13.5px] text-foreground placeholder:text-muted-foreground/70 focus:outline-none focus:ring-1 focus:ring-ring"
        />

        <Button
          size="icon"
          className="h-9 w-9 shrink-0"
          onClick={handleSend}
          disabled={(!text.trim() && attachments.length === 0) || sending || uploading > 0}
          aria-label={uploading ? "Uploading files" : "Send message"}
        >
          {sending || uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
        </Button>
      </div>
    </div>
  );
}
