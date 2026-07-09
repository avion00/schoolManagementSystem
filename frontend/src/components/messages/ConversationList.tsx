import { useMemo, useState } from "react";
import { SquarePen } from "lucide-react";

import { ConversationListItem } from "@/components/messages/ConversationListItem";
import { SlidingTabs } from "@/components/motion";
import { Button } from "@/components/ui/button";
import { CONVERSATION_FILTER_TABS, chatUserById, type ChatRole, type Conversation, type ConversationFilterTab } from "@/data/messagesData";
import { cn } from "@/lib/utils";

function matchesRoleTab(conv: Conversation, tab: ConversationFilterTab, currentUserId: string): boolean {
  const targetRole: Record<string, ChatRole> = { Parents: "Parent", Teachers: "Teacher", Students: "Student", Staff: "Staff" };
  const role = targetRole[tab];
  if (!role) return true;
  return conv.participantIds.some((id) => id !== currentUserId && chatUserById(id)?.role === role);
}

export function ConversationList({
  conversations,
  currentUserId,
  activeConversationId,
  onSelect,
  onNewChat,
}: {
  conversations: Conversation[];
  currentUserId: string;
  activeConversationId?: string;
  onSelect: (id: string) => void;
  onNewChat: () => void;
}) {
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState<ConversationFilterTab>("All");

  const filtered = useMemo(() => {
    let rows = conversations;
    if (tab === "Archived") {
      rows = rows.filter((c) => c.archived);
    } else {
      rows = rows.filter((c) => !c.archived);
      if (tab === "Unread") rows = rows.filter((c) => c.unreadCount > 0);
      else if (tab === "Groups") rows = rows.filter((c) => c.type !== "direct" && c.type !== "support_request");
      else if (tab !== "All") rows = rows.filter((c) => matchesRoleTab(c, tab, currentUserId));
    }
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      rows = rows.filter((c) => c.title.toLowerCase().includes(q) || c.lastMessage.toLowerCase().includes(q));
    }
    return [...rows].sort((a, b) => {
      if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
      return new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime();
    });
  }, [conversations, tab, search, currentUserId]);

  return (
    <div className="flex h-full flex-col">
      <div className="shrink-0 space-y-3 border-b border-border/60 p-3.5">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-[15px] font-semibold text-foreground">Chats</h2>
          <Button size="icon" className="h-8 w-8 shrink-0 rounded-full" onClick={onNewChat} aria-label="New chat">
            <SquarePen className="h-4 w-4" />
          </Button>
        </div>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search conversations..."
          className="h-9 w-full rounded-xl border border-input bg-background px-3 text-[13px] text-foreground placeholder:text-muted-foreground/70 focus:outline-none focus:ring-1 focus:ring-ring"
        />
        <div className="overflow-x-auto">
          <SlidingTabs
            value={tab}
            onValueChange={(v) => setTab(v as ConversationFilterTab)}
            options={CONVERSATION_FILTER_TABS.map((t) => ({ value: t, label: t }))}
            className="w-max"
          />
        </div>
      </div>

      <div className={cn("flex-1 space-y-0.5 overflow-y-auto p-2")}>
        {filtered.length === 0 ? (
          <p className="py-10 text-center text-[12.5px] text-muted-foreground">No conversations found.</p>
        ) : (
          filtered.map((c) => (
            <ConversationListItem
              key={c.id}
              conversation={c}
              currentUserId={currentUserId}
              active={c.id === activeConversationId}
              onClick={() => onSelect(c.id)}
            />
          ))
        )}
      </div>
    </div>
  );
}
