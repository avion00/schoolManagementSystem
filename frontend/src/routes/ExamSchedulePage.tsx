import { useState, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { AlertTriangle, BookOpen, CalendarDays, CheckCircle2, Clock, Users } from "lucide-react";
import { Card } from "@/components/ui/card";
import { ExamScheduleToolbar, type ScheduleFilters } from "@/components/exams/ExamScheduleToolbar";
import { ExamScheduleTable } from "@/components/exams/ExamScheduleTable";
import {
  EXAM_SCHEDULES, EXAM_CONFLICT_COUNT,
} from "@/data/examsData";
import { cn } from "@/lib/utils";

// ── Schedule-level stats ──────────────────────────────────────────────────────
const SCHED_STATS = {
  scheduled: EXAM_SCHEDULES.filter((e) => e.status === "scheduled").length,
  published:  EXAM_SCHEDULES.filter((e) => e.status === "published").length,
  rooms:      new Set(EXAM_SCHEDULES.map((e) => e.room)).size,
  invigilators: new Set(EXAM_SCHEDULES.map((e) => e.invigilator)).size,
  conflicts:  EXAM_CONFLICT_COUNT,
  completed:  EXAM_SCHEDULES.filter((e) => e.status === "completed").length,
};

interface MiniCardProps { label: string; value: number | string; icon: React.ReactNode; color: string; highlight?: boolean; }
function MiniCard({ label, value, icon, color, highlight }: MiniCardProps) {
  return (
    <Card className={cn("flex items-center gap-3 p-3.5 shadow-sm", highlight && "ring-2 ring-rose-400/40")}>
      <div className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-white", color)}>{icon}</div>
      <div>
        <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">{label}</p>
        <p className="text-lg font-bold text-foreground leading-none mt-0.5">{value}</p>
      </div>
    </Card>
  );
}

const EMPTY: ScheduleFilters = { search: "", term: "", className: "", section: "", type: "", status: "", year: "" };

export function ExamSchedulePage() {
  const navigate = useNavigate();
  const [filters, setFilters] = useState<ScheduleFilters>(EMPTY);

  const onChange = useCallback((key: keyof ScheduleFilters, value: string) =>
    setFilters((f) => ({ ...f, [key]: value })), []);
  const onClear = useCallback(() => setFilters(EMPTY), []);

  const filtered = useMemo(() => {
    const q = filters.search.toLowerCase();
    return EXAM_SCHEDULES.filter((e) => {
      if (filters.term      && e.term      !== filters.term)      return false;
      if (filters.className && e.className !== filters.className)  return false;
      if (filters.section   && e.section   !== filters.section)    return false;
      if (filters.type      && e.examType  !== filters.type)       return false;
      if (filters.status    && e.status    !== filters.status)     return false;
      if (filters.year      && e.academicYear !== filters.year)    return false;
      if (q && !(
        e.examId.toLowerCase().includes(q)   ||
        e.subject.toLowerCase().includes(q)  ||
        e.examName.toLowerCase().includes(q) ||
        e.room.toLowerCase().includes(q)     ||
        e.invigilator.toLowerCase().includes(q)
      )) return false;
      return true;
    });
  }, [filters]);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Exam Schedule</h1>
          <p className="text-[13px] text-muted-foreground mt-0.5">
            {EXAM_SCHEDULES.length} exams scheduled · Academic Year 2026/27
          </p>
        </div>
      </div>

      {/* Mini stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6">
        <MiniCard label="Scheduled"    value={SCHED_STATS.scheduled}    icon={<Clock className="h-4 w-4" />}        color="bg-blue-500"    />
        <MiniCard label="Published"    value={SCHED_STATS.published}    icon={<BookOpen className="h-4 w-4" />}     color="bg-violet-500"  />
        <MiniCard label="Completed"    value={SCHED_STATS.completed}    icon={<CheckCircle2 className="h-4 w-4" />} color="bg-emerald-500" />
        <MiniCard label="Exam Rooms"   value={SCHED_STATS.rooms}        icon={<CalendarDays className="h-4 w-4" />} color="bg-teal-500"    />
        <MiniCard label="Invigilators" value={SCHED_STATS.invigilators} icon={<Users className="h-4 w-4" />}        color="bg-indigo-500"  />
        <MiniCard label="Conflicts"    value={SCHED_STATS.conflicts}    icon={<AlertTriangle className="h-4 w-4" />}
          color={SCHED_STATS.conflicts > 0 ? "bg-rose-500" : "bg-slate-400"}
          highlight={SCHED_STATS.conflicts > 0} />
      </div>

      {/* Toolbar + table */}
      <Card className="p-4 space-y-4">
        <ExamScheduleToolbar
          filters={filters}
          onChange={onChange}
          onClear={onClear}
          onAdd={() => navigate("/exams/schedule/new")}
          onPrint={() => window.print()}
          resultCount={filtered.length}
        />
        <ExamScheduleTable schedules={filtered} />
      </Card>
    </div>
  );
}
