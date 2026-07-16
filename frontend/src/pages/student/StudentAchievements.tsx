import { Reveal } from "@/components/motion";
import { StudentAchievementCard } from "@/components/student/StudentAchievementCard";
import { achievements } from "@/data/studentDashboardData";

export function StudentAchievements() {
  return (
    <div className="space-y-4">
      <Reveal>
        <h1 className="text-lg font-semibold tracking-tight text-foreground">Achievements</h1>
        <p className="mt-0.5 text-[13px] text-muted-foreground">{achievements.length} awards and recognitions.</p>
      </Reveal>

      <Reveal delay={60} className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {achievements.map((a) => <StudentAchievementCard key={a.id} achievement={a} />)}
      </Reveal>
    </div>
  );
}
