import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { RecipientPicker } from "@/components/messages/RecipientPicker";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { chatUserById, type ChatRole, type ConversationType } from "@/data/messagesData";
import { canCreateGroup, canSendBroadcast } from "@/data/messagePermissions";
import { messagesService } from "@/lib/messagesService";
import { realtimeService } from "@/lib/realtimeService";
import { cn } from "@/lib/utils";

const TYPE_OPTIONS: { value: ConversationType; label: string }[] = [
  { value: "direct", label: "Direct Message" },
  { value: "group", label: "Group Chat" },
  { value: "class_group", label: "Class Group" },
  { value: "parent_teacher", label: "Parent-Teacher Chat" },
  { value: "staff_group", label: "Staff Group" },
  { value: "admin_broadcast", label: "Broadcast" },
];

export function NewChatModal({
  open,
  onOpenChange,
  currentUserId,
  currentUserRole,
  onCreated,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentUserId: string;
  currentUserRole: ChatRole;
  onCreated: (conversationId: string) => void;
}) {
  const navigate = useNavigate();
  const [type, setType] = useState<ConversationType>("direct");
  const [selected, setSelected] = useState<string[]>([]);
  const [title, setTitle] = useState("");
  const [firstMessage, setFirstMessage] = useState("");

  const isGroupType = type !== "direct" && type !== "admin_broadcast";
  const availableTypes = TYPE_OPTIONS.filter((t) => {
    if (t.value === "admin_broadcast") return canSendBroadcast(currentUserRole);
    if (t.value !== "direct") return canCreateGroup(currentUserRole);
    return true;
  });

  function reset() {
    setType("direct");
    setSelected([]);
    setTitle("");
    setFirstMessage("");
  }

  function handleCreate() {
    if (type === "admin_broadcast") {
      onOpenChange(false);
      reset();
      navigate("/messages/broadcasts");
      return;
    }
    if (selected.length === 0) return;
    if (!isGroupType) {
      const conv = messagesService.createConversation({
        type: "direct",
        title: chatUserById(selected[0])?.name ?? "Direct Message",
        participantIds: [currentUserId, selected[0]],
        creatorId: currentUserId,
        firstMessage: firstMessage.trim() || undefined,
      });
      realtimeService.refreshConversations();
      onOpenChange(false);
      reset();
      onCreated(conv.id);
      return;
    }
    const conv = messagesService.createConversation({
      type,
      title: title.trim() || "New group",
      participantIds: [currentUserId, ...selected],
      creatorId: currentUserId,
      firstMessage: firstMessage.trim() || undefined,
    });
    realtimeService.refreshConversations();
    onOpenChange(false);
    reset();
    onCreated(conv.id);
  }

  return (
    <Dialog open={open} onOpenChange={(o) => { onOpenChange(o); if (!o) reset(); }}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>New conversation</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <p className="mb-1.5 text-[12px] font-medium text-foreground">Conversation type</p>
            <div className="flex flex-wrap gap-1.5">
              {availableTypes.map((t) => (
                <button
                  key={t.value}
                  onClick={() => setType(t.value)}
                  className={cn(
                    "rounded-full border px-3 py-1.5 text-[11.5px] font-medium transition-colors",
                    type === t.value ? "border-primary bg-primary/10 text-primary" : "border-border/60 text-muted-foreground hover:bg-muted",
                  )}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {type !== "admin_broadcast" && (
            <>
              {isGroupType && (
                <div>
                  <label className="mb-1.5 block text-[12px] font-medium text-foreground">Group name</label>
                  <input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Grade 8 Section A"
                    className="h-9 w-full rounded-xl border border-input bg-background px-3 text-[13px] text-foreground placeholder:text-muted-foreground/70 focus:outline-none focus:ring-1 focus:ring-ring"
                  />
                </div>
              )}

              <div>
                <p className="mb-1.5 text-[12px] font-medium text-foreground">Recipients</p>
                <RecipientPicker
                  currentUserId={currentUserId}
                  currentUserRole={currentUserRole}
                  selected={selected}
                  onChange={setSelected}
                  multiple={isGroupType}
                />
              </div>

              <div>
                <label className="mb-1.5 block text-[12px] font-medium text-foreground">First message (optional)</label>
                <textarea
                  value={firstMessage}
                  onChange={(e) => setFirstMessage(e.target.value)}
                  rows={2}
                  placeholder="Say hello..."
                  className="w-full resize-none rounded-xl border border-input bg-background px-3 py-2 text-[13px] text-foreground placeholder:text-muted-foreground/70 focus:outline-none focus:ring-1 focus:ring-ring"
                />
              </div>
            </>
          )}

          {type === "admin_broadcast" && (
            <p className="rounded-xl bg-muted/50 px-3 py-2.5 text-[12.5px] text-muted-foreground">
              Broadcasts are one-to-many announcements with delivery/read tracking. You'll be taken to the Broadcasts composer.
            </p>
          )}

          <Button className="w-full" onClick={handleCreate} disabled={type !== "admin_broadcast" && (selected.length === 0 || (isGroupType && !title.trim()))}>
            {type === "admin_broadcast" ? "Continue to Broadcasts" : "Create conversation"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
