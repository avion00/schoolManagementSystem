import { useState, useMemo, useCallback } from "react";
import { MessageToolbar, EMPTY_MSG_FILTERS } from "@/components/messages/MessageToolbar";
import { MessageTable } from "@/components/messages/MessageTable";
import { MESSAGES } from "@/data/messagesData";
import type { MessageFilters } from "@/components/messages/MessageToolbar";

function applyFilters(filters: MessageFilters) {
  return MESSAGES.filter((m) => {
    if (m.status === "draft" || m.status === "scheduled") return false;
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

export function MessageInboxPage() {
  const [filters, setFilters] = useState<MessageFilters>(EMPTY_MSG_FILTERS);
  const onChange  = useCallback((f: MessageFilters) => setFilters(f), []);
  const onClear   = useCallback(() => setFilters(EMPTY_MSG_FILTERS), []);
  const filtered  = useMemo(() => applyFilters(filters), [filters]);
  const inbox     = useMemo(() => MESSAGES.filter((m) => m.status !== "draft" && m.status !== "scheduled"), []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Inbox</h1>
        <p className="mt-0.5 text-[13px] text-muted-foreground">
          All received and sent messages
        </p>
      </div>

      <MessageToolbar
        filters={filters} onChange={onChange} onClear={onClear}
        total={inbox.length} filtered={filtered.length}
      />

      <MessageTable messages={filtered} />
    </div>
  );
}
