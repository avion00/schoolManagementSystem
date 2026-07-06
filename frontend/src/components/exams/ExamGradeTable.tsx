import { useNavigate } from "react-router-dom";
import { Pencil, Trash2 } from "lucide-react";
import { Button }  from "@/components/ui/button";
import { GradeBadge } from "@/components/exams/GradeBadge";
import type { GradeScale } from "@/data/examsData";
import { cn } from "@/lib/utils";

const COLOR_BAR: Record<string, string> = {
  emerald: "bg-emerald-500",
  green:   "bg-green-500",
  teal:    "bg-teal-500",
  blue:    "bg-blue-500",
  cyan:    "bg-cyan-500",
  amber:   "bg-amber-500",
  rose:    "bg-rose-500",
};

export function ExamGradeTable({ grades, onAdd }: { grades: GradeScale[]; onAdd: () => void }) {
  const navigate = useNavigate();
  return (
    <div className="rounded-xl border border-border/60 shadow-sm overflow-hidden">
      <table className="min-w-full text-[12px]">
        <thead className="bg-muted/40 border-b border-border/60">
          <tr>
            <th className="px-4 py-3 text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">Grade</th>
            <th className="px-4 py-3 text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">Grade Point</th>
            <th className="px-4 py-3 text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">% Range</th>
            <th className="px-4 py-3 text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">Color</th>
            <th className="px-4 py-3 text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">Result</th>
            <th className="px-4 py-3 text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">Comment</th>
            <th className="px-4 py-3 text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">Status</th>
            <th className="px-4 py-3 text-right text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border/40">
          {grades.map((g) => (
            <tr key={g.id} className="group hover:bg-muted/30 transition-colors">
              <td className="px-4 py-3">
                <GradeBadge grade={g.gradeName} />
              </td>
              <td className="px-4 py-3 font-bold text-foreground">{g.gradePoint.toFixed(2)}</td>
              <td className="px-4 py-3 text-foreground">
                <span className="font-medium">{g.percentFrom}</span>
                <span className="text-muted-foreground"> – </span>
                <span className="font-medium">{g.percentUpto}</span>
                <span className="text-muted-foreground">%</span>
              </td>
              <td className="px-4 py-3">
                <div className="flex items-center gap-2">
                  <div className={cn("h-3 w-8 rounded-full", COLOR_BAR[g.colorLabel] ?? "bg-muted")} />
                  <span className="text-muted-foreground capitalize">{g.colorLabel}</span>
                </div>
              </td>
              <td className="px-4 py-3">
                <span className={cn(
                  "inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold ring-1",
                  g.resultStatus === "Pass"
                    ? "bg-emerald-50 text-emerald-700 ring-emerald-500/30"
                    : "bg-rose-50 text-rose-700 ring-rose-500/30",
                )}>
                  {g.resultStatus}
                </span>
              </td>
              <td className="px-4 py-3 text-muted-foreground">{g.comment}</td>
              <td className="px-4 py-3">
                <span className={cn(
                  "inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold ring-1",
                  g.status === "active"
                    ? "bg-green-50 text-green-700 ring-green-500/30"
                    : "bg-muted text-muted-foreground ring-border/30",
                )}>
                  {g.status}
                </span>
              </td>
              <td className="px-4 py-3">
                <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button className="rounded p-1 hover:bg-muted" title="Edit"
                    onClick={() => navigate(`/exams/grades/${g.id}/edit`)}>
                    <Pencil className="h-3.5 w-3.5 text-muted-foreground" />
                  </button>
                  <button className="rounded p-1 hover:bg-rose-100" title="Delete">
                    <Trash2 className="h-3.5 w-3.5 text-rose-400" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="border-t border-border/40 bg-muted/20 px-4 py-3">
        <Button size="sm" variant="outline" className="h-8 text-[12px]" onClick={onAdd}>
          + Add Grade
        </Button>
      </div>
    </div>
  );
}
