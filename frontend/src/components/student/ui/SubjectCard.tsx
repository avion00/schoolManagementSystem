import { ClipboardList, FolderOpen, type LucideIcon } from "lucide-react";

import { IconTile, type IconTileTone } from "@/components/student/ui/IconTile";
import { Reveal } from "@/components/motion";
import { SubjectActionMenu } from "@/components/student/ui/SubjectActionMenu";
import { SubjectProgressBar } from "@/components/student/ui/SubjectProgressBar";
import { StudentSecondaryButton } from "@/components/student/ui/StudentSecondaryButton";
import { StudentStatusPill, type StudentPillTone } from "@/components/student/ui/StudentStatusPill";
import { cn } from "@/lib/utils";

export interface SubjectCardData {
  id: string;
  name: string;
  teacher: string;
  weeklyClasses: number;
  latestMarks: number;
  latestFullMarks: number;
  syllabusCompleted: number;
  syllabusTotal: number;
  homeworkPending: number;
  materialsCount: number;
  icon: LucideIcon;
  tone: IconTileTone;
  badgeLabel: string;
  badgeTone: StudentPillTone;
  isOngoing: boolean;
  nextClassLabel: string;
}

export function SubjectCard({
  data,
  delay = 0,
  onViewDetails,
  onOpenMaterials,
  onViewSyllabus,
  onViewHomework,
  onMessageTeacher,
  onAskQuestion,
  onViewTeacherProfile,
}: {
  data: SubjectCardData;
  delay?: number;
  onViewDetails: () => void;
  onOpenMaterials: () => void;
  onViewSyllabus: () => void;
  onViewHomework: () => void;
  onMessageTeacher: () => void;
  onAskQuestion: () => void;
  onViewTeacherProfile: () => void;
}) {
  const pct = Math.round((data.syllabusCompleted / data.syllabusTotal) * 100);

  return (
    <Reveal delay={delay}>
      <div
        className={cn(
          "t-lift rounded-[20px] border bg-card p-4 shadow-elevated transition-all hover:-translate-y-0.5 hover:shadow-md sm:p-5",
          data.isOngoing ? "border-primary/40 bg-primary/[0.03]" : "border-border/60",
        )}
      >
        <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
          <div className="flex min-w-[220px] flex-1 items-center gap-3">
            <IconTile icon={data.icon} tone={data.tone} size="lg" />
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-1.5">
                <p className="truncate text-[14.5px] font-semibold text-foreground">{data.name}</p>
                <StudentStatusPill label={data.badgeLabel} tone={data.badgeTone} />
              </div>
              <p className="truncate text-[12px] text-muted-foreground">
                {data.teacher} · {data.weeklyClasses} classes/week
              </p>
            </div>
          </div>

          <div className="min-w-[76px] text-center">
            <p className="font-display text-[17px] font-bold text-foreground">{data.latestMarks}/{data.latestFullMarks}</p>
            <p className="text-[10.5px] text-muted-foreground">Latest Score</p>
          </div>

          <div className="min-w-[150px] flex-1">
            <div className="mb-1 flex items-center justify-between text-[11px] text-muted-foreground">
              <span>Syllabus Progress</span>
              <span>{data.syllabusCompleted}/{data.syllabusTotal} ({pct}%)</span>
            </div>
            <SubjectProgressBar percent={pct} colorCls={pct < 60 ? "bg-amber-500" : "bg-emerald-500"} />
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <span className="flex items-center gap-1 rounded-lg border border-border/60 px-2.5 py-1.5 text-[11px] text-muted-foreground">
              <ClipboardList className="h-3.5 w-3.5" /> {data.homeworkPending} Pending
            </span>
            <span className="flex items-center gap-1 rounded-lg border border-border/60 px-2.5 py-1.5 text-[11px] text-muted-foreground">
              <FolderOpen className="h-3.5 w-3.5" /> {data.materialsCount} Materials
            </span>
          </div>

          <div className="min-w-[120px] shrink-0">
            {data.isOngoing ? (
              <StudentStatusPill label="Ongoing now" tone="info" />
            ) : (
              <>
                <p className="text-[10.5px] text-muted-foreground">Next class</p>
                <p className="text-[12px] font-medium text-foreground">{data.nextClassLabel}</p>
              </>
            )}
          </div>

          <div className="flex shrink-0 items-center gap-1.5">
            <StudentSecondaryButton className="w-auto px-3.5" onClick={onViewDetails}>
              View Details
            </StudentSecondaryButton>
            <SubjectActionMenu
              onViewSyllabus={onViewSyllabus}
              onViewHomework={onViewHomework}
              onOpenMaterials={onOpenMaterials}
              onMessageTeacher={onMessageTeacher}
              onAskQuestion={onAskQuestion}
              onViewTeacherProfile={onViewTeacherProfile}
            />
          </div>
        </div>
      </div>
    </Reveal>
  );
}
