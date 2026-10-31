/** Messages inside a portal: the shared chat layout, routed under the portal's base path. */
import { useEffect } from "react";
import { useLocation, useNavigate, useParams, useSearchParams } from "react-router-dom";

import { ConversationLayout } from "@/components/messages/ConversationLayout";
import { useConversations } from "@/hooks/useConversations";
import type { ConversationFilterTab } from "@/api/types/messages";
import { useAuth } from "@/lib/auth";
import { resolveCurrentChatUser } from "@/lib/messagesService";

export function PortalMessages({ base, tabs }: { base: string; tabs: readonly ConversationFilterTab[] }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { conversationId } = useParams();
  const [searchParams] = useSearchParams();
  const queryConversationId = searchParams.get("conversation");
  const cameFromBack = Boolean((location.state as { fromBack?: boolean } | null)?.fromBack);
  const { conversations } = useConversations();
  const me = user ? resolveCurrentChatUser(user) : null;
  const mine = me ? conversations.filter((c) => c.participantIds.includes(me.id)) : [];
  const top = [...mine].sort((a, b) => {
    if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
    return new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime();
  })[0]?.id;

  useEffect(() => {
    if (conversationId || cameFromBack) return;
    const target = queryConversationId ?? top;
    if (target) navigate(`${base}/${target}`, { replace: true });
  }, [conversationId, queryConversationId, top, cameFromBack, base, navigate]);

  if (!me) return null;
  return (
    <ConversationLayout
      currentUserId={me.id}
      currentUserRole={me.role}
      isSuperAdmin={false}
      activeConversationId={conversationId}
      onSelectConversation={(id) => navigate(`${base}/${id}`)}
      onBack={() => navigate(base, { state: { fromBack: true } })}
      tabs={tabs}
    />
  );
}
