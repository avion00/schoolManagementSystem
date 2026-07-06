import { useNavigate, useParams } from "react-router-dom";
import { AlertTriangle, ArrowLeft, BookOpen, CalendarDays, Clock, FileText, Pencil, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card }   from "@/components/ui/card";
import { ExamStatusBadge } from "@/components/exams/ExamStatusBadge";
import { EXAM_SCHEDULES, EXAM_CONFLICT_IDS } from "@/data/examsData";
import { cn } from "@/lib/utils";

// Gradient per status
const STATUS_GRAD: Record<string, string> = {
  draft:     "from-slate-600   to-slate-800",
  scheduled: "from-blue-600    to-indigo-800",
  published: "from-violet-600  to-purple-800",
  completed: "from-emerald-600 to-teal-800",
  cancelled: "from-rose-600    to-red-800",
};

const DAY_NAMES = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
function dayName(d: string) { return DAY_NAMES[new Date(d).getDay()]; }

function InfoCard({ icon: Icon, label, value, sub, highlight }: {
  icon: React.FC<{className?: string}>; label: string; value: string; sub?: string; highlight?: boolean;
}) {
  return (
    <Card className={cn(
      "p-4 flex items-start gap-3",
      highlight && "border-rose-200 bg-rose-50/50 dark:border-rose-800 dark:bg-rose-950/20",
    )}>
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted">
        <Icon className="h-4 w-4 text-muted-foreground" />
      </div>
      <div>
        <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">{label}</p>
        <p className={cn("text-[13px] font-semibold text-foreground mt-0.5", highlight && "text-rose-700")}>{value}</p>
        {sub && <p className="text-[11px] text-muted-foreground mt-0.5">{sub}</p>}
      </div>
    </Card>
  );
}

export function ExamScheduleDetailsPage() {
  const { id }   = useParams<{ id: string }>();
  const navigate = useNavigate();
  const exam     = EXAM_SCHEDULES.find((e) => e.id === Number(id));

  if (!exam) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-3">
        <p className="text-[14px] text-muted-foreground">Exam schedule not found.</p>
        <Button variant="outline" size="sm" onClick={() => navigate("/exams/schedule")}>
          <ArrowLeft className="h-3.5 w-3.5 mr-1.5" />Back to Schedule
        </Button>
      </div>
    );
  }

  const isConflict  = EXAM_CONFLICT_IDS.has(exam.id);
  const grad        = STATUS_GRAD[exam.status] ?? STATUS_GRAD.draft;
  const duration    = exam.duration;

  // Other exams on same date
  const sameDay = EXAM_SCHEDULES.filter((e) => e.id !== exam.id && e.date === exam.date);
  // Exams in same room same date same time
  const roomConflicts = sameDay.filter((e) => e.room === exam.room && e.startTime === exam.startTime);
  // Invigilator conflicts
  const invConflicts  = sameDay.filter((e) => e.invigilator === exam.invigilator && e.startTime === exam.startTime);

  return (
    <div className="space-y-6">
      {/* Hero */}
      <div className={cn("relative rounded-2xl bg-gradient-to-br text-white overflow-hidden px-8 py-8", grad)}>
        {/* Back + actions */}
        <div className="flex items-center justify-between mb-6">
          <button onClick={() => navigate("/exams/schedule")}
            className="flex items-center gap-1.5 text-[12px] text-white/80 hover:text-white transition-colors">
            <ArrowLeft className="h-3.5 w-3.5" />Back to Schedule
          </button>
          <div className="flex gap-2">
            {isConflict && (
              <div className="flex items-center gap-1.5 rounded-full bg-rose-500/30 border border-rose-300/30 px-3 py-1 text-[11px] font-medium text-rose-100">
                <AlertTriangle className="h-3.5 w-3.5" />Conflict
              </div>
            )}
            <Button size="sm" className="h-8 gap-1.5 text-[12px] bg-white/20 hover:bg-white/30 border border-white/20"
              onClick={() => navigate(`/exams/schedule/${exam.id}/edit`)}>
              <Pencil className="h-3.5 w-3.5" />Edit
            </Button>
          </div>
        </div>

        {/* Main info */}
        <div className="flex items-start gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/15 shrink-0">
            <BookOpen className="h-8 w-8 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <ExamStatusBadge status={exam.status} className="bg-white/20 text-white ring-white/30" />
              <span className="text-white/70 text-[11px]">{exam.examId}</span>
            </div>
            <h1 className="text-2xl font-bold">{exam.subject}</h1>
            <p className="text-white/80 text-[13px] mt-0.5">
              {exam.examName} · {exam.term} · {exam.academicYear}
            </p>
          </div>
        </div>

        {/* Stats strip */}
        <div className="mt-6 flex flex-wrap gap-6 text-[12px] text-white/80">
          <div><span className="text-white/60">Date</span> <strong className="text-white ml-1">{exam.date} ({dayName(exam.date)})</strong></div>
          <div><span className="text-white/60">Time</span> <strong className="text-white ml-1">{exam.startTime} – {exam.endTime}</strong></div>
          <div><span className="text-white/60">Duration</span> <strong className="text-white ml-1">{duration} min</strong></div>
          <div><span className="text-white/60">Full Marks</span> <strong className="text-white ml-1">{exam.fullMarks}</strong></div>
          <div><span className="text-white/60">Pass Marks</span> <strong className="text-white ml-1">{exam.passMarks}</strong></div>
        </div>

        {/* Decorative circle */}
        <div className="absolute -right-8 -top-8 h-40 w-40 rounded-full bg-white/5" />
        <div className="absolute -right-4 bottom-4 h-24 w-24 rounded-full bg-white/5" />
      </div>

      {/* Conflict warning */}
      {isConflict && (
        <div className="flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50 p-4 dark:border-rose-800 dark:bg-rose-950/20">
          <AlertTriangle className="h-4 w-4 text-rose-500 shrink-0 mt-0.5" />
          <div className="text-[12px]">
            <p className="font-semibold text-rose-700 dark:text-rose-300">Schedule Conflict Detected</p>
            {invConflicts.length > 0 && (
              <p className="text-rose-600 dark:text-rose-400 mt-0.5">
                Invigilator <strong>{exam.invigilator}</strong> is also assigned to{" "}
                {invConflicts.map((c) => `${c.examId} (${c.subject})`).join(", ")} at the same time.
              </p>
            )}
            {roomConflicts.length > 0 && (
              <p className="text-rose-600 dark:text-rose-400 mt-0.5">
                Room <strong>{exam.room}</strong> has a double-booking with{" "}
                {roomConflicts.map((c) => `${c.examId}`).join(", ")}.
              </p>
            )}
          </div>
        </div>
      )}

      {/* Info cards grid */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <InfoCard icon={BookOpen}    label="Subject"      value={exam.subject}     sub={`Type: ${exam.examType}`} />
        <InfoCard icon={Users}       label="Class"        value={`${exam.className} – ${exam.section}`} sub={`Year: ${exam.academicYear}`} />
        <InfoCard icon={CalendarDays} label="Date"        value={exam.date}        sub={`${dayName(exam.date)} · ${exam.term}`} />
        <InfoCard icon={Clock}       label="Time"         value={`${exam.startTime} – ${exam.endTime}`} sub={`${duration} minutes · Report by ${exam.reportingTime}`} />
        <InfoCard icon={FileText}    label="Room"         value={exam.room}        sub={`Capacity: ${exam.seatCapacity} seats`} />
        <InfoCard icon={Users}       label="Invigilator"  value={exam.invigilator} sub={exam.assistantInvigilator ? `Asst: ${exam.assistantInvigilator}` : undefined} highlight={invConflicts.length > 0} />
        <InfoCard icon={FileText}    label="Marks"        value={`${exam.fullMarks} full / ${exam.passMarks} pass`} sub={`Theory ${exam.theoryMarks} · Practical ${exam.practicalMarks} · Internal ${exam.internalMarks}`} />
        <InfoCard icon={Users}       label="Subject Teacher" value={exam.subjectTeacher || "—"} sub="Responsible for marks entry" />
      </div>

      {/* Instructions */}
      {exam.instructions && (
        <Card className="p-5">
          <h3 className="text-[13px] font-semibold text-foreground mb-2">Student Instructions</h3>
          <p className="text-[12px] text-muted-foreground leading-relaxed">{exam.instructions}</p>
        </Card>
      )}

      {/* Other exams on same date */}
      {sameDay.length > 0 && (
        <Card className="p-5">
          <h3 className="text-[13px] font-semibold text-foreground mb-3">
            Other Exams on {exam.date}
          </h3>
          <div className="space-y-2">
            {sameDay.map((e) => (
              <div key={e.id}
                onClick={() => navigate(`/exams/schedule/${e.id}`)}
                className={cn(
                  "flex items-center gap-3 rounded-lg border p-3 cursor-pointer hover:bg-muted/30 transition-colors",
                  EXAM_CONFLICT_IDS.has(e.id) && "border-rose-200 bg-rose-50/30",
                )}>
                <ExamStatusBadge status={e.status} />
                <div className="flex-1 min-w-0">
                  <p className="text-[12px] font-medium text-foreground">{e.subject}</p>
                  <p className="text-[11px] text-muted-foreground">{e.className} {e.section} · {e.startTime} · {e.room}</p>
                </div>
                <span className="text-[11px] text-muted-foreground">{e.invigilator}</span>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
