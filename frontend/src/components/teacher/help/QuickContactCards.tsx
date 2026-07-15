import { MessageSquare, PlusCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { PremiumCard } from "@/components/ui/PremiumCard";
import { quickContacts, type SendToOption } from "@/data/teacherHelpData";
import { messagesService } from "@/lib/messagesService";
import { realtimeService } from "@/lib/realtimeService";

export function QuickContactCards({
  currentUserId,
  onCreateRequest,
}: {
  currentUserId: string;
  onCreateRequest: (sendTo: SendToOption) => void;
}) {
  const navigate = useNavigate();

  function message(contactId: string) {
    const contact = quickContacts.find((c) => c.id === contactId);
    if (!contact) return;
    const conv = messagesService.findOrCreateDirectConversation({
      currentUserId,
      otherUserId: contact.chatUserId,
      otherUserName: contact.name,
      otherUserRole: "Staff",
    });
    realtimeService.refreshConversations();
    navigate(`/teacher/messages/${conv.id}`);
  }

  return (
    <div className="grid gap-2.5 sm:grid-cols-2">
      {quickContacts.map((c) => (
        <PremiumCard key={c.id} className="p-3.5">
          <p className="truncate text-[12.5px] font-medium text-foreground">{c.name}</p>
          <p className="mt-0.5 truncate text-[11px] text-muted-foreground">{c.department} · {c.availability}</p>
          <div className="mt-2.5 flex gap-1.5">
            <Button size="sm" variant="outline" className="h-7 flex-1 gap-1 px-2 text-[11.5px]" onClick={() => message(c.id)}>
              <MessageSquare className="h-3.5 w-3.5" /> Message
            </Button>
            <Button size="sm" variant="ghost" className="h-7 flex-1 gap-1 px-2 text-[11.5px] text-muted-foreground" onClick={() => onCreateRequest(c.sendTo)}>
              <PlusCircle className="h-3.5 w-3.5" /> Request
            </Button>
          </div>
        </PremiumCard>
      ))}
    </div>
  );
}
