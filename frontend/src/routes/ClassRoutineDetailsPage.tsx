import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft, BookOpen, CalendarDays, Clock, Edit, MapPin,
  Printer, Users, AlertTriangle, RefreshCw,
} from "lucide-react";
import { Button }                     from "@/components/ui/button";
import { Card, CardContent }          from "@/components/ui/card";
import { ClassRoutineStatusBadge }    from "@/components/classRoutine/ClassRoutineStatusBadge";
import { ROUTINES, CONFLICT_IDS }     from "@/data/classRoutineData";

const DAY_GRAD: Record<string, string> = {
  Sunday:    "from-violet-600 via-violet-500 to-indigo-500",
  Monday:    "from-blue-600 via-blue-500 to-sky-500",
  Tuesday:   "from-emerald-600 via-teal-500 to-cyan-500",
  Wednesday: "from-amber-500 via-orange-400 to-yellow-400",
  Thursday:  "from-rose-500 via-pink-500 to-fuchsia-500",
  Friday:    "from-teal-600 via-teal-500 to-green-500",
  Saturday:  "from-slate-500 via-slate-400 to-slate-300",
};

function InfoCard({ icon: Icon, label, value, sub }: {
  icon: React.ElementType; label: string; value: string; sub?: string;
}) {
  return (
    <Card className="border-border/60 shadow-sm">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted">
            <Icon className="h-4 w-4 text-muted-foreground" />
          </div>
          <div>
            <p className="text-[11px] text-muted-foreground">{label}</p>
            <p className="text-[14px] font-semibold text-foreground">{value}</p>
            {sub && <p className="text-[10px] text-muted-foreground">{sub}</p>}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function ClassRoutineDetailsPage() {
  const { id }   = useParams<{ id: string }>();
  const navigate = useNavigate();

  const entry = ROUTINES.find((r) => r.id === Number(id));

  if (!entry) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-muted-foreground">
        <p className="text-lg font-medium">Routine entry not found.</p>
        <Button variant="outline" className="mt-4" onClick={() => navigate("/class-routine")}>
          Back to Class Routine
        </Button>
      </div>
    );
  }

  const hasConflict = CONFLICT_IDS.has(entry.id);
  const grad = DAY_GRAD[entry.day] ?? "from-slate-500 to-slate-400";

  // related entries (same class+section, same day)
  const sameClassDay = ROUTINES.filter(
    (r) => r.className === entry.className && r.section === entry.section
        && r.day === entry.day && r.id !== entry.id && r.status === "active",
  ).sort((a, b) => a.periodNo - b.periodNo);

  return (
    <div className="space-y-6 pb-12">
      {/* back */}
      <Button variant="ghost" size="sm" className="h-8 gap-1.5 text-[12px]"
        onClick={() => navigate("/class-routine")}>
        <ArrowLeft className="h-3.5 w-3.5" />All Routines
      </Button>

      {/* hero */}
      <div className={`relative overflow-hidden rounded-xl bg-gradient-to-r ${grad} p-6 text-white shadow-lg`}>
        <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-white/10" />
        <div className="pointer-events-none absolute -bottom-8 -right-4 h-36 w-36 rounded-full bg-white/10" />

        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
              <CalendarDays className="h-7 w-7 text-white" />
            </div>
            <div>
              <p className="text-[11px] font-mono text-white/70">{entry.routineId}</p>
              <h1 className="text-xl font-bold">{entry.subject}</h1>
              <div className="mt-1 flex flex-wrap items-center gap-1.5">
                <ClassRoutineStatusBadge status={entry.status} />
                <span className="rounded-full bg-white/20 px-2 py-0.5 text-[10px] font-semibold">{entry.shift} Shift</span>
                <span className="rounded-full bg-white/20 px-2 py-0.5 text-[10px] font-semibold">{entry.day}</span>
                {hasConflict && (
                  <span className="flex items-center gap-1 rounded-full bg-rose-500/80 px-2 py-0.5 text-[10px] font-semibold text-white">
                    <AlertTriangle className="h-3 w-3" />Conflict
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="flex shrink-0 gap-2">
            <Button size="sm" variant="secondary" className="h-8 gap-1.5 text-[11px]"
              onClick={() => navigate("/class-routine/print")}>
              <Printer className="h-3 w-3" />Print
            </Button>
            <Button size="sm" variant="secondary" className="h-8 gap-1.5 text-[11px]"
              onClick={() => navigate(`/class-routine/${entry.id}/edit`)}>
              <Edit className="h-3 w-3" />Edit
            </Button>
          </div>
        </div>

        <div className="relative mt-5 flex flex-wrap gap-x-8 gap-y-3 border-t border-white/20 pt-4">
          {[
            { l: "Class",        v: `${entry.className} — Section ${entry.section}` },
            { l: "Period",       v: `P${entry.periodNo} · ${entry.startTime} – ${entry.endTime}` },
            { l: "Duration",     v: `${entry.duration} min` },
            { l: "Academic Year",v: entry.academicYear },
          ].map(({ l, v }) => (
            <div key={l} className="flex flex-col">
              <span className="text-[10px] text-white/60 uppercase tracking-wide">{l}</span>
              <span className="text-[13px] font-semibold text-white">{v}</span>
            </div>
          ))}
        </div>
      </div>

      {/* conflict warning */}
      {hasConflict && (
        <div className="flex items-start gap-2.5 rounded-xl border border-rose-200 bg-rose-50 p-4 dark:border-rose-800 dark:bg-rose-950/30">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-rose-600 dark:text-rose-400" />
          <div>
            <p className="text-[13px] font-semibold text-rose-700 dark:text-rose-400">Schedule Conflict</p>
            <p className="text-[12px] text-rose-600 dark:text-rose-500">
              {entry.teacher} is assigned to another class at the same time on {entry.day}. Review and resolve to avoid timetable clashes.
            </p>
          </div>
        </div>
      )}

      {/* info grid */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <InfoCard icon={BookOpen}     label="Subject"  value={entry.subject}                                     />
        <InfoCard icon={Users}        label="Teacher"  value={entry.teacher}                                     />
        <InfoCard icon={MapPin}       label="Room"     value={entry.room}                                        />
        <InfoCard icon={Clock}        label="Time"     value={`${entry.startTime} – ${entry.endTime}`} sub={`${entry.duration} minutes`} />
        <InfoCard icon={CalendarDays} label="Day"      value={entry.day}           sub={entry.shift + " Shift"} />
        <InfoCard icon={BookOpen}     label="Class"    value={entry.className}     sub={`Section ${entry.section}`} />
        <InfoCard icon={RefreshCw}    label="Repeat"   value="Weekly"              sub={entry.academicYear}      />
        <InfoCard icon={CalendarDays} label="Period"   value={`Period ${entry.periodNo}`} sub={entry.routineId} />
      </div>

      {/* same class + day schedule */}
      <Card className="border-border/60 shadow-sm">
        <CardContent className="p-4">
          <p className="mb-3 text-[13px] font-semibold text-foreground">
            Full {entry.day} Schedule — {entry.className} Section {entry.section}
          </p>
          {sameClassDay.length === 0 ? (
            <p className="text-[12px] text-muted-foreground">No other periods found for this day.</p>
          ) : (
            <div className="space-y-1.5">
              {sameClassDay.map((r) => (
                <div key={r.id} className={`flex items-center gap-3 rounded-lg border px-3 py-2 text-[12px] transition-colors hover:bg-muted/30 ${r.id === entry.id ? "border-primary/40 bg-primary/5" : "border-border/60"}`}>
                  <span className="w-6 text-center font-bold text-muted-foreground">P{r.periodNo}</span>
                  <span className="w-28 shrink-0 text-muted-foreground">{r.startTime}–{r.endTime}</span>
                  <span className="font-medium text-foreground">{r.subject}</span>
                  <span className="text-muted-foreground">{r.teacher}</span>
                  <span className="ml-auto text-muted-foreground">{r.room}</span>
                </div>
              ))}
            </div>
          )}
          {entry.notes && (
            <p className="mt-3 text-[11px] text-muted-foreground border-t border-border/50 pt-2">
              Notes: {entry.notes}
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
