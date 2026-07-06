import { useNavigate } from "react-router-dom";
import { Award, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card }   from "@/components/ui/card";
import { ExamGradeTable } from "@/components/exams/ExamGradeTable";
import { GradeBadge }     from "@/components/exams/GradeBadge";
import { GRADE_SCALE }    from "@/data/examsData";
import { cn } from "@/lib/utils";

const COLOR_BG: Record<string, string> = {
  emerald: "bg-emerald-500", green: "bg-green-500", teal: "bg-teal-500",
  blue: "bg-blue-500", cyan: "bg-cyan-500", amber: "bg-amber-500",
  orange: "bg-orange-500", rose: "bg-rose-500",
};

export function ExamGradesPage() {
  const navigate = useNavigate();
  const activeGrades = GRADE_SCALE.filter((g) => g.status === "active");
  const passGrades   = GRADE_SCALE.filter((g) => g.resultStatus === "Pass");
  const failGrades   = GRADE_SCALE.filter((g) => g.resultStatus === "Fail");

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Exam Grades</h1>
          <p className="text-[13px] text-muted-foreground mt-0.5">
            {GRADE_SCALE.length} grade levels · {activeGrades.length} active
          </p>
        </div>
        <Button size="sm" className="h-9 gap-1.5 text-[12px]" onClick={() => navigate("/exams/grades/new")}>
          <Plus className="h-3.5 w-3.5" />Add Grade
        </Button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Card className="p-4 text-center">
          <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">Total Grades</p>
          <p className="text-2xl font-bold text-foreground mt-1">{GRADE_SCALE.length}</p>
        </Card>
        <Card className="p-4 text-center">
          <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">Active</p>
          <p className="text-2xl font-bold text-emerald-600 mt-1">{activeGrades.length}</p>
        </Card>
        <Card className="p-4 text-center">
          <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">Pass Levels</p>
          <p className="text-2xl font-bold text-blue-600 mt-1">{passGrades.length}</p>
        </Card>
        <Card className="p-4 text-center">
          <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">Fail Levels</p>
          <p className="text-2xl font-bold text-rose-600 mt-1">{failGrades.length}</p>
        </Card>
      </div>

      {/* Visual scale bar */}
      <Card className="p-5">
        <h2 className="text-[13px] font-semibold text-foreground mb-4">Grade Scale Visual</h2>
        <div className="relative h-10 rounded-xl overflow-hidden flex">
          {GRADE_SCALE.map((g) => {
            const width = g.percentUpto - g.percentFrom + 1;
            return (
              <div
                key={g.id}
                className={cn("flex items-center justify-center text-[10px] font-bold text-white transition-all hover:opacity-90", COLOR_BG[g.colorLabel] ?? "bg-slate-400")}
                style={{ width: `${width}%` }}
                title={`${g.gradeName}: ${g.percentFrom}–${g.percentUpto}%`}
              >
                {g.gradeName}
              </div>
            );
          })}
        </div>
        <div className="flex justify-between mt-1 text-[10px] text-muted-foreground px-0.5">
          <span>0%</span>
          {GRADE_SCALE.map((g) => <span key={g.id}>{g.percentUpto}%</span>)}
        </div>
      </Card>

      {/* Grade badges legend */}
      <Card className="p-5">
        <h2 className="text-[13px] font-semibold text-foreground mb-3">Grade Summary</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
          {GRADE_SCALE.map((g) => (
            <div key={g.id}
              className={cn(
                "flex flex-col items-center gap-1.5 rounded-xl border p-3 text-center",
                g.resultStatus === "Pass"
                  ? "border-emerald-100 bg-emerald-50/40 dark:border-emerald-900 dark:bg-emerald-950/20"
                  : "border-rose-100 bg-rose-50/40 dark:border-rose-900 dark:bg-rose-950/20",
              )}>
              <GradeBadge grade={g.gradeName} />
              <p className="text-[11px] font-semibold text-foreground">{g.gradePoint.toFixed(2)} pts</p>
              <p className="text-[10px] text-muted-foreground">{g.percentFrom}–{g.percentUpto}%</p>
              <p className={cn("text-[10px] font-medium",
                g.resultStatus === "Pass" ? "text-emerald-600" : "text-rose-600")}>
                {g.comment}
              </p>
            </div>
          ))}
        </div>
      </Card>

      {/* Main table */}
      <Card className="p-5">
        <div className="flex items-center gap-2 mb-4">
          <Award className="h-4 w-4 text-muted-foreground" />
          <h2 className="text-[13px] font-semibold text-foreground">All Grade Scales</h2>
        </div>
        <ExamGradeTable grades={GRADE_SCALE} onAdd={() => navigate("/exams/grades/new")} />
      </Card>
    </div>
  );
}
