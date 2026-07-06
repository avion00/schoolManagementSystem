import { useState, useMemo, useCallback } from "react";
import { List } from "lucide-react";
import { MessageSummaryCards } from "@/components/messages/MessageSummaryCards";
import { MessageToolbar, EMPTY_MSG_FILTERS } from "@/components/messages/MessageToolbar";
import { MessageTable } from "@/components/messages/MessageTable";
import { MESSAGES } from "@/data/messagesData";
import type { MessageFilters } from "@/components/messages/MessageToolbar";

function applyFilters(filters: MessageFilters) {
  return MESSAGES.filter((m) => {
    if (filters.search) {
      const q = filters.search.toLowerCase();
      if (
        !m.subject.toLowerCase().includes(q) &&
        !m.sender.toLowerCase().includes(q) &&
        !m.type.toLowerCase().includes(q) &&
        !m.messageId.toLowerCase().includes(q)
      ) return false;
    }
    if (filters.type     && m.type     !== filters.type)     return false;
    if (filters.priority && m.priority !== filters.priority) return false;
    if (filters.status   && m.status   !== filters.status)   return false;
    return true;
  });
}

export function MessagesPage() {
  const [filters, setFilters] = useState<MessageFilters>(EMPTY_MSG_FILTERS);

  const onChange = useCallback((f: MessageFilters) => setFilters(f), []);
  const onClear  = useCallback(() => setFilters(EMPTY_MSG_FILTERS), []);

  const filtered = useMemo(() => applyFilters(filters), [filters]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Messages</h1>
        <p className="mt-0.5 text-[13px] text-muted-foreground">
          Internal communication hub — send, manage, and track all school messages
        </p>
      </div>

      <MessageSummaryCards />

      <MessageToolbar
        filters={filters} onChange={onChange} onClear={onClear}
        total={MESSAGES.length} filtered={filtered.length}
      />

      <div className="flex items-center gap-2">
        <List className="h-4 w-4 text-muted-foreground" />
        <p className="text-[12px] text-muted-foreground">
          {filtered.length} message{filtered.length !== 1 ? "s" : ""}
        </p>
      </div>

      <MessageTable messages={filtered} />
    </div>
  );
}
