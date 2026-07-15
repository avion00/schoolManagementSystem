import { useNavigate } from "react-router-dom";

import { PremiumCard } from "@/components/ui/PremiumCard";
import { recentTeacherMessages } from "@/data/studentDashboardData";

export function StudentMessagesPanel() {
  const navigate = useNavigate();

  return (
    <PremiumCard className="p-4">
      <div className="mb-3 flex items-center justify-between">
        <p className="text-[13px] font-semibold text-foreground">Recent Messages</p>
        <button type="button" onClick={() => navigate("/student/messages")} className="text-[11.5px] font-medium text-primary hover:underline">
          Open Messages
        </button>
      </div>
      <div className="space-y-2.5">
        {recentTeacherMessages.map((m) => (
          <button
            key={m.id}
            type="button"
            onClick={() => navigate("/student/messages")}
            className="flex w-full items-start justify-between gap-2 rounded-xl px-1 py-1 text-left hover:bg-accent/40"
          >
            <div className="min-w-0">
              <p className={`truncate text-[12.5px] ${m.unread ? "font-semibold text-foreground" : "font-medium text-foreground/90"}`}>{m.from}</p>
              <p className="truncate text-[11.5px] text-muted-foreground">{m.preview}</p>
            </div>
            <span className="shrink-0 text-[10.5px] text-muted-foreground">{m.time}</span>
          </button>
        ))}
        {recentTeacherMessages.length === 0 && <p className="text-[12px] text-muted-foreground">No recent messages.</p>}
      </div>
    </PremiumCard>
  );
}
