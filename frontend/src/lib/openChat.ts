// Opens (or reuses) a direct chat from anywhere a "Message" button appears.
// If the school's rules need the other person's approval first, a message
// request is sent instead and the user is told so.
import { toast } from "sonner";

import { errorMessage } from "@/api/http";
import { messagesService } from "@/lib/messagesService";

export function openChat(
  params: { otherUserId: string; relatedStudentId?: string; message?: string; [extra: string]: unknown },
  onOpen: (conversationId: string) => void,
) {
  messagesService.findOrCreateDirectConversation({
    otherUserId: params.otherUserId, relatedStudentId: params.relatedStudentId, message: params.message,
  })
    .then((conv) => {
      if (conv) onOpen(conv.id);
      else toast.success("Message request sent. You can chat once they accept.");
    })
    .catch((e) => toast.error(errorMessage(e, "Couldn't open this chat.")));
}
