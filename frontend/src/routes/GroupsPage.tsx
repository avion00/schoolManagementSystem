import { useState } from "react";
import { Crown, Plus, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { NewChatModal } from "@/components/messages/NewChatModal";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useConversations } from "@/hooks/useConversations";
import { chatUserById, type Conversation } from "@/data/messagesData";
import { canCreateGroup } from "@/data/messagePermissions";
import { useAuth } from "@/lib/auth";
import { resolveCurrentChatUser } from "@/lib/messagesService";

const TYPE_LABEL: Record<Conversation["type"], string> = {
  direct: "Direct", group: "Group", class_group: "Class group", staff_group: "Staff group",
  parent_teacher: "Parent-teacher", admin_broadcast: "Broadcast", support_request: "Support request",
};

export function GroupsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { conversations } = useConversations();
  const [modalOpen, setModalOpen] = useState(false);

  if (!user) return null;
  const { id: currentUserId, role } = resolveCurrentChatUser(user);
  const groups = conversations.filter((c) => c.type !== "direct" && c.type !== "support_request" && c.type !== "admin_broadcast");

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-[13px] text-muted-foreground">{groups.length} group{groups.length !== 1 ? "s" : ""} you're part of or oversee</p>
        {canCreateGroup(role) && (
          <Button size="sm" className="h-8 gap-1.5 text-[12px]" onClick={() => setModalOpen(true)}>
            <Plus className="h-3.5 w-3.5" /> Create group
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {groups.map((g) => (
          <Card key={g.id} className="rounded-2xl border-border/60 shadow-sm">
            <CardContent className="flex flex-col gap-3 p-4">
              <div className="flex items-start justify-between gap-2">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-100 text-violet-700 dark:bg-violet-500/15 dark:text-violet-300">
                  <Users className="h-5 w-5" />
                </span>
                <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">{TYPE_LABEL[g.type]}</span>
              </div>
              <div>
                <p className="text-[14px] font-semibold text-foreground">{g.title}</p>
                <p className="mt-0.5 text-[12px] text-muted-foreground">{g.participantIds.length} members</p>
              </div>
              <div className="flex flex-wrap gap-1">
                {g.adminIds.slice(0, 3).map((id) => (
                  <span key={id} className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[10.5px] font-medium text-amber-700 dark:bg-amber-500/10 dark:text-amber-300">
                    <Crown className="h-2.5 w-2.5" /> {chatUserById(id)?.name ?? id}
                  </span>
                ))}
              </div>
              <Button variant="outline" size="sm" className="h-8 w-full text-[12px]" onClick={() => navigate(`/messages/chats/${g.id}`)}>
                Open chat
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <NewChatModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        currentUserId={currentUserId}
        currentUserRole={role}
        onCreated={(id) => navigate(`/messages/chats/${id}`)}
      />
    </div>
  );
}
