import { useEffect, useState } from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { MessageCircle, X } from "lucide-react";

import { ChatHeader } from "@/components/messages/ChatHeader";
import { ConversationDetailsPanel } from "@/components/messages/ConversationDetailsPanel";
import { ConversationList } from "@/components/messages/ConversationList";
import { MessageComposer } from "@/components/messages/MessageComposer";
import { MessageThread } from "@/components/messages/MessageThread";
import { NewChatModal } from "@/components/messages/NewChatModal";
import { useConversation } from "@/hooks/useConversation";
import { useConversations } from "@/hooks/useConversations";
import { chatUserById, type ChatMessage, type ChatRole } from "@/data/messagesData";
import { needsApproval } from "@/data/messagePermissions";
import { messagesService } from "@/lib/messagesService";
import { realtimeService } from "@/lib/realtimeService";
import { cn } from "@/lib/utils";

function chatUserLabel(id: string) {
  return chatUserById(id)?.name ?? "Someone";
}

export function ConversationLayout({
  currentUserId,
  currentUserRole,
  isSuperAdmin,
  activeConversationId,
  onSelectConversation,
  onBack,
  autoOpenNewChat = false,
}: {
  currentUserId: string;
  currentUserRole: ChatRole;
  isSuperAdmin: boolean;
  activeConversationId?: string;
  onSelectConversation: (id: string) => void;
  onBack: () => void;
  autoOpenNewChat?: boolean;
}) {
  const { conversations } = useConversations();
  const { conversation, messages, typingUserIds, send, emitTyping } = useConversation(activeConversationId, currentUserId);
  const [newChatOpen, setNewChatOpen] = useState(autoOpenNewChat);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [replyingTo, setReplyingTo] = useState<ChatMessage | null>(null);

  useEffect(() => {
    if (conversation && isSuperAdmin && !conversation.participantIds.includes(currentUserId)) {
      messagesService.logConversationOpened(conversation.id, currentUserId);
    }
  }, [conversation?.id]);

  useEffect(() => {
    setReplyingTo(null);
    setDetailsOpen(false);
  }, [activeConversationId]);

  const typingLabel = typingUserIds.length > 0 ? `${chatUserLabel(typingUserIds[0])} is typing...` : undefined;

  let composerDisabled = false;
  let composerReason: string | undefined;
  if (conversation?.locked) {
    composerDisabled = true;
    composerReason = "This conversation has been locked by an administrator.";
  } else if (conversation?.permissions?.whoCanSend === "admins" && !conversation.adminIds.includes(currentUserId) && !isSuperAdmin) {
    composerDisabled = true;
    composerReason = "Only group admins can send messages here.";
  } else if (conversation && (conversation.type === "direct" || conversation.type === "support_request")) {
    const otherId = conversation.participantIds.find((id) => id !== currentUserId);
    const otherUser = otherId ? chatUserById(otherId) : undefined;
    if (otherUser && needsApproval(currentUserRole, otherUser.role)) {
      composerDisabled = true;
      composerReason = "Awaiting approval before you can message this user.";
    }
  }

  function handleAction(action: "pin" | "mute" | "archive" | "lock" | "delete" | "export") {
    if (!conversation) return;
    switch (action) {
      case "pin": messagesService.togglePin(conversation.id); break;
      case "mute": messagesService.toggleMute(conversation.id); break;
      case "archive": messagesService.toggleArchive(conversation.id); break;
      case "lock": messagesService.toggleLock(conversation.id, currentUserId); break;
      case "delete": messagesService.deleteConversation(conversation.id); onBack(); break;
      case "export": messagesService.logExport(conversation.id, currentUserId, "json"); break;
    }
    realtimeService.refreshConversations();
  }

  return (
    <div className="flex h-[calc(100vh-9.5rem)] gap-4">
      <aside
        className={cn(
          "w-full shrink-0 flex-col overflow-hidden rounded-2xl border border-border/60 bg-card md:w-[22rem]",
          activeConversationId ? "hidden md:flex" : "flex",
        )}
      >
        <ConversationList
          conversations={conversations}
          currentUserId={currentUserId}
          activeConversationId={activeConversationId}
          onSelect={onSelectConversation}
          onNewChat={() => setNewChatOpen(true)}
        />
      </aside>

      <section
        className={cn(
          "min-w-0 flex-1 flex-col overflow-hidden rounded-2xl border border-border/60 bg-card",
          activeConversationId ? "flex" : "hidden md:flex",
        )}
      >
        {conversation ? (
          <>
            <ChatHeader
              conversation={conversation}
              currentUserId={currentUserId}
              onBack={onBack}
              onOpenDetails={() => setDetailsOpen(true)}
              onSearchInChat={() => setDetailsOpen(true)}
            />
            <MessageThread
              messages={messages}
              currentUserId={currentUserId}
              isGroup={conversation.type !== "direct" && conversation.type !== "support_request"}
              typingLabel={typingLabel}
              onReply={setReplyingTo}
              onPin={(id) => { messagesService.togglePinMessage(id); realtimeService.refreshConversations(); }}
              onDelete={(id) => { messagesService.deleteMessage(id, isSuperAdmin, currentUserId); }}
              onReact={(id, emoji) => messagesService.toggleReaction(id, emoji, currentUserId)}
              onReport={(id) => messagesService.flagMessage(id)}
              canModerate={isSuperAdmin}
            />
            <MessageComposer
              onSend={(body, attachments) => {
                const type = attachments.length > 0 ? (attachments[0].kind === "image" ? "image" : "file") : "text";
                send(body, { type, attachments, replyTo: replyingTo?.id ?? null });
                setReplyingTo(null);
              }}
              onTyping={emitTyping}
              replyingTo={replyingTo ?? undefined}
              replyingToSender={replyingTo ? chatUserById(replyingTo.senderId) : undefined}
              onCancelReply={() => setReplyingTo(null)}
              disabled={composerDisabled}
              disabledReason={composerReason}
            />
          </>
        ) : (
          <div className="flex flex-1 flex-col items-center justify-center gap-2 text-muted-foreground">
            <MessageCircle className="h-10 w-10 text-muted-foreground/40" />
            <p className="text-[13px]">Select a conversation to start chatting</p>
          </div>
        )}
      </section>

      {conversation && (
        <DialogPrimitive.Root open={detailsOpen} onOpenChange={setDetailsOpen}>
          <DialogPrimitive.Portal>
            <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/30 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 lg:bg-transparent" />
            <DialogPrimitive.Content
              className={cn(
                "fixed inset-y-0 right-0 z-50 flex w-full max-w-sm flex-col border-l border-border/60 bg-card shadow-2xl focus:outline-none",
                "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right data-[state=open]:duration-300 data-[state=closed]:duration-200",
              )}
            >
              <div className="flex shrink-0 items-center justify-between border-b border-border/60 px-4 py-3.5">
                <DialogPrimitive.Title className="text-[14px] font-semibold text-foreground">Conversation details</DialogPrimitive.Title>
                <DialogPrimitive.Close className="rounded-lg p-1 text-muted-foreground hover:bg-muted">
                  <X className="h-4 w-4" />
                </DialogPrimitive.Close>
              </div>
              <ConversationDetailsPanel
                conversation={conversation}
                messages={messages}
                currentUserId={currentUserId}
                isSuperAdmin={isSuperAdmin}
                onTogglePin={() => handleAction("pin")}
                onToggleMute={() => handleAction("mute")}
                onToggleArchive={() => handleAction("archive")}
                onToggleLock={() => handleAction("lock")}
                onDeleteConversation={() => handleAction("delete")}
                onExport={() => handleAction("export")}
                onRemoveMember={(userId) => { messagesService.removeMember(conversation.id, userId, currentUserId); realtimeService.refreshConversations(); }}
                onAddMember={(userId) => { messagesService.addMember(conversation.id, userId); realtimeService.refreshConversations(); }}
              />
            </DialogPrimitive.Content>
          </DialogPrimitive.Portal>
        </DialogPrimitive.Root>
      )}

      <NewChatModal
        open={newChatOpen}
        onOpenChange={setNewChatOpen}
        currentUserId={currentUserId}
        currentUserRole={currentUserRole}
        onCreated={onSelectConversation}
      />
    </div>
  );
}
