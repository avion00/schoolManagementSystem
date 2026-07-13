import { Mail } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { PremiumBadge } from "@/components/ui/PremiumBadge";
import { PremiumCard } from "@/components/ui/PremiumCard";
import { teacherMessages } from "@/data/teacherDashboardData";

export function TeacherMessagesPanel() {
  const navigate = useNavigate();
  const unreadCount = teacherMessages.filter((m) => m.unread).length;

  return (
    <PremiumCard className="p-5">
      <div className="mb-4 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Mail className="h-4 w-4 text-muted-foreground" />
          <h2 className="text-[13.5px] font-semibold text-foreground">Messages</h2>
          {unreadCount > 0 && <PremiumBadge label={`${unreadCount} unread`} tone="info" />}
        </div>
        <Button size="sm" variant="ghost" className="h-8 text-[12px] text-muted-foreground" onClick={() => navigate("/teacher/messages")}>
          View all
        </Button>
      </div>

      <div className="space-y-1">
        {teacherMessages.slice(0, 5).map((m) => (
          <button
            key={m.id}
            type="button"
            onClick={() => navigate("/teacher/messages")}
            className="flex w-full items-start gap-3 rounded-xl p-2.5 text-left transition-colors hover:bg-accent/50"
          >
            <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${m.unread ? "bg-primary" : "bg-transparent"}`} />
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-2">
                <p className="truncate text-[12.5px] font-medium text-foreground">{m.from}</p>
                <span className="shrink-0 text-[10.5px] text-muted-foreground">{m.time}</span>
              </div>
              <p className="truncate text-[11.5px] text-muted-foreground">{m.context}</p>
              <p className="truncate text-[12px] text-foreground/80">{m.preview}</p>
            </div>
          </button>
        ))}
      </div>
    </PremiumCard>
  );
}
