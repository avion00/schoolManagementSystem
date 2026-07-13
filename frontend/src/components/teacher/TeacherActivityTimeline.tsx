import { History } from "lucide-react";

import { TeacherTimeline } from "@/components/teacher/TeacherTimeline";
import { PremiumCard } from "@/components/ui/PremiumCard";
import { accountabilityTimeline } from "@/data/teacherDashboardData";

/** "My Activity" — light accountability, not surveillance: a plain log of what the teacher already did. */
export function TeacherActivityTimeline() {
  return (
    <PremiumCard className="p-5">
      <div className="mb-3 flex items-center gap-2">
        <History className="h-4 w-4 text-muted-foreground" />
        <h2 className="text-[13.5px] font-semibold text-foreground">My Activity</h2>
      </div>
      <TeacherTimeline
        items={accountabilityTimeline.map((e) => ({ id: e.id, title: e.action, detail: e.detail, timestamp: e.timestamp }))}
      />
    </PremiumCard>
  );
}
