import { useEffect } from "react";
import { useLocation, useNavigate, useParams, useSearchParams } from "react-router-dom";

import { ConversationLayout } from "@/components/messages/ConversationLayout";
import { canViewAllConversations } from "@/data/messagePermissions";
import { useConversations } from "@/hooks/useConversations";
import { useAuth } from "@/lib/auth";
import { resolveCurrentChatUser } from "@/lib/messagesService";
import { realtimeService } from "@/lib/realtimeService";

/** Reduced tab set for the student's own inbox — no Parents/Staff/Students
 *  tabs since a student can only message teachers/admin/principal and view
 *  their class group. */
const STUDENT_TABS = ["All", "Unread", "Teachers", "Groups"] as const;

/**
 * Student's Messages page — reuses the exact same chat layout/components as
 * Super Admin/Teacher (ConversationLayout + ConversationList/ChatHeader/
 * MessageThread/MessageComposer/etc.), just with student-correct routes and
 * a conversation list scoped to conversations the student actually
 * participates in (enforced centrally in ConversationLayout).
 */
export function StudentMessages() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { conversationId } = useParams();
  const [searchParams] = useSearchParams();
  const queryConversationId = searchParams.get("conversation");
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

  const topConversationId = [...myConversations].sort((a, b) => {
    if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
    return new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime();
  })[0]?.id;

  useEffect(() => {
    if (conversationId || cameFromBack) return;
    const target = queryConversationId ?? topConversationId;
    if (target) navigate(`/student/messages/${target}`, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversationId, queryConversationId, topConversationId, cameFromBack]);

  return (
    <ConversationLayout
      currentUserId={currentUserId}
      currentUserRole={role}
      isSuperAdmin={role === "Super Admin"}
      activeConversationId={conversationId}
      onSelectConversation={(id) => navigate(`/student/messages/${id}`)}
      onBack={() => navigate("/student/messages", { state: { fromBack: true } })}
      tabs={STUDENT_TABS}
    />
  );
}
