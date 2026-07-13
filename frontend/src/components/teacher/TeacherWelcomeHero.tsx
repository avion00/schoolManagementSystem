import { PremiumBadge } from "@/components/ui/PremiumBadge";
import { TeacherActionBar } from "@/components/teacher/TeacherActionBar";
import { assignedClasses, teacherProfile } from "@/data/teacherDashboardData";
import { useAuth } from "@/lib/auth";

const TODAY = new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" });

export function TeacherWelcomeHero() {
  const { user } = useAuth();
  const name = user?.full_name || teacherProfile.name;
  const firstName = name.split(" ")[0];

  return (
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div>
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="text-lg font-semibold tracking-tight text-foreground">Welcome back, {firstName}</h1>
          <PremiumBadge label="Teacher" tone="purple" />
        </div>
        <p className="mt-0.5 text-sm text-muted-foreground">
          {TODAY} · {teacherProfile.department} · {teacherProfile.employeeId} · {assignedClasses.length} assigned classes
        </p>
      </div>
      <TeacherActionBar compact />
    </div>
  );
}
