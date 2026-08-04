import { StudentStatusPill, type StudentPillTone } from "@/components/student/ui/StudentStatusPill";

/** One row in the "Upcoming Subject Tasks" sidebar list — title + a colored due/status chip. */
export function UpcomingTaskItem({
  title,
  chipLabel,
  chipTone,
}: {
  title: string;
  chipLabel: string;
  chipTone: StudentPillTone;
}) {
  return (
    <div className="flex items-center justify-between gap-2 rounded-xl bg-muted/30 p-2.5">
      <p className="min-w-0 truncate text-[12.5px] font-medium text-foreground">{title}</p>
      <StudentStatusPill label={chipLabel} tone={chipTone} className="shrink-0" />
    </div>
  );
}
