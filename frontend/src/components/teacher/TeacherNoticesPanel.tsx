import { Megaphone, Pin } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { PremiumBadge, type PremiumBadgeTone } from "@/components/ui/PremiumBadge";
import { PremiumCard } from "@/components/ui/PremiumCard";
import { teacherNotices, type TeacherNotice } from "@/data/teacherDashboardData";

const CATEGORY_TONE: Record<TeacherNotice["category"], PremiumBadgeTone> = {
  School: "info",
  Exam: "warning",
  Staff: "purple",
  Class: "success",
};

export function TeacherNoticesPanel() {
  const navigate = useNavigate();

  return (
    <PremiumCard className="p-5">
      <div className="mb-4 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Megaphone className="h-4 w-4 text-muted-foreground" />
          <h2 className="text-[13.5px] font-semibold text-foreground">Notices</h2>
        </div>
        <Button size="sm" variant="ghost" className="h-8 text-[12px] text-muted-foreground" onClick={() => navigate("/teacher/notices")}>
          View all
        </Button>
      </div>

      <div className="space-y-2">
        {teacherNotices.slice(0, 4).map((n) => (
          <div key={n.id} className="flex items-start gap-3 rounded-xl border border-border/50 p-2.5">
            {n.pinned && <Pin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />}
            <div className="min-w-0 flex-1">
              <p className="truncate text-[12.5px] font-medium text-foreground">{n.title}</p>
              <p className="text-[11px] text-muted-foreground">{n.date}</p>
            </div>
            <PremiumBadge label={n.category} tone={CATEGORY_TONE[n.category]} />
          </div>
        ))}
      </div>
    </PremiumCard>
  );
}
