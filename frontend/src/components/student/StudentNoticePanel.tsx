import { Pin } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { PremiumCard } from "@/components/ui/PremiumCard";
import { notices } from "@/data/studentDashboardData";

export function StudentNoticePanel() {
  const navigate = useNavigate();
  const preview = [...notices].sort((a, b) => Number(b.pinned) - Number(a.pinned)).slice(0, 4);

  return (
    <PremiumCard className="p-4">
      <div className="mb-3 flex items-center justify-between">
        <p className="text-[13px] font-semibold text-foreground">Recent Notices</p>
        <button type="button" onClick={() => navigate("/student/notices")} className="text-[11.5px] font-medium text-primary hover:underline">
          View all
        </button>
      </div>
      <div className="space-y-2">
        {preview.map((n) => (
          <button
            key={n.id}
            type="button"
            onClick={() => navigate("/student/notices")}
            className="flex w-full items-start gap-2 rounded-xl px-1 py-1 text-left hover:bg-accent/40"
          >
            {n.pinned && <Pin className="mt-0.5 h-3 w-3 shrink-0 text-muted-foreground/60" />}
            <div className="min-w-0 flex-1">
              <p className={`truncate text-[12.5px] ${n.unread ? "font-semibold text-foreground" : "font-medium text-foreground/90"}`}>{n.title}</p>
              <p className="text-[11px] text-muted-foreground">{n.category} · {n.date}</p>
            </div>
            {n.unread && <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />}
          </button>
        ))}
      </div>
    </PremiumCard>
  );
}
