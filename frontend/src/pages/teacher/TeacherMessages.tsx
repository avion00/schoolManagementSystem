import { useEffect } from "react";
import { useLocation, useNavigate, useParams, useSearchParams } from "react-router-dom";

import { ConversationLayout } from "@/components/messages/ConversationLayout";
import { useConversations } from "@/hooks/useConversations";
import { canViewAllConversations } from "@/lib/messagePermissions";
import { useAuth } from "@/lib/auth";
import { resolveCurrentChatUser } from "@/lib/messagesService";
import { realtimeService } from "@/lib/realtimeService";

/** Reduced tab set for the teacher's own inbox — no "Teachers" (folded into
 *  "All"/"Groups") or "Archived" (an admin housekeeping concern). */
const TEACHER_TABS = ["All", "Unread", "Parents", "Students", "Groups", "Staff"] as const;

/**
 * Teacher's Messages page — reuses the exact same chat layout/components as
 * Super Admin (ConversationLayout + ConversationList/ChatHeader/MessageThread/
 * MessageComposer/etc.), just with teacher-correct routes and a conversation
 * list scoped to conversations the teacher actually participates in
 * (enforced centrally in ConversationLayout via canViewAllConversations).
 */
export function TeacherMessages() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { conversationId } = useParams();
  const [searchParams] = useSearchParams();
  const queryConversationId = searchParams.get("conversation");
  // Mobile's "back" button intentionally lands on the bare /teacher/messages
  // route to reveal the list panel — mark that navigation so the auto-select
  // effect below doesn't immediately bounce back into a conversation.
  const cameFromBack = Boolean((location.state as { fromBack?: boolean } | null)?.fromBack);

  useEffect(() => {
    realtimeService.connect();
    return () => realtimeService.disconnect();
  }, []);

  const { conversations } = useConversations();

  if (!user) return null;
  const { id: currentUserId, role } = resolveCurrentChatUser(user);
  const myConversations = canViewAllConversations(role)
    ? conversations
    : conversations.filter((c) => c.participantIds.includes(currentUserId));

  // Same ordering ConversationList uses (pinned first, then most recent) so the
  // conversation we auto-select matches the one visually on top of the list.
  const topConversationId = [...myConversations].sort((a, b) => {
    if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
    return new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime();
  })[0]?.id;

  // Normalize both entry points (?conversation=xxx and a bare /teacher/messages
  // visit) onto the canonical /teacher/messages/:conversationId URL, picking
  // the first conversation by default so the center panel is never empty.
  useEffect(() => {
    if (conversationId || cameFromBack) return;
    const target = queryConversationId ?? topConversationId;
    if (target) navigate(`/teacher/messages/${target}`, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversationId, queryConversationId, topConversationId, cameFromBack]);

  return (
    <ConversationLayout
      currentUserId={currentUserId}
      currentUserRole={role}
      isSuperAdmin={role === "Super Admin"}
      activeConversationId={conversationId}
      onSelectConversation={(id) => navigate(`/teacher/messages/${id}`)}
      onBack={() => navigate("/teacher/messages", { state: { fromBack: true } })}
      tabs={TEACHER_TABS}
    />
  );
}
