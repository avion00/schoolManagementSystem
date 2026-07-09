import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { ConversationLayout } from "@/components/messages/ConversationLayout";
import { useAuth } from "@/lib/auth";
import { resolveCurrentChatUser } from "@/lib/messagesService";
import { realtimeService } from "@/lib/realtimeService";

export function MessagesChatsPage({ autoOpenNewChat = false }: { autoOpenNewChat?: boolean }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { conversationId } = useParams();

  useEffect(() => {
    realtimeService.connect();
    return () => realtimeService.disconnect();
  }, []);

  if (!user) return null;
  const { id: currentUserId, role } = resolveCurrentChatUser(user);
  const isSuperAdmin = role === "Super Admin";

  return (
    <ConversationLayout
      currentUserId={currentUserId}
      currentUserRole={role}
      isSuperAdmin={isSuperAdmin}
      activeConversationId={conversationId}
      onSelectConversation={(id) => navigate(`/messages/chats/${id}`)}
      onBack={() => navigate("/messages/chats")}
      autoOpenNewChat={autoOpenNewChat}
    />
  );
}
