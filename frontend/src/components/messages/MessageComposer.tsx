import { useRef, useState, type ChangeEvent, type DragEvent, type KeyboardEvent } from "react";
import { Lock, Mic, Paperclip, Send, Smile, X } from "lucide-react";

import { AttachmentPreview } from "@/components/messages/AttachmentPreview";
import { Button } from "@/components/ui/button";
import type { ChatMessage, ChatUser, MessageAttachment } from "@/data/messagesData";
import { cn } from "@/lib/utils";

const QUICK_EMOJIS = ["😀", "😂", "👍", "🎉", "❤️", "🙏", "😢", "🔥"];

function kindOf(file: File): MessageAttachment["kind"] {
  if (file.type.startsWith("image/")) return "image";
  if (file.type.startsWith("audio/")) return "audio";
  if (file.type.startsWith("video/")) return "video";
  if (file.type === "application/pdf") return "pdf";
  if (file.name.match(/\.(xlsx?|csv)$/i)) return "sheet";
  if (file.name.match(/\.(docx?|txt)$/i)) return "doc";
  return "other";
}

function sizeLabel(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function MessageComposer({
  onSend,
  onTyping,
  replyingTo,
  replyingToSender,
  onCancelReply,
  disabled = false,
  disabledReason,
}: {
  onSend: (body: string, attachments: MessageAttachment[]) => void;
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
  const fileInputRef = useRef<HTMLInputElement>(null);

  function addFiles(files: FileList | null) {
    if (!files) return;
    const next = Array.from(files).map((f, i) => ({
      id: `pending-${Date.now()}-${i}`,
      name: f.name,
      kind: kindOf(f),
      size: sizeLabel(f.size),
    }));
    setAttachments((prev) => [...prev, ...next]);
  }

  function handleSend() {
    if (disabled) return;
    if (!text.trim() && attachments.length === 0) return;
    onSend(text.trim(), attachments);
    setText("");
    setAttachments([]);
    setShowEmojis(false);
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

        <Button variant="ghost" size="icon" className="h-9 w-9 shrink-0 text-muted-foreground" aria-label="Voice message (coming soon)" disabled>
          <Mic className="h-4.5 w-4.5" />
        </Button>
        <Button
          size="icon"
          className="h-9 w-9 shrink-0"
          onClick={handleSend}
          disabled={!text.trim() && attachments.length === 0}
          aria-label="Send message"
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
