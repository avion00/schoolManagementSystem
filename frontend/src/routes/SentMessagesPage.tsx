import { useState, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, Trash2, ChevronUp, ChevronDown, ChevronsUpDown } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MessageToolbar, EMPTY_MSG_FILTERS } from "@/components/messages/MessageToolbar";
import { MessageStatusBadge } from "@/components/messages/MessageStatusBadge";
import { MessagePriorityBadge } from "@/components/messages/MessagePriorityBadge";
import { MESSAGES } from "@/data/messagesData";
import type { MessageFilters } from "@/components/messages/MessageToolbar";
import type { Message } from "@/data/messagesData";
import { cn } from "@/lib/utils";

type SortKey = "subject" | "sentAt" | "status" | "priority";
type SortDir = "asc" | "desc";
const PAGE_SIZE = 12;

function SortHead({ col, label, sort, onSort }: { col: SortKey; label: string; sort: [SortKey, SortDir]; onSort: (c: SortKey) => void }) {
  const [active, dir] = sort;
  const Icon = active !== col ? ChevronsUpDown : dir === "asc" ? ChevronUp : ChevronDown;
  return (
    <th className="cursor-pointer select-none whitespace-nowrap px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground hover:text-foreground"
      onClick={() => onSort(col)}>
      <span className="flex items-center gap-1">{label}<Icon className={cn("h-3.5 w-3.5", active === col ? "text-primary" : "opacity-50")} /></span>
    </th>
  );
}

function applyFilters(msgs: Message[], filters: MessageFilters) {
  return msgs.filter((m) => {
    if (filters.search) {
      const q = filters.search.toLowerCase();
      if (!m.subject.toLowerCase().includes(q) && !m.sender.toLowerCase().includes(q)) return false;
    }
    if (filters.type     && m.type     !== filters.type)     return false;
    if (filters.priority && m.priority !== filters.priority) return false;
    if (filters.status   && m.status   !== filters.status)   return false;
    return true;
  });
}

export function SentMessagesPage() {
  const navigate = useNavigate();
  const [sort, setSort]       = useState<[SortKey, SortDir]>(["sentAt", "desc"]);
  const [page, setPage]       = useState(1);
  const [filters, setFilters] = useState<MessageFilters>(EMPTY_MSG_FILTERS);

  const sentMsgs = useMemo(() => MESSAGES.filter((m) => ["sent","failed","scheduled"].includes(m.status)), []);
  const filtered = useMemo(() => applyFilters(sentMsgs, filters), [sentMsgs, filters]);

  const onChange = useCallback((f: MessageFilters) => setFilters(f), []);
  const onClear  = useCallback(() => setFilters(EMPTY_MSG_FILTERS), []);

  function toggleSort(col: SortKey) {
    setSort(([c, d]) => col === c ? [c, d === "asc" ? "desc" : "asc"] : [col, "desc"]);
    setPage(1);
  }

  const sorted = [...filtered].sort((a, b) => {
    const [col, dir] = sort;
    const av = a[col] ?? ""; const bv = b[col] ?? "";
    return dir === "asc" ? String(av).localeCompare(String(bv)) : String(bv).localeCompare(String(av));
  });

  const total = sorted.length;
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const safePg = Math.min(page, pages);
  const slice = sorted.slice((safePg - 1) * PAGE_SIZE, safePg * PAGE_SIZE);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Sent Messages</h1>
        <p className="mt-0.5 text-[13px] text-muted-foreground">Messages sent, scheduled, and delivery history</p>
      </div>

      <MessageToolbar filters={filters} onChange={onChange} onClear={onClear} total={sentMsgs.length} filtered={filtered.length} />

      <Card className="overflow-hidden rounded-2xl shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="border-b border-border bg-muted/30">
              <tr>
                <SortHead col="subject"  label="Subject"     sort={sort} onSort={toggleSort} />
                <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Recipient Group</th>
                <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Total</th>
                <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Delivered</th>
                <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Read</th>
                <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Unread</th>
                <SortHead col="priority" label="Priority"    sort={sort} onSort={toggleSort} />
                <SortHead col="status"   label="Status"      sort={sort} onSort={toggleSort} />
                <SortHead col="sentAt"   label="Sent Date"   sort={sort} onSort={toggleSort} />
                <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {slice.length === 0 && (
                <tr><td colSpan={10} className="px-6 py-12 text-center text-[13px] text-muted-foreground">No sent messages found.</td></tr>
              )}
              {slice.map((msg) => (
                <tr key={msg.id} className="group hover:bg-muted/30 transition-colors cursor-pointer"
                  onClick={() => navigate(`/messages/${msg.id}`)}>
                  <td className="px-4 py-3.5 max-w-[200px]">
                    <p className="truncate text-[13px] font-medium text-foreground">{msg.subject}</p>
                    <p className="text-[11px] text-muted-foreground">{msg.messageId}</p>
                  </td>
                  <td className="px-4 py-3.5 text-[12px] text-foreground">{msg.recipientType}</td>
                  <td className="px-4 py-3.5 text-[13px] font-semibold text-foreground tabular-nums">{msg.stats.totalRecipients}</td>
                  <td className="px-4 py-3.5 text-[13px] text-emerald-600 tabular-nums font-medium">{msg.stats.delivered}</td>
                  <td className="px-4 py-3.5 text-[13px] text-blue-600 tabular-nums font-medium">{msg.stats.read}</td>
                  <td className="px-4 py-3.5 text-[13px] text-amber-600 tabular-nums font-medium">{msg.stats.unread}</td>
                  <td className="px-4 py-3.5"><MessagePriorityBadge priority={msg.priority} /></td>
                  <td className="px-4 py-3.5"><MessageStatusBadge status={msg.status} /></td>
                  <td className="px-4 py-3.5 whitespace-nowrap text-[12px] text-muted-foreground">{msg.sentAt ?? msg.scheduledAt ?? msg.updatedAt}</td>
                  <td className="px-4 py-3.5" onClick={(e) => e.stopPropagation()}>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button title="View" onClick={() => navigate(`/messages/${msg.id}`)}
                        className="flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
                        <Eye className="h-3.5 w-3.5" />
                      </button>
                      <button title="Delete"
                        className="flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-rose-500 transition-colors">
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {pages > 1 && (
          <div className="flex items-center justify-between border-t border-border px-4 py-3">
            <p className="text-[12px] text-muted-foreground">{(safePg-1)*PAGE_SIZE+1}–{Math.min(safePg*PAGE_SIZE,total)} of {total}</p>
            <div className="flex gap-1">
              <Button variant="outline" size="sm" className="h-7 w-7 p-0 text-xs" disabled={safePg===1} onClick={()=>setPage(safePg-1)}>‹</Button>
              {Array.from({length:pages},(_,i)=>i+1).map(p=>(
                <Button key={p} variant={p===safePg?"default":"outline"} size="sm" className="h-7 w-7 p-0 text-xs" onClick={()=>setPage(p)}>{p}</Button>
              ))}
              <Button variant="outline" size="sm" className="h-7 w-7 p-0 text-xs" disabled={safePg===pages} onClick={()=>setPage(safePg+1)}>›</Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
