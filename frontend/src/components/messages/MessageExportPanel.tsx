import { useState } from "react";
import { Download } from "lucide-react";

import { SuccessCheck } from "@/components/motion";
import { Button } from "@/components/ui/button";
import { CHAT_USERS, CONVERSATIONS, chatUserById, conversationById } from "@/data/messagesData";
import { messagesService } from "@/lib/messagesService";
import { cn } from "@/lib/utils";

type ExportScope = "conversation" | "user" | "group" | "dateRange";
type ExportFormat = "json" | "csv" | "pdf";

function downloadBlob(filename: string, content: string, mime: string) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function toCsv(rows: Record<string, string>[]): string {
  if (rows.length === 0) return "";
  const headers = Object.keys(rows[0]);
  const escape = (v: string) => `"${v.replace(/"/g, '""')}"`;
  return [headers.join(","), ...rows.map((r) => headers.map((h) => escape(r[h] ?? "")).join(","))].join("\n");
}

export function MessageExportPanel({ currentUserId }: { currentUserId: string }) {
  const [scope, setScope] = useState<ExportScope>("conversation");
  const [format, setFormat] = useState<ExportFormat>("json");
  const [conversationId, setConversationId] = useState(CONVERSATIONS[0]?.id ?? "");
  const [userId, setUserId] = useState(CHAT_USERS[0]?.id ?? "");
  const [fromDate, setFromDate] = useState("2026-07-01");
  const [toDate, setToDate] = useState("2026-07-10");
  const [done, setDone] = useState(false);

  function gatherMessages() {
    if (scope === "conversation") return messagesService.getMessages(conversationId);
    if (scope === "user") return CONVERSATIONS.flatMap((c) => messagesService.getMessages(c.id)).filter((m) => m.senderId === userId);
    if (scope === "group") return CONVERSATIONS.filter((c) => c.type !== "direct").flatMap((c) => messagesService.getMessages(c.id));
    const from = new Date(fromDate).getTime();
    const to = new Date(toDate).getTime() + 86_400_000;
    return CONVERSATIONS.flatMap((c) => messagesService.getMessages(c.id)).filter((m) => {
      const t = new Date(m.createdAt).getTime();
      return t >= from && t <= to;
    });
  }

  function handleExport() {
    const messages = gatherMessages();
    const label = scope === "conversation" ? conversationById(conversationId)?.title ?? "conversation" : scope;
    const timestamp = new Date().toISOString().slice(0, 10);

    if (format === "pdf") {
      // Placeholder — real PDF rendering needs a dedicated library; simulate the queued export.
      console.log("Export queued (PDF):", { scope, label, messageCount: messages.length });
    } else if (format === "csv") {
      const rows = messages.map((m) => ({
        id: m.id, conversation: conversationById(m.conversationId)?.title ?? m.conversationId,
        sender: chatUserById(m.senderId)?.name ?? m.senderId, body: m.body, type: m.type,
        attachments: String(m.attachments.length), createdAt: m.createdAt, status: m.status,
      }));
      downloadBlob(`messages-export-${label}-${timestamp}.csv`, toCsv(rows), "text/csv");
    } else {
      downloadBlob(`messages-export-${label}-${timestamp}.json`, JSON.stringify(messages, null, 2), "application/json");
    }

    if (scope === "conversation") messagesService.logExport(conversationId, currentUserId, format);
    setDone(true);
    setTimeout(() => setDone(false), 2500);
  }

  return (
    <div className="space-y-4">
      <div>
        <p className="mb-1.5 text-[12px] font-medium text-foreground">Export scope</p>
        <div className="flex flex-wrap gap-1.5">
          {([
            { value: "conversation", label: "Selected conversation" },
            { value: "user", label: "All messages by user" },
            { value: "group", label: "By class/group" },
            { value: "dateRange", label: "By date range" },
          ] as { value: ExportScope; label: string }[]).map((o) => (
            <button
              key={o.value}
              onClick={() => setScope(o.value)}
              className={cn(
                "rounded-full border px-3 py-1.5 text-[11.5px] font-medium transition-colors",
                scope === o.value ? "border-primary bg-primary/10 text-primary" : "border-border/60 text-muted-foreground hover:bg-muted",
              )}
            >
              {o.label}
            </button>
          ))}
        </div>
      </div>

      {scope === "conversation" && (
        <div>
          <label className="mb-1.5 block text-[12px] font-medium text-foreground">Conversation</label>
          <select value={conversationId} onChange={(e) => setConversationId(e.target.value)} className="h-9 w-full rounded-xl border border-input bg-background px-3 text-[13px] text-foreground focus:outline-none focus:ring-1 focus:ring-ring">
            {CONVERSATIONS.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}
          </select>
        </div>
      )}

      {scope === "user" && (
        <div>
          <label className="mb-1.5 block text-[12px] font-medium text-foreground">User</label>
          <select value={userId} onChange={(e) => setUserId(e.target.value)} className="h-9 w-full rounded-xl border border-input bg-background px-3 text-[13px] text-foreground focus:outline-none focus:ring-1 focus:ring-ring">
            {CHAT_USERS.map((u) => <option key={u.id} value={u.id}>{u.name} ({u.role})</option>)}
          </select>
        </div>
      )}

      {scope === "dateRange" && (
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1.5 block text-[12px] font-medium text-foreground">From</label>
            <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} className="h-9 w-full rounded-xl border border-input bg-background px-3 text-[13px] text-foreground focus:outline-none focus:ring-1 focus:ring-ring" />
          </div>
          <div>
            <label className="mb-1.5 block text-[12px] font-medium text-foreground">To</label>
            <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} className="h-9 w-full rounded-xl border border-input bg-background px-3 text-[13px] text-foreground focus:outline-none focus:ring-1 focus:ring-ring" />
          </div>
        </div>
      )}

      <div>
        <p className="mb-1.5 text-[12px] font-medium text-foreground">Format</p>
        <div className="flex gap-1.5">
          {(["json", "csv", "pdf"] as ExportFormat[]).map((f) => (
            <button
              key={f}
              onClick={() => setFormat(f)}
              className={cn(
                "rounded-full border px-3 py-1.5 text-[11.5px] font-medium uppercase transition-colors",
                format === f ? "border-primary bg-primary/10 text-primary" : "border-border/60 text-muted-foreground hover:bg-muted",
              )}
            >
              {f}
            </button>
          ))}
        </div>
        <p className="mt-1 text-[11px] text-muted-foreground">Attachment metadata (name, type, size) is included automatically; files themselves are not bundled in this preview export.</p>
      </div>

      <div className="flex items-center gap-3">
        <Button className="gap-1.5" onClick={handleExport}>
          <Download className="h-4 w-4" /> Export
        </Button>
        {done && <SuccessCheck size={28} label="Export ready" />}
      </div>
    </div>
  );
}
