import { useNavigate } from "react-router-dom";

import { PremiumBadge, type PremiumBadgeTone } from "@/components/ui/PremiumBadge";
import { PremiumCard } from "@/components/ui/PremiumCard";
import { homeworkAssignments } from "@/data/studentDashboardData";

const STATUS_TONE: Record<string, PremiumBadgeTone> = {
  "To Do": "info", Submitted: "purple", Graded: "success", Missing: "danger",
};

export function StudentHomeworkPanel() {
  const navigate = useNavigate();
  const total = homeworkAssignments.length;
  const done = homeworkAssignments.filter((h) => h.status === "Submitted" || h.status === "Graded").length;
  const pct = total ? Math.round((done / total) * 100) : 0;
  const pending = homeworkAssignments.filter((h) => h.status === "To Do" || h.status === "Missing").slice(0, 4);

  return (
    <PremiumCard className="p-4">
      <div className="mb-3 flex items-center justify-between">
        <p className="text-[13px] font-semibold text-foreground">Homework Progress</p>
        <button type="button" onClick={() => navigate("/student/assignments")} className="text-[11.5px] font-medium text-primary hover:underline">
          View all
        </button>
      </div>

      <div className="mb-1 flex items-center justify-between text-[12px]">
        <span className="text-muted-foreground">Completed</span>
        <span className="font-medium text-foreground">{done}/{total} ({pct}%)</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-muted/60">
        <div className="h-full rounded-full bg-primary transition-all duration-500" style={{ width: `${pct}%` }} />
      </div>

      <div className="mt-3 space-y-1.5 border-t border-border/60 pt-3">
        {pending.map((h) => (
          <div key={h.id} className="flex items-center justify-between text-[12.5px]">
            <span className="truncate text-foreground">{h.title}</span>
            <PremiumBadge label={h.status} tone={STATUS_TONE[h.status]} />
          </div>
        ))}
        {pending.length === 0 && <p className="text-[12px] text-muted-foreground">Nothing pending — great job!</p>}
      </div>
    </PremiumCard>
  );
}
