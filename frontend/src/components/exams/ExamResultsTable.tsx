import { useState } from "react";
import { Eye, Printer } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast }  from "sonner";
import { GradeBadge } from "@/components/exams/GradeBadge";
import type { ExamResult } from "@/data/examsData";
import { cn } from "@/lib/utils";

export function ExamResultsTable({ results }: { results: ExamResult[] }) {
  const navigate = useNavigate();
  const [published, setPublished] = useState<Set<number>>(
    new Set(results.filter((r) => r.published).map((r) => r.id)),
  );

  function togglePublish(id: number) {
    setPublished((prev) => {
      const next = new Set(prev);
      if (next.has(id)) { next.delete(id); toast.info("Result unpublished."); }
      else               { next.add(id);    toast.success("Result published!"); }
      return next;
    });
  }

  if (results.length === 0) {
    return (
      <div className="rounded-xl border border-border/60 py-16 text-center text-[13px] text-muted-foreground">
        No results found for the selected filters.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-border/60 shadow-sm">
      <table className="min-w-full text-[12px]">
        <thead className="bg-muted/40 border-b border-border/60">
          <tr>
            <th className="px-3 py-2.5 text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">Rank</th>
            <th className="px-3 py-2.5 text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">Student</th>
            <th className="px-3 py-2.5 text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">Adm No</th>
            <th className="px-3 py-2.5 text-center text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">Roll</th>
            <th className="px-3 py-2.5 text-center text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">Class</th>
            <th className="px-3 py-2.5 text-center text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">Obtained</th>
            <th className="px-3 py-2.5 text-center text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">Full</th>
            <th className="px-3 py-2.5 text-center text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">%</th>
            <th className="px-3 py-2.5 text-center text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">GPA</th>
            <th className="px-3 py-2.5 text-center text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">Grade</th>
            <th className="px-3 py-2.5 text-center text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">Result</th>
            <th className="px-3 py-2.5 text-center text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">Published</th>
            <th className="px-3 py-2.5 text-right text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border/40">
          {results.map((r) => (
            <tr key={r.id} className="group hover:bg-muted/20 transition-colors">
              <td className="px-3 py-2.5 text-center">
                {r.rank <= 3 ? (
                  <span className={cn("inline-flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-bold",
                    r.rank === 1 ? "bg-amber-400 text-white" :
                    r.rank === 2 ? "bg-slate-400 text-white" : "bg-orange-400 text-white",
                  )}>{r.rank}</span>
                ) : (
                  <span className="text-muted-foreground">{r.rank}</span>
                )}
              </td>
              <td className="px-3 py-2.5 font-medium text-foreground whitespace-nowrap">{r.studentName}</td>
              <td className="px-3 py-2.5 font-mono text-muted-foreground text-[11px]">{r.admissionNo}</td>
              <td className="px-3 py-2.5 text-center text-muted-foreground">{r.roll}</td>
              <td className="px-3 py-2.5 text-center text-foreground whitespace-nowrap">{r.className} {r.section}</td>
              <td className="px-3 py-2.5 text-center font-bold text-foreground">{r.totalMarks}</td>
              <td className="px-3 py-2.5 text-center text-muted-foreground">{r.totalFullMarks}</td>
              <td className="px-3 py-2.5 text-center font-semibold">{r.percentage}%</td>
              <td className="px-3 py-2.5 text-center font-semibold text-indigo-600">{r.gpa.toFixed(2)}</td>
              <td className="px-3 py-2.5 text-center"><GradeBadge grade={r.grade} /></td>
              <td className="px-3 py-2.5 text-center">
                <span className={cn(
                  "inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold ring-1",
                  r.result === "Pass" ? "bg-emerald-50 text-emerald-700 ring-emerald-500/30" : "bg-rose-50 text-rose-700 ring-rose-500/30",
                )}>{r.result}</span>
              </td>
              <td className="px-3 py-2.5 text-center">
                <button
                  onClick={() => togglePublish(r.id)}
                  className={cn(
                    "relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors",
                    published.has(r.id) ? "bg-emerald-500" : "bg-muted",
                  )}
                  title={published.has(r.id) ? "Click to unpublish" : "Click to publish"}
                >
                  <span className={cn(
                    "pointer-events-none inline-block h-4 w-4 rounded-full bg-white shadow ring-0 transition-transform",
                    published.has(r.id) ? "translate-x-4" : "translate-x-0",
                  )} />
                </button>
              </td>
              <td className="px-3 py-2.5">
                <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button className="rounded p-1 hover:bg-muted" title="View Report Card"
                    onClick={() => navigate("/exams/report-cards")}>
                    <Eye className="h-3.5 w-3.5 text-muted-foreground" />
                  </button>
                  <button className="rounded p-1 hover:bg-muted" title="Print Report Card">
                    <Printer className="h-3.5 w-3.5 text-muted-foreground" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
