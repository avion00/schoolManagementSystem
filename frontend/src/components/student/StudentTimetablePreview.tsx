import { useNavigate } from "react-router-dom";

import { PremiumCard } from "@/components/ui/PremiumCard";
import { todaySchedule } from "@/data/studentDashboardData";
import { cn } from "@/lib/utils";

const STATUS_STYLE: Record<string, string> = {
  Ongoing: "border-primary/40 bg-primary/5",
  Completed: "opacity-60",
  Upcoming: "",
};

export function StudentTimetablePreview() {
  const navigate = useNavigate();
  const periods = todaySchedule.filter((p) => !p.isBreak);

  return (
    <PremiumCard className="p-4">
      <div className="mb-3 flex items-center justify-between">
        <p className="text-[13px] font-semibold text-foreground">Today's Timetable</p>
        <button type="button" onClick={() => navigate("/student/timetable")} className="text-[11.5px] font-medium text-primary hover:underline">
          View full timetable
        </button>
      </div>
      <div className="space-y-2">
        {periods.map((p) => (
          <div key={p.id} className={cn("flex items-center justify-between gap-2 rounded-xl border border-border/60 px-3 py-2", STATUS_STYLE[p.status])}>
            <div className="min-w-0">
              <p className="truncate text-[12.5px] font-medium text-foreground">{p.subject}</p>
              <p className="truncate text-[11px] text-muted-foreground">{p.teacher} · {p.room}</p>
            </div>
            <div className="shrink-0 text-right">
              <p className="text-[11px] text-muted-foreground">{p.time}</p>
              {p.status === "Ongoing" && <p className="text-[10.5px] font-medium text-primary">Now</p>}
            </div>
          </div>
        ))}
      </div>
    </PremiumCard>
  );
}
