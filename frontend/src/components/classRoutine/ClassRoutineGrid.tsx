import { useState, useMemo } from "react";
import { AlertTriangle }     from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ROUTINES, CONFLICT_IDS, CLASS_OPTIONS, SECTION_OPTIONS,
  MORNING_PERIODS, DAY_PERIODS,
  type RoutineEntry, type Day,
} from "@/data/classRoutineData";

const SCHOOL_DAYS: Day[] = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday"];

const DAY_SHORT: Record<Day, string> = {
  Sunday: "SUN", Monday: "MON", Tuesday: "TUE",
  Wednesday: "WED", Thursday: "THU", Friday: "FRI", Saturday: "SAT",
};

const SUBJECT_COLOR: Record<string, { bg: string; border: string; text: string }> = {
  "English":                     { bg: "bg-blue-50 dark:bg-blue-950/40",      border: "border-blue-200 dark:border-blue-800",    text: "text-blue-800 dark:text-blue-300"    },
  "English Advanced":            { bg: "bg-blue-50 dark:bg-blue-950/40",      border: "border-blue-200 dark:border-blue-800",    text: "text-blue-800 dark:text-blue-300"    },
  "Mathematics Primary":         { bg: "bg-indigo-50 dark:bg-indigo-950/40",  border: "border-indigo-200 dark:border-indigo-800",text: "text-indigo-800 dark:text-indigo-300"},
  "Mathematics Middle":          { bg: "bg-indigo-50 dark:bg-indigo-950/40",  border: "border-indigo-200 dark:border-indigo-800",text: "text-indigo-800 dark:text-indigo-300"},
  "Mathematics Secondary":       { bg: "bg-indigo-50 dark:bg-indigo-950/40",  border: "border-indigo-200 dark:border-indigo-800",text: "text-indigo-800 dark:text-indigo-300"},
  "Science Primary":             { bg: "bg-emerald-50 dark:bg-emerald-950/40",border: "border-emerald-200 dark:border-emerald-800",text:"text-emerald-800 dark:text-emerald-300"},
  "Science Middle":              { bg: "bg-emerald-50 dark:bg-emerald-950/40",border: "border-emerald-200 dark:border-emerald-800",text:"text-emerald-800 dark:text-emerald-300"},
  "Nepali":                      { bg: "bg-rose-50 dark:bg-rose-950/40",      border: "border-rose-200 dark:border-rose-800",    text: "text-rose-800 dark:text-rose-300"    },
  "Social Studies":              { bg: "bg-amber-50 dark:bg-amber-950/40",    border: "border-amber-200 dark:border-amber-800",  text: "text-amber-800 dark:text-amber-300"  },
  "Computer Science":            { bg: "bg-slate-50 dark:bg-slate-800/50",    border: "border-slate-200 dark:border-slate-700",  text: "text-slate-700 dark:text-slate-300"  },
  "Moral Science":               { bg: "bg-purple-50 dark:bg-purple-950/40",  border: "border-purple-200 dark:border-purple-800",text: "text-purple-800 dark:text-purple-300"},
  "Drawing & Arts":              { bg: "bg-pink-50 dark:bg-pink-950/40",      border: "border-pink-200 dark:border-pink-800",    text: "text-pink-800 dark:text-pink-300"    },
  "Health & Physical Education": { bg: "bg-teal-50 dark:bg-teal-950/40",      border: "border-teal-200 dark:border-teal-800",    text: "text-teal-800 dark:text-teal-300"    },
  "Optional Mathematics":        { bg: "bg-cyan-50 dark:bg-cyan-950/40",      border: "border-cyan-200 dark:border-cyan-800",    text: "text-cyan-800 dark:text-cyan-300"    },
  "Environmental Science":       { bg: "bg-green-50 dark:bg-green-950/40",    border: "border-green-200 dark:border-green-800",  text: "text-green-800 dark:text-green-300"  },
  "Geography":                   { bg: "bg-orange-50 dark:bg-orange-950/40",  border: "border-orange-200 dark:border-orange-800",text: "text-orange-800 dark:text-orange-300"},
  "History":                     { bg: "bg-yellow-50 dark:bg-yellow-950/40",  border: "border-yellow-200 dark:border-yellow-800",text: "text-yellow-800 dark:text-yellow-300"},
  "Account":                     { bg: "bg-lime-50 dark:bg-lime-950/40",      border: "border-lime-200 dark:border-lime-800",    text: "text-lime-800 dark:text-lime-300"    },
};
const DEF_COLOR = { bg: "bg-muted/40", border: "border-border/60", text: "text-muted-foreground" };
function col(subject: string) { return SUBJECT_COLOR[subject] ?? DEF_COLOR; }

interface PeriodRow {
  periodNo: number;
  timeLabel: string;
  isBreak: false;
}
interface BreakRow { isBreak: true }
type GridRow = PeriodRow | BreakRow;

export function ClassRoutineGrid() {
  const [selClass,   setSelClass]   = useState("Grade 6");
  const [selSection, setSelSection] = useState("A");

  const filtered = useMemo(
    () => ROUTINES.filter((r) => r.className === selClass && r.section === selSection && r.status === "active"),
    [selClass, selSection],
  );

  // determine shift from data
  const shift = filtered[0]?.shift ?? "Morning";
  const periods = shift === "Morning" ? MORNING_PERIODS : DAY_PERIODS;

  // build day→period→entry map
  const matrix = useMemo(() => {
    const m = new Map<Day, Map<number, RoutineEntry>>();
    for (const e of filtered) {
      if (!m.has(e.day)) m.set(e.day, new Map());
      m.get(e.day)!.set(e.periodNo, e);
    }
    return m;
  }, [filtered]);

  // build row list: periods with break inserted after period 3
  const rows: GridRow[] = [];
  for (const p of periods) {
    rows.push({ isBreak: false, periodNo: p.period, timeLabel: `${p.start} – ${p.end}` });
    if (p.period === 3) rows.push({ isBreak: true });
  }

  // available options from data
  const classOptions  = [...new Set(ROUTINES.map((r) => r.className))].sort();
  const sectionOptions = [...new Set(ROUTINES.filter((r) => r.className === selClass).map((r) => r.section))].sort();

  return (
    <Card className="border-border/60 shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <CardTitle className="text-[14px] font-semibold">Weekly Timetable</CardTitle>
          <div className="flex items-center gap-2">
            <select value={selClass}
              onChange={(e) => { setSelClass(e.target.value); setSelSection("A"); }}
              className="h-8 rounded-md border border-input bg-background px-2 text-[12px] text-foreground shadow-sm focus:outline-none focus:ring-1 focus:ring-ring">
              {classOptions.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
            <select value={selSection} onChange={(e) => setSelSection(e.target.value)}
              className="h-8 rounded-md border border-input bg-background px-2 text-[12px] text-foreground shadow-sm focus:outline-none focus:ring-1 focus:ring-ring">
              {sectionOptions.map((s) => <option key={s} value={s}>Section {s}</option>)}
            </select>
            <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${shift === "Morning" ? "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400" : "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400"}`}>
              {shift} Shift
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0 pb-4">
        <div className="overflow-x-auto px-4">
          <table className="w-full min-w-[700px] border-collapse">
            <thead>
              <tr>
                <th className="w-32 py-2 pr-3 text-left text-[11px] font-semibold text-muted-foreground">Period / Time</th>
                {SCHOOL_DAYS.map((d) => (
                  <th key={d} className="py-2 px-1 text-center">
                    <div className="text-[12px] font-bold text-foreground">{DAY_SHORT[d]}</div>
                    <div className="text-[10px] text-muted-foreground">{d}</div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, ri) => {
                if (row.isBreak) {
                  return (
                    <tr key={`break-${ri}`}>
                      <td colSpan={7} className="py-1">
                        <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                          <div className="h-px flex-1 bg-border/40" />
                          <span className="rounded-full bg-muted px-2 py-0.5 font-medium">Break · 15 min</span>
                          <div className="h-px flex-1 bg-border/40" />
                        </div>
                      </td>
                    </tr>
                  );
                }

                const { periodNo, timeLabel } = row;
                return (
                  <tr key={periodNo}>
                    {/* period header */}
                    <td className="py-1 pr-3 align-top">
                      <div className="rounded-lg bg-muted/50 px-2 py-1.5">
                        <p className="text-[11px] font-bold text-foreground">P{periodNo}</p>
                        <p className="text-[9px] text-muted-foreground leading-tight">{timeLabel}</p>
                      </div>
                    </td>

                    {/* day cells */}
                    {SCHOOL_DAYS.map((day) => {
                      const entry = matrix.get(day)?.get(periodNo);
                      const hasConflict = entry ? CONFLICT_IDS.has(entry.id) : false;
                      const c = entry ? col(entry.subject) : DEF_COLOR;

                      return (
                        <td key={day} className="py-1 px-1 align-top">
                          {entry ? (
                            <div className={`group relative min-h-[60px] rounded-lg border ${c.border} ${c.bg} p-2 transition-all hover:shadow-md cursor-default ${hasConflict ? "ring-1 ring-rose-400" : ""}`}>
                              {hasConflict && (
                                <AlertTriangle className="absolute right-1 top-1 h-3 w-3 text-rose-500" />
                              )}
                              <p className={`text-[11px] font-bold leading-tight ${c.text}`}>{entry.subject}</p>
                              <p className="mt-0.5 text-[10px] text-muted-foreground leading-tight">{entry.teacher.split(" ")[0]}</p>
                              <p className="text-[9px] text-muted-foreground">{entry.room}</p>
                            </div>
                          ) : (
                            <div className="min-h-[60px] rounded-lg border border-dashed border-border/40 bg-muted/10 flex items-center justify-center">
                              <span className="text-[10px] text-muted-foreground/50">Free</span>
                            </div>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* legend */}
        <div className="mt-4 flex flex-wrap items-center gap-3 px-4">
          <span className="text-[10px] text-muted-foreground font-medium">Legend:</span>
          {[
            { label: "English", color: "bg-blue-200 dark:bg-blue-800" },
            { label: "Math",    color: "bg-indigo-200 dark:bg-indigo-800" },
            { label: "Science", color: "bg-emerald-200 dark:bg-emerald-800" },
            { label: "Nepali",  color: "bg-rose-200 dark:bg-rose-800" },
            { label: "Social",  color: "bg-amber-200 dark:bg-amber-800" },
            { label: "CS",      color: "bg-slate-200 dark:bg-slate-700" },
          ].map(({ label, color }) => (
            <span key={label} className="flex items-center gap-1 text-[10px] text-muted-foreground">
              <span className={`h-2.5 w-2.5 rounded-sm ${color}`} />{label}
            </span>
          ))}
          <span className="flex items-center gap-1 text-[10px] text-rose-600 dark:text-rose-400">
            <AlertTriangle className="h-3 w-3" />Conflict
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
