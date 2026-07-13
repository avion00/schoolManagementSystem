import { BookOpenCheck } from "lucide-react";

import { PremiumCard } from "@/components/ui/PremiumCard";
import { lessonPlans, subjects } from "@/data/teacherDashboardData";

export function SyllabusProgressCard() {
  const pendingLessons = lessonPlans.filter((l) => l.status !== "Reviewed");
  const upcomingTopics = pendingLessons.slice(0, 3).map((l) => l.topic);

  return (
    <PremiumCard className="p-5">
      <div className="mb-3 flex items-center gap-2">
        <BookOpenCheck className="h-4 w-4 text-muted-foreground" />
        <h2 className="text-[13.5px] font-semibold text-foreground">Teaching Progress</h2>
      </div>

      <div className="space-y-3">
        {subjects.map((subject) => {
          const pct = Math.round((subject.completedTopics / subject.totalTopics) * 100);
          return (
            <div key={subject.id}>
              <div className="mb-1 flex items-center justify-between text-[12.5px]">
                <span className="font-medium text-foreground">{subject.name}</span>
                <span className="text-muted-foreground">{subject.completedTopics}/{subject.totalTopics} topics · {pct}%</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-muted/60">
                <div className="h-full rounded-full bg-primary transition-all duration-500" style={{ width: `${pct}%` }} />
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 border-t border-border/60 pt-3 text-[12px]">
        <div>
          <p className="text-muted-foreground">Lesson plans completed</p>
          <p className="font-semibold text-foreground">{lessonPlans.filter((l) => l.status === "Reviewed").length} / {lessonPlans.length}</p>
        </div>
        <div>
          <p className="text-muted-foreground">Upcoming topics</p>
          <p className="truncate font-medium text-foreground">{upcomingTopics.join(", ") || "None scheduled"}</p>
        </div>
      </div>
    </PremiumCard>
  );
}
