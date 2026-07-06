import { useState, useMemo } from "react";
import { useNavigate }       from "react-router-dom";
import { AlertTriangle, ChevronLeft, ChevronRight, ChevronsUpDown, Eye, Pencil, Trash2 } from "lucide-react";
import { Button }            from "@/components/ui/button";
import { ExamStatusBadge }   from "@/components/exams/ExamStatusBadge";
import { EXAM_CONFLICT_IDS } from "@/data/examsData";
import type { ExamSchedule } from "@/data/examsData";
import { cn }                from "@/lib/utils";

const PAGE_SIZE = 15;
const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
type SortKey = "id" | "examId" | "term" | "subject" | "className" | "date" | "room" | "invigilator" | "fullMarks" | "status";

function getDayName(d: string) { return DAY_NAMES[new Date(d).getDay()]; }

function SortHead({ col, label, sort, onSort }: {
  col: SortKey; label: string; sort: SortKey; onSort: (c: SortKey) => void;
}) {
  return (
    <th
      className="px-3 py-2.5 text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wide cursor-pointer select-none whitespace-nowrap hover:text-foreground"
      onClick={() => onSort(col)}
    >
      <span className="inline-flex items-center gap-1">
        {label}
        <ChevronsUpDown className={cn("h-3 w-3", sort === col ? "text-primary" : "opacity-40")} />
      </span>
    </th>
  );
}

export function ExamScheduleTable({ schedules }: { schedules: ExamSchedule[] }) {
  const navigate = useNavigate();
  const [sort,    setSort]    = useState<SortKey>("id");
  const [dir,     setDir]     = useState<1 | -1>(1);
  const [page,    setPage]    = useState(1);

  function onSort(col: SortKey) {
    if (sort === col) setDir((d) => (d === 1 ? -1 : 1));
    else { setSort(col); setDir(1); }
    setPage(1);
  }

  const sorted = useMemo(() => {
    const cmp = (a: ExamSchedule, b: ExamSchedule): number => {
      let av: string | number = "", bv: string | number = "";
      if (sort === "id")          { av = a.id;          bv = b.id; }
      else if (sort === "examId") { av = a.examId;      bv = b.examId; }
      else if (sort === "term")   { av = a.term;        bv = b.term; }
      else if (sort === "subject"){ av = a.subject;     bv = b.subject; }
      else if (sort === "className"){ av = a.className; bv = b.className; }
      else if (sort === "date")   { av = a.date;        bv = b.date; }
      else if (sort === "room")   { av = a.room;        bv = b.room; }
      else if (sort === "invigilator"){ av = a.invigilator; bv = b.invigilator; }
      else if (sort === "fullMarks") { av = a.fullMarks; bv = b.fullMarks; }
      else if (sort === "status") { av = a.status;      bv = b.status; }
      if (av < bv) return -dir;
      if (av > bv) return  dir;
      return 0;
    };
    return [...schedules].sort(cmp);
  }, [schedules, sort, dir]);

  const total = sorted.length;
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const pg    = Math.min(page, pages);
  const slice = sorted.slice((pg - 1) * PAGE_SIZE, pg * PAGE_SIZE);

  // pagination pages array
  function pageNums() {
    const nums: (number | "…")[] = [];
    if (pages <= 7) { for (let i = 1; i <= pages; i++) nums.push(i); return nums; }
    nums.push(1);
    if (pg > 3)    nums.push("…");
    for (let i = Math.max(2, pg - 1); i <= Math.min(pages - 1, pg + 1); i++) nums.push(i);
    if (pg < pages - 2) nums.push("…");
    nums.push(pages);
    return nums;
  }

  return (
    <div className="space-y-3">
      <div className="overflow-x-auto rounded-xl border border-border/60 shadow-sm">
        <table className="min-w-full text-[12px]">
          <thead className="bg-muted/40 border-b border-border/60">
            <tr>
              <SortHead col="id"          label="#"            sort={sort} onSort={onSort} />
              <SortHead col="examId"      label="Exam ID"      sort={sort} onSort={onSort} />
              <SortHead col="term"        label="Term"         sort={sort} onSort={onSort} />
              <th className="px-3 py-2.5 text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wide whitespace-nowrap">Type</th>
              <SortHead col="subject"     label="Subject"      sort={sort} onSort={onSort} />
              <SortHead col="className"   label="Class"        sort={sort} onSort={onSort} />
              <th className="px-3 py-2.5 text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">Sec</th>
              <SortHead col="date"        label="Date"         sort={sort} onSort={onSort} />
              <th className="px-3 py-2.5 text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">Day</th>
              <th className="px-3 py-2.5 text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wide whitespace-nowrap">Time</th>
              <th className="px-3 py-2.5 text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">Min</th>
              <SortHead col="room"        label="Room"         sort={sort} onSort={onSort} />
              <SortHead col="invigilator" label="Invigilator"  sort={sort} onSort={onSort} />
              <SortHead col="fullMarks"   label="Marks"        sort={sort} onSort={onSort} />
              <SortHead col="status"      label="Status"       sort={sort} onSort={onSort} />
              <th className="px-3 py-2.5 text-right text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/40">
            {slice.length === 0 && (
              <tr><td colSpan={16} className="py-12 text-center text-[12px] text-muted-foreground">No exam schedules found.</td></tr>
            )}
            {slice.map((ex) => {
              const isConflict = EXAM_CONFLICT_IDS.has(ex.id);
              return (
                <tr
                  key={ex.id}
                  className={cn(
                    "group transition-colors hover:bg-muted/30",
                    isConflict && "bg-rose-50/60 dark:bg-rose-950/20",
                  )}
                >
                  <td className="px-3 py-2.5 text-muted-foreground">{ex.id}</td>
                  <td className="px-3 py-2.5 font-mono font-semibold text-foreground whitespace-nowrap">
                    <div className="flex items-center gap-1">
                      {isConflict && <AlertTriangle className="h-3 w-3 text-rose-500 shrink-0" />}
                      {ex.examId}
                    </div>
                  </td>
                  <td className="px-3 py-2.5 text-foreground whitespace-nowrap">{ex.term}</td>
                  <td className="px-3 py-2.5 text-muted-foreground whitespace-nowrap">{ex.examType}</td>
                  <td className="px-3 py-2.5 font-medium text-foreground max-w-[160px] truncate">{ex.subject}</td>
                  <td className="px-3 py-2.5 text-foreground whitespace-nowrap">{ex.className}</td>
                  <td className="px-3 py-2.5 text-center font-medium">{ex.section}</td>
                  <td className="px-3 py-2.5 text-foreground whitespace-nowrap">{ex.date}</td>
                  <td className="px-3 py-2.5 text-muted-foreground">{getDayName(ex.date)}</td>
                  <td className="px-3 py-2.5 text-foreground whitespace-nowrap">{ex.startTime}–{ex.endTime}</td>
                  <td className="px-3 py-2.5 text-muted-foreground">{ex.duration}</td>
                  <td className="px-3 py-2.5 text-foreground whitespace-nowrap">{ex.room}</td>
                  <td className="px-3 py-2.5 text-foreground whitespace-nowrap">{ex.invigilator}</td>
                  <td className="px-3 py-2.5 text-center font-semibold">{ex.fullMarks}</td>
                  <td className="px-3 py-2.5"><ExamStatusBadge status={ex.status} /></td>
                  <td className="px-3 py-2.5">
                    <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="rounded p-1 hover:bg-muted" title="View" onClick={() => navigate(`/exams/schedule/${ex.id}`)}>
                        <Eye className="h-3.5 w-3.5 text-muted-foreground" />
                      </button>
                      <button className="rounded p-1 hover:bg-muted" title="Edit" onClick={() => navigate(`/exams/schedule/${ex.id}/edit`)}>
                        <Pencil className="h-3.5 w-3.5 text-muted-foreground" />
                      </button>
                      <button className="rounded p-1 hover:bg-rose-100" title="Delete">
                        <Trash2 className="h-3.5 w-3.5 text-rose-400" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pages > 1 && (
        <div className="flex items-center justify-between px-1">
          <p className="text-[11px] text-muted-foreground">
            Showing {(pg - 1) * PAGE_SIZE + 1}–{Math.min(pg * PAGE_SIZE, total)} of {total}
          </p>
          <div className="flex items-center gap-1">
            <Button variant="outline" size="icon" className="h-7 w-7" disabled={pg <= 1} onClick={() => setPage(pg - 1)}>
              <ChevronLeft className="h-3.5 w-3.5" />
            </Button>
            {pageNums().map((n, i) =>
              n === "…" ? (
                <span key={`e${i}`} className="px-1 text-muted-foreground text-[12px]">…</span>
              ) : (
                <Button key={n} variant={pg === n ? "default" : "outline"} size="icon"
                  className="h-7 w-7 text-[11px]" onClick={() => setPage(n as number)}>
                  {n}
                </Button>
              ),
            )}
            <Button variant="outline" size="icon" className="h-7 w-7" disabled={pg >= pages} onClick={() => setPage(pg + 1)}>
              <ChevronRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
