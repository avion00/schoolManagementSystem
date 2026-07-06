import { X, Send, Edit2, Paperclip } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MessagePriorityBadge } from "@/components/messages/MessagePriorityBadge";
import type { MessagePriority, MessageAttachment } from "@/data/messagesData";

interface PreviewData {
  subject:       string;
  type:          string;
  priority:      MessagePriority;
  recipientType: string;
  recipients:    string[];
  sendMethod:    string;
  body:          string;
  attachments:   MessageAttachment[];
}

interface Props {
  data:     PreviewData;
  onClose:  () => void;
  onSend:   () => void;
}

export function MessagePreviewModal({ data, onClose, onSend }: Props) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.45)" }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="relative w-full max-w-2xl animate-in zoom-in-95 fade-in duration-200 rounded-2xl bg-background shadow-2xl border border-border overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <h2 className="text-[15px] font-semibold text-foreground">Message Preview</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="max-h-[70vh] overflow-y-auto p-6 space-y-5">
          {/* Meta grid */}
          <div className="grid grid-cols-2 gap-4 rounded-xl bg-muted/30 p-4 text-[13px]">
            {[
              { label: "Subject",    value: data.subject },
              { label: "Type",       value: data.type },
              { label: "Recipients", value: data.recipientType },
              { label: "To",         value: data.recipients.join(", ") || "—" },
              { label: "Send Via",   value: data.sendMethod },
            ].map(({ label, value }) => (
              <div key={label}>
                <p className="text-[11px] font-medium text-muted-foreground">{label}</p>
                <p className="mt-0.5 font-medium text-foreground">{value || "—"}</p>
              </div>
            ))}
            <div>
              <p className="text-[11px] font-medium text-muted-foreground">Priority</p>
              <div className="mt-0.5">
                <MessagePriorityBadge priority={data.priority} />
              </div>
            </div>
          </div>

          {/* Message body */}
          <div>
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Message</p>
            <div className="rounded-xl border border-border bg-muted/10 p-4 text-[13px] text-foreground leading-relaxed whitespace-pre-wrap">
              {data.body || <span className="text-muted-foreground italic">No message body.</span>}
            </div>
          </div>

          {/* Attachments */}
          {data.attachments.length > 0 && (
            <div>
              <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Attachments ({data.attachments.length})
              </p>
              <ul className="space-y-1.5">
                {data.attachments.map((a) => (
                  <li key={a.id} className="flex items-center gap-2 text-[13px]">
                    <Paperclip className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="text-foreground">{a.name}</span>
                    <span className="text-muted-foreground">({a.size})</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 border-t border-border px-6 py-4">
          <Button variant="outline" onClick={onClose} className="gap-1.5">
            <Edit2 className="h-3.5 w-3.5" />
            Edit
          </Button>
          <Button onClick={onSend} className="gap-1.5">
            <Send className="h-3.5 w-3.5" />
            Send Now
          </Button>
        </div>
      </div>
    </div>
  );
}
