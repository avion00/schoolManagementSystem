import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Award, CheckCircle2, Plus, TrendingDown, TrendingUp } from "lucide-react";
import { Reveal } from "@/components/motion";
import { Button } from "@/components/ui/button";
import { KPITrendCard } from "@/components/ui/KPITrendCard";
import { METRIC_TONES } from "@/components/ui/MetricCard";
import { PremiumCard } from "@/components/ui/PremiumCard";
import { ExamGradeTable } from "@/components/exams/ExamGradeTable";
import { GradeBadge }     from "@/components/exams/GradeBadge";
import { useGradeScales, useSaveScale } from "@/api/exams";
import { errorMessage } from "@/api/http";
import { PremiumEmptyState } from "@/components/ui/PremiumEmptyState";
import { PremiumSelect } from "@/components/ui/PremiumSelect";
import { PremiumSkeleton } from "@/components/ui/PremiumSkeleton";
import { useAuth } from "@/lib/auth";
import { toast } from "sonner";
import { cn } from "@/lib/utils";


const COLOR_BG: Record<string, string> = {
  emerald: "bg-emerald-500", green: "bg-green-500", teal: "bg-teal-500",
  blue: "bg-blue-500", cyan: "bg-cyan-500", amber: "bg-amber-500",
  orange: "bg-orange-500", rose: "bg-rose-500",
};

export function ExamGradesPage() {
  const navigate = useNavigate();
  const query = useGradeScales();
  const saveScale = useSaveScale();
  const { hasPermission } = useAuth();
  const canManage = hasPermission("exam.create");
  const [scaleId, setScaleId] = useState("");
  const scales = query.data ?? [];
  const scale = scales.find((sc) => sc.id === scaleId) ?? scales[0];
  // Low to high for the visual bar.
  const GRADE_SCALE = [...(scale?.bands ?? [])].sort((a, b) => a.percentFrom - b.percentFrom);
  const passGrades   = GRADE_SCALE.filter((g) => g.resultStatus === "Pass");
  const failGrades   = GRADE_SCALE.filter((g) => g.resultStatus === "Fail");

  return (
    <div className="space-y-5">
      {/* Header */}
      <Reveal className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Exam Grades</h1>
          <p className="text-[13px] text-muted-foreground mt-0.5">
            {scales.length} scale{scales.length === 1 ? "" : "s"} · {GRADE_SCALE.length} grade levels{scale ? ` in ${scale.name}` : ""}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {scales.length > 1 && (
            <PremiumSelect value={scale?.id ?? ""} onChange={setScaleId} className="w-48"
              options={scales.map((sc) => ({ value: sc.id, label: sc.name }))} />
          )}
          {canManage && (
          <Button size="sm" variant="outline" className="h-9 rounded-xl text-[12px]" onClick={() => {
            const name = window.prompt("Name for the new grade scale");
            if (!name?.trim()) return;
            saveScale.mutate(name.trim(), {
              onSuccess: (sc) => { setScaleId(sc.id); toast.success("Grade scale created."); },
              onError: (e) => toast.error(errorMessage(e)),
            });
          }}>New Scale</Button>
          )}
          {canManage && scale && (
          <Button size="sm" className="h-9 gap-1.5 rounded-xl text-[12px]" onClick={() => navigate(`/exams/grades/new?scale=${scale.id}`)}>
            <Plus className="h-3.5 w-3.5" />Add Grade
          </Button>
          )}
        </div>
      </Reveal>

      {query.isError && <PremiumEmptyState title="Couldn't load grade scales" description={errorMessage(query.error)} />}
      {query.isLoading && <PremiumSkeleton className="h-72 w-full rounded-2xl" />}
      {query.isSuccess && scales.length === 0 && (
        <PremiumEmptyState title="No grade scales yet" description="Create a scale, then add its grade bands. Exams use a scale to grade results." />
      )}
      {scale && (<>

      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Reveal delay={0}>
          <KPITrendCard
            label="Grade Levels"
            value={GRADE_SCALE.length}
            icon={Award}
            iconCls={METRIC_TONES.blue}
          />
        </Reveal>
        <Reveal delay={40}>
          <KPITrendCard
            label="Top GPA"
            value={GRADE_SCALE.length ? Math.max(...GRADE_SCALE.map((g) => g.gradePoint)).toFixed(2) : "—"}
            icon={CheckCircle2}
            iconCls={METRIC_TONES.green}
          />
        </Reveal>
        <Reveal delay={80}>
          <KPITrendCard
            label="Pass Levels"
            value={passGrades.length}
            icon={TrendingUp}
            iconCls={METRIC_TONES.green}
          />
        </Reveal>
        <Reveal delay={120}>
          <KPITrendCard
            label="Fail Levels"
            value={failGrades.length}
            icon={TrendingDown}
            iconCls={METRIC_TONES.red}
          />
        </Reveal>
      </div>

      {/* Visual scale bar */}
      <PremiumCard className="p-5">
        <h2 className="text-[13px] font-semibold text-foreground mb-4">Grade Scale Visual</h2>
        <div className="relative h-10 rounded-xl overflow-hidden flex">
          {GRADE_SCALE.map((g) => {
            const width = Math.max(0, Math.round(g.percentUpto) - g.percentFrom) + 1;
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
          {GRADE_SCALE.map((g) => <span key={g.id}>{Math.round(g.percentUpto)}%</span>)}
        </div>
      </PremiumCard>

      {/* Grade badges legend */}
      <PremiumCard className="p-5">
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
      </PremiumCard>

      {/* Main table */}
      <PremiumCard className="p-5">
        <div className="flex items-center gap-2 mb-4">
          <Award className="h-4 w-4 text-muted-foreground" />
          <h2 className="text-[13px] font-semibold text-foreground">All Grade Scales</h2>
        </div>
        <ExamGradeTable grades={[...GRADE_SCALE].reverse()} canManage={canManage} />
      </PremiumCard>
      </>)}
    </div>
  );
}
