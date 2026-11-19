import { useEffect, useState } from "react";
import { Download } from "lucide-react";
import { toast } from "sonner";

import { SuccessCheck } from "@/components/motion";
import { Button } from "@/components/ui/button";
import { errorMessage } from "@/api/http";
import { allConversations, messagesService } from "@/lib/messagesService";
import { cn } from "@/lib/utils";

type ExportFormat = "json" | "csv";

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

/**
 * Exports one conversation's full transcript, including deleted messages, as the
 * server records it. Every export is written to the audit log.
 */
export function MessageExportPanel(_props: { currentUserId: string }) {
  const [options, setOptions] = useState<{ id: string; title: string }[]>([]);
  const [conversationId, setConversationId] = useState("");
  const [format, setFormat] = useState<ExportFormat>("csv");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    allConversations()
      .then((rows) => { setOptions(rows); setConversationId((id) => id || rows[0]?.id || ""); })
      .catch((e) => toast.error(errorMessage(e)));
  }, []);

  async function handleExport() {
    if (!conversationId) return;
    setBusy(true);
    try {
      const data = await messagesService.exportConversation(conversationId);
      const from = fromDate ? new Date(`${fromDate}T00:00`).getTime() : -Infinity;
      const to = toDate ? new Date(`${toDate}T23:59:59`).getTime() : Infinity;
      const messages = data.messages.filter((m) => {
        const t = new Date(m.created_at).getTime();
        return t >= from && t <= to;
      });
      const label = (data.conversation.title || "conversation").replace(/[^\w-]+/g, "-").slice(0, 40);
      const stamp = new Date().toISOString().slice(0, 10);
      if (format === "csv") {
        const rows = messages.map((m) => ({
          sent_at: m.created_at, sender: m.sender, message: m.body,
          deleted_at: m.deleted_at ?? "",
        }));
        downloadBlob(`chat-${label}-${stamp}.csv`, toCsv(rows), "text/csv");
      } else {
        downloadBlob(`chat-${label}-${stamp}.json`, JSON.stringify({ ...data, messages }, null, 2), "application/json");
      }
      setDone(true);
      setTimeout(() => setDone(false), 2500);
    } catch (e) {
      toast.error(errorMessage(e));
    } finally {
      setBusy(false);
    }
  }

  const fieldClass = "h-9 w-full rounded-xl border border-input bg-background px-3 text-[13px] text-foreground focus:outline-none focus:ring-1 focus:ring-ring";

  return (
    <div className="space-y-4">
      <div>
        <label className="mb-1.5 block text-[12px] font-medium text-foreground">Conversation</label>
        <select value={conversationId} onChange={(e) => setConversationId(e.target.value)} className={fieldClass}>
          {options.length === 0 && <option value="">No conversations yet</option>}
          {options.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="mb-1.5 block text-[12px] font-medium text-foreground">From (optional)</label>
          <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} className={fieldClass} />
        </div>
        <div>
          <label className="mb-1.5 block text-[12px] font-medium text-foreground">To (optional)</label>
          <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} className={fieldClass} />
        </div>
      </div>

      <div>
        <p className="mb-1.5 text-[12px] font-medium text-foreground">Format</p>
        <div className="flex gap-1.5">
          {(["csv", "json"] as ExportFormat[]).map((f) => (
            <button key={f} onClick={() => setFormat(f)}
              className={cn(
                "rounded-full border px-3 py-1.5 text-[11.5px] font-medium uppercase transition-colors",
                format === f ? "border-primary bg-primary/10 text-primary" : "border-border/60 text-muted-foreground hover:bg-muted",
              )}>
              {f}
            </button>
          ))}
        </div>
      </div>

      <p className="text-[11.5px] text-muted-foreground">
        The export includes deleted messages and is recorded in the audit log with your name.
      </p>

      <div className="flex items-center gap-3">
        <Button className="gap-1.5" onClick={handleExport} disabled={busy || !conversationId}>
          <Download className="h-4 w-4" /> {busy ? "Exporting…" : "Export"}
        </Button>
        {done && <SuccessCheck size={28} label="Export ready" />}
      </div>
    </div>
  );
}
