import { useState } from "react";
import { AlertTriangle, ChevronDown, ChevronUp, ChevronsUpDown, Eye, Pencil, Trash2 } from "lucide-react";
import { Button }                    from "@/components/ui/button";
import { Card, CardContent }         from "@/components/ui/card";
import { ClassRoutineStatusBadge }   from "@/components/classRoutine/ClassRoutineStatusBadge";
import { CONFLICT_IDS, type RoutineEntry } from "@/data/classRoutineData";

type SortKey = "routineId" | "day" | "className" | "section" | "subject" | "teacher" | "room" | "startTime" | "periodNo" | "shift" | "status";

const DAY_ORDER: Record<string, number> = {
  Sunday: 0, Monday: 1, Tuesday: 2, Wednesday: 3, Thursday: 4, Friday: 5, Saturday: 6,
};

function SortHead({ col, label, sort, onSort }: {
  col: SortKey; label: string;
  sort: { key: SortKey; asc: boolean };
  onSort: (k: SortKey) => void;
}) {
  const active = sort.key === col;
  const Icon = active ? (sort.asc ? ChevronUp : ChevronDown) : ChevronsUpDown;
  return (
    <th className="pb-2 pr-3 text-left">
      <button onClick={() => onSort(col)}
        className="flex items-center gap-1 whitespace-nowrap text-[12px] font-medium text-muted-foreground hover:text-foreground">
        {label}<Icon className="h-3 w-3" />
      </button>
    </th>
  );
}

const PER_PAGE = 15;

interface Props {
  routines:  RoutineEntry[];
  onView:    (id: number) => void;
  onEdit:    (id: number) => void;
  onDelete?: (id: number) => void;
}

export function ClassRoutineTable({ routines, onView, onEdit }: Props) {
  const [sort, setSort] = useState<{ key: SortKey; asc: boolean }>({ key: "day", asc: true });
  const [page, setPage] = useState(1);

  function toggleSort(k: SortKey) {
    setSort((s) => s.key === k ? { key: k, asc: !s.asc } : { key: k, asc: true });
    setPage(1);
  }

  const sorted = [...routines].sort((a, b) => {
    const k = sort.key;
    let av: string | number = a[k as keyof RoutineEntry] as string | number;
    let bv: string | number = b[k as keyof RoutineEntry] as string | number;
    if (k === "day") { av = DAY_ORDER[a.day]; bv = DAY_ORDER[b.day]; }
    if (typeof av === "number" && typeof bv === "number") return sort.asc ? av - bv : bv - av;
    return sort.asc ? String(av).localeCompare(String(bv)) : String(bv).localeCompare(String(av));
  });

  const totalPages = Math.max(1, Math.ceil(sorted.length / PER_PAGE));
  const pageData   = sorted.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const pages: (number | "...")[] = [];
  if (totalPages <= 7) for (let i = 1; i <= totalPages; i++) pages.push(i);
  else {
    pages.push(1);
    if (page > 3)              pages.push("...");
    for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) pages.push(i);
    if (page < totalPages - 2) pages.push("...");
    pages.push(totalPages);
  }

  const DAY_BADGE: Record<string, string> = {
    Sunday: "bg-violet-50 text-violet-700 dark:bg-violet-950/40 dark:text-violet-400",
    Monday: "bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400",
    Tuesday: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400",
    Wednesday: "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400",
    Thursday: "bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400",
    Friday: "bg-teal-50 text-teal-700 dark:bg-teal-950/40 dark:text-teal-400",
    Saturday: "bg-muted text-muted-foreground",
  };

  return (
    <Card className="border-border/60 shadow-sm">
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-[12.5px]">
            <thead className="border-b border-border/60 bg-muted/30">
              <tr>
                <SortHead col="routineId" label="Routine ID"   sort={sort} onSort={toggleSort} />
                <SortHead col="day"       label="Day"          sort={sort} onSort={toggleSort} />
                <SortHead col="className" label="Class"        sort={sort} onSort={toggleSort} />
                <SortHead col="section"   label="Section"      sort={sort} onSort={toggleSort} />
                <SortHead col="subject"   label="Subject"      sort={sort} onSort={toggleSort} />
                <SortHead col="teacher"   label="Teacher"      sort={sort} onSort={toggleSort} />
                <SortHead col="room"      label="Room"         sort={sort} onSort={toggleSort} />
                <SortHead col="startTime" label="Start Time"   sort={sort} onSort={toggleSort} />
                <th className="pb-2 pr-3 text-left text-[12px] font-medium text-muted-foreground whitespace-nowrap">End Time</th>
                <th className="pb-2 pr-3 text-left text-[12px] font-medium text-muted-foreground whitespace-nowrap">Dur.</th>
                <SortHead col="periodNo"  label="Period"       sort={sort} onSort={toggleSort} />
                <SortHead col="shift"     label="Shift"        sort={sort} onSort={toggleSort} />
                <SortHead col="status"    label="Status"       sort={sort} onSort={toggleSort} />
                <th className="pb-2 w-24 text-left text-[12px] font-medium text-muted-foreground">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {pageData.map((r) => {
                const hasConflict = CONFLICT_IDS.has(r.id);
                return (
                  <tr key={r.id}
                    className={`group transition-colors ${hasConflict ? "bg-rose-50/40 dark:bg-rose-950/10 hover:bg-rose-50/60" : "hover:bg-muted/30"}`}>
                    <td className="py-2.5 pr-3">
                      <div className="flex items-center gap-1">
                        <span className="font-mono text-[11px] text-muted-foreground">{r.routineId}</span>
                        {hasConflict && <AlertTriangle className="h-3 w-3 text-rose-500 shrink-0" />}
                      </div>
                    </td>
                    <td className="py-2.5 pr-3">
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${DAY_BADGE[r.day] ?? ""}`}>{r.day}</span>
                    </td>
                    <td className="py-2.5 pr-3 font-medium text-foreground whitespace-nowrap">{r.className}</td>
                    <td className="py-2.5 pr-3 text-muted-foreground">Sec {r.section}</td>
                    <td className="py-2.5 pr-3 font-medium text-foreground whitespace-nowrap">{r.subject}</td>
                    <td className="py-2.5 pr-3 whitespace-nowrap text-muted-foreground">{r.teacher}</td>
                    <td className="py-2.5 pr-3 text-muted-foreground">{r.room}</td>
                    <td className="py-2.5 pr-3 text-muted-foreground whitespace-nowrap">{r.startTime}</td>
                    <td className="py-2.5 pr-3 text-muted-foreground whitespace-nowrap">{r.endTime}</td>
                    <td className="py-2.5 pr-3 text-muted-foreground whitespace-nowrap">{r.duration}m</td>
                    <td className="py-2.5 pr-3 text-center font-semibold text-foreground">P{r.periodNo}</td>
                    <td className="py-2.5 pr-3">
                      <span className={`text-[10px] font-medium ${r.shift === "Morning" ? "text-amber-600 dark:text-amber-400" : r.shift === "Day" ? "text-blue-600 dark:text-blue-400" : "text-violet-600 dark:text-violet-400"}`}>{r.shift}</span>
                    </td>
                    <td className="py-2.5 pr-3"><ClassRoutineStatusBadge status={r.status} /></td>
                    <td className="py-2.5">
                      <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => onView(r.id)}>
                          <Eye    className="h-3.5 w-3.5 text-blue-500" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => onEdit(r.id)}>
                          <Pencil className="h-3.5 w-3.5 text-emerald-500" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-6 w-6">
                          <Trash2 className="h-3.5 w-3.5 text-rose-500" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {routines.length === 0 && (
          <p className="py-12 text-center text-[13px] text-muted-foreground">No routines match the current filters.</p>
        )}

        {/* pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-border/60 px-4 py-3">
            <p className="text-[11px] text-muted-foreground">
              Showing {(page - 1) * PER_PAGE + 1}–{Math.min(page * PER_PAGE, sorted.length)} of {sorted.length}
            </p>
            <div className="flex items-center gap-1">
              <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-[11px]"
                disabled={page === 1} onClick={() => setPage((p) => p - 1)}>‹</Button>
              {pages.map((p, i) =>
                p === "..."
                  ? <span key={i} className="px-1 text-muted-foreground text-[11px]">…</span>
                  : <Button key={p} size="sm"
                      variant={page === p ? "default" : "ghost"}
                      className="h-7 w-7 p-0 text-[11px]"
                      onClick={() => setPage(p as number)}>{p}</Button>
              )}
              <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-[11px]"
                disabled={page === totalPages} onClick={() => setPage((p) => p + 1)}>›</Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
