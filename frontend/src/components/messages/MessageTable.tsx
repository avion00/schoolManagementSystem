import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Star, Eye, Reply, Archive, Trash2, ChevronUp, ChevronDown, ChevronsUpDown } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MessageStatusBadge } from "@/components/messages/MessageStatusBadge";
import { MessagePriorityBadge } from "@/components/messages/MessagePriorityBadge";
import { cn } from "@/lib/utils";
import type { Message } from "@/data/messagesData";

type SortKey = "subject" | "sender" | "priority" | "status" | "sentAt" | "recipientType";
type SortDir = "asc" | "desc";

const PAGE_SIZE = 12;

interface Props {
  messages: Message[];
}

function SortHead({
  col, label, sort, onSort,
}: { col: SortKey; label: string; sort: [SortKey, SortDir]; onSort: (c: SortKey) => void }) {
  const [active, dir] = sort;
  const Icon = active !== col ? ChevronsUpDown : dir === "asc" ? ChevronUp : ChevronDown;
  return (
    <th
      className="whitespace-nowrap px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground cursor-pointer select-none hover:text-foreground transition-colors"
      onClick={() => onSort(col)}
    >
      <span className="flex items-center gap-1">
        {label}
        <Icon className={cn("h-3.5 w-3.5", active === col ? "text-primary" : "opacity-50")} />
      </span>
    </th>
  );
}

export function MessageTable({ messages }: Props) {
  const navigate   = useNavigate();
  const [page, setPage]       = useState(1);
  const [sort, setSort]       = useState<[SortKey, SortDir]>(["sentAt", "desc"]);
  const [selected, setSelected] = useState<Set<number>>(new Set());

  function toggleSort(col: SortKey) {
    setSort(([c, d]) => col === c ? [c, d === "asc" ? "desc" : "asc"] : [col, "desc"]);
    setPage(1);
  }

  const sorted = [...messages].sort((a, b) => {
    const [col, dir] = sort;
    const av = a[col] ?? "";
    const bv = b[col] ?? "";
    return dir === "asc"
      ? String(av).localeCompare(String(bv))
      : String(bv).localeCompare(String(av));
  });

  const total  = sorted.length;
  const pages  = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const safePg = Math.min(page, pages);
  const slice  = sorted.slice((safePg - 1) * PAGE_SIZE, safePg * PAGE_SIZE);

  function toggleAll() {
    if (selected.size === slice.length) setSelected(new Set());
    else setSelected(new Set(slice.map((m) => m.id)));
  }
  function toggleOne(id: number) {
    setSelected((s) => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n; });
  }

  return (
    <Card className="overflow-hidden rounded-2xl shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="border-b border-border bg-muted/30">
            <tr>
              <th className="w-10 px-4 py-3">
                <input type="checkbox" checked={selected.size === slice.length && slice.length > 0}
                  onChange={toggleAll} className="h-3.5 w-3.5 rounded accent-primary cursor-pointer" />
              </th>
              <th className="w-8 px-2 py-3" />
              <SortHead col="subject"       label="Subject"      sort={sort} onSort={toggleSort} />
              <SortHead col="sender"        label="Sender"       sort={sort} onSort={toggleSort} />
              <SortHead col="recipientType" label="Recipients"   sort={sort} onSort={toggleSort} />
              <SortHead col="priority"      label="Priority"     sort={sort} onSort={toggleSort} />
              <SortHead col="status"        label="Status"       sort={sort} onSort={toggleSort} />
              <SortHead col="sentAt"        label="Date"         sort={sort} onSort={toggleSort} />
              <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {slice.length === 0 && (
              <tr>
                <td colSpan={9} className="px-6 py-12 text-center text-[13px] text-muted-foreground">
                  No messages found.
                </td>
              </tr>
            )}
            {slice.map((msg) => {
              const isUnread = msg.status === "unread";
              return (
                <tr key={msg.id}
                  className={cn(
                    "group transition-colors hover:bg-muted/30 cursor-pointer",
                    isUnread && "bg-blue-50/30 dark:bg-blue-950/10",
                  )}
                  onClick={() => navigate(`/messages/${msg.id}`)}
                >
                  <td className="px-4 py-3.5" onClick={(e) => e.stopPropagation()}>
                    <input type="checkbox" checked={selected.has(msg.id)} onChange={() => toggleOne(msg.id)}
                      className="h-3.5 w-3.5 rounded accent-primary cursor-pointer" />
                  </td>
                  <td className="px-2 py-3.5" onClick={(e) => e.stopPropagation()}>
                    <button className={cn("transition-colors", msg.isStarred ? "text-yellow-500" : "text-muted-foreground/30 hover:text-yellow-400")}>
                      <Star className="h-4 w-4" fill={msg.isStarred ? "currentColor" : "none"} />
                    </button>
                  </td>
                  <td className="px-4 py-3.5 max-w-[220px]">
                    <div className="flex items-center gap-2">
                      {isUnread && <span className="h-2 w-2 shrink-0 rounded-full bg-blue-500" />}
                      <span className={cn("truncate text-[13px]", isUnread ? "font-bold text-foreground" : "font-medium text-foreground/80")}>
                        {msg.subject}
                      </span>
                    </div>
                    <p className="mt-0.5 text-[11px] text-muted-foreground">{msg.messageId}</p>
                  </td>
                  <td className="px-4 py-3.5">
                    <p className="text-[13px] text-foreground">{msg.sender}</p>
                    <p className="text-[11px] text-muted-foreground">{msg.senderRole}</p>
                  </td>
                  <td className="px-4 py-3.5">
                    <p className="text-[12px] text-foreground">{msg.recipientType}</p>
                    <p className="text-[11px] text-muted-foreground line-clamp-1">{msg.recipients.slice(0,2).join(", ")}{msg.recipients.length > 2 ? "…" : ""}</p>
                  </td>
                  <td className="px-4 py-3.5">
                    <MessagePriorityBadge priority={msg.priority} />
                  </td>
                  <td className="px-4 py-3.5">
                    <MessageStatusBadge status={msg.status} />
                  </td>
                  <td className="px-4 py-3.5 whitespace-nowrap text-[12px] text-muted-foreground">
                    {msg.sentAt ?? msg.updatedAt}
                  </td>
                  <td className="px-4 py-3.5" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      {[
                        { Icon: Eye,     title: "View",    action: () => navigate(`/messages/${msg.id}`) },
                        { Icon: Reply,   title: "Reply",   action: () => navigate("/messages/compose") },
                        { Icon: Archive, title: "Archive", action: () => {} },
                        { Icon: Trash2,  title: "Delete",  action: () => {} },
                      ].map(({ Icon, title, action }) => (
                        <button key={title} title={title} onClick={action}
                          className="flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
                          <Icon className="h-3.5 w-3.5" />
                        </button>
                      ))}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pages > 1 && (
        <div className="flex items-center justify-between border-t border-border px-4 py-3">
          <p className="text-[12px] text-muted-foreground">
            {(safePg - 1) * PAGE_SIZE + 1}–{Math.min(safePg * PAGE_SIZE, total)} of {total}
          </p>
          <div className="flex gap-1">
            <Button variant="outline" size="sm" className="h-7 w-7 p-0 text-xs"
              disabled={safePg === 1} onClick={() => setPage(safePg - 1)}>‹</Button>
            {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
              <Button key={p} variant={p === safePg ? "default" : "outline"}
                size="sm" className="h-7 w-7 p-0 text-xs" onClick={() => setPage(p)}>{p}</Button>
            ))}
            <Button variant="outline" size="sm" className="h-7 w-7 p-0 text-xs"
              disabled={safePg === pages} onClick={() => setPage(safePg + 1)}>›</Button>
          </div>
        </div>
      )}
    </Card>
  );
}
