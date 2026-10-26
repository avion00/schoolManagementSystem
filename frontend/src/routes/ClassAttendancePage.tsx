import { Layers, BarChart3, TrendingUp, TrendingDown } from "lucide-react";
import { Reveal } from "@/components/motion";
import { PremiumBadge } from "@/components/ui/PremiumBadge";
import { PremiumCard } from "@/components/ui/PremiumCard";
import { PremiumDataTable, type PremiumDataTableColumn } from "@/components/ui/PremiumDataTable";
import { KPITrendCard } from "@/components/ui/KPITrendCard";
import { METRIC_TONES } from "@/components/ui/MetricCard";
import { CATEGORICAL_COLORS, STATUS_COLORS } from "@/components/charts/palette";
import { useAttendanceStats, useClassComparison } from "@/api/attendance";
import type { ClassComparison as ApiRow } from "@/api/types/attendance";
import { PremiumEmptyState } from "@/components/ui/PremiumEmptyState";

type ClassComparison = ApiRow & { rate: number };
import { cn } from "@/lib/utils";


function classDetailColumns(avg: number): PremiumDataTableColumn<ClassComparison>[] {
  return [
    { key: "className", header: "Class", render: (c) => <span className="font-medium text-foreground">{c.className}</span> },
    { key: "section", header: "Section", render: (c) => <span className="text-muted-foreground">{c.section}</span> },
    { key: "students", header: "Students", align: "center", render: (c) => <span>{c.students}</span> },
    {
      key: "rate", header: "Rate", align: "center", render: (c) => (
        <span className={cn("font-bold", c.rate >= 90 ? "text-emerald-600" : c.rate >= 80 ? "text-amber-600" : "text-rose-600")}>
          {c.rate}%
        </span>
      ),
    },
    {
      key: "status", header: "Status", align: "center", render: (c) => (
        <PremiumBadge
          label={c.rate >= 90 ? "Excellent" : c.rate >= 80 ? "Good" : "Low"}
          tone={c.rate >= 90 ? "success" : c.rate >= 80 ? "warning" : "danger"}
        />
      ),
    },
    {
      key: "vsAverage", header: "vs Average", align: "right", render: (c) => {
        const diff = c.rate - avg;
        return (
          <span className={cn("font-semibold", diff >= 0 ? "text-emerald-600" : "text-rose-600")}>
            {diff >= 0 ? "+" : ""}{diff}%
          </span>
        );
      },
    },
  ];
}

export function ClassAttendancePage() {
  const comparison = useClassComparison();
  const statsQuery = useAttendanceStats();
  const MONTHLY_TREND = statsQuery.data?.trend ?? [];
  const monthLabel = new Date().toLocaleDateString("en", { month: "long", year: "numeric" });
  const CLASS_COMPARISON = (comparison.data ?? []).filter((c): c is ClassComparison => c.rate !== null);
  if (!comparison.isLoading && CLASS_COMPARISON.length === 0) {
    return <PremiumEmptyState title="No attendance recorded this month yet" description="Class rates appear once registers are taken." />;
  }
  const best  = [...CLASS_COMPARISON].sort((a, b) => b.rate - a.rate)[0];
  const worst = [...CLASS_COMPARISON].sort((a, b) => a.rate - b.rate)[0];
  const avg   = CLASS_COMPARISON.length ? Math.round(CLASS_COMPARISON.reduce((s, c) => s + c.rate, 0) / CLASS_COMPARISON.length) : 0;

  return (
    <div className="space-y-5">
      <Reveal>
        <h1 className="text-2xl font-bold text-foreground">Class-wise Attendance</h1>
        <p className="text-[13px] text-muted-foreground mt-0.5">Compare attendance rates across all classes</p>
      </Reveal>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Reveal delay={0}>
          <KPITrendCard
            label="School Average"
            value={`${avg}%`}
            icon={BarChart3}
            iconCls={METRIC_TONES.blue}
            sparklineColor={CATEGORICAL_COLORS[0]}
          />
        </Reveal>
        <Reveal delay={40}>
          <KPITrendCard
            label={`Best: ${best?.className ?? ""} ${best?.section ?? ""}`}
            value={`${best?.rate}%`}
            icon={TrendingUp}
            iconCls={METRIC_TONES.green}
            sparklineColor={STATUS_COLORS.good}
          />
        </Reveal>
        <Reveal delay={80}>
          <KPITrendCard
            label={`Needs attention: ${worst?.className ?? ""} ${worst?.section ?? ""}`}
            value={`${worst?.rate}%`}
            icon={TrendingDown}
            iconCls={METRIC_TONES.red}
            sparklineColor={STATUS_COLORS.critical}
          />
        </Reveal>
      </div>

      {/* Horizontal bar chart */}
      <Reveal delay={40}>
      <PremiumCard className="p-5">
        <div className="flex items-center gap-2 mb-4">
          <Layers className="h-4 w-4 text-muted-foreground" />
          <h2 className="text-[14px] font-semibold text-foreground">Attendance Rate by Class · {monthLabel}</h2>
        </div>
        <div className="space-y-4">
          {[...CLASS_COMPARISON].sort((a, b) => b.rate - a.rate).map((c) => (
            <div key={`${c.className}${c.section}`}>
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <span className="text-[13px] font-medium text-foreground">{c.className} {c.section}</span>
                  <span className="text-[11px] text-muted-foreground">({c.students} students)</span>
                </div>
                <span className={cn("text-[13px] font-bold",
                  c.rate >= 90 ? "text-emerald-600" : c.rate >= 80 ? "text-amber-600" : "text-rose-600"
                )}>{c.rate}%</span>
              </div>
              <div className="h-3 rounded-full bg-muted overflow-hidden">
                <div
                  className={cn("h-full rounded-full transition-all",
                    c.rate >= 90 ? "bg-emerald-500" : c.rate >= 80 ? "bg-amber-500" : "bg-rose-500"
                  )}
                  style={{ width: `${c.rate}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </PremiumCard>
      </Reveal>

      {/* Detail table */}
      <Reveal delay={80}>
      <PremiumCard className="overflow-hidden">
        <h2 className="px-5 pt-5 text-[14px] font-semibold text-foreground mb-4">Class Detail</h2>
        <PremiumDataTable columns={classDetailColumns(avg)} rows={CLASS_COMPARISON} rowKey={(c) => `${c.className}${c.section}`} stickyHeader={false} />
      </PremiumCard>
      </Reveal>

      {/* Monthly trend mini */}
      <Reveal delay={120}>
      <PremiumCard className="p-5">
        <h2 className="text-[14px] font-semibold text-foreground mb-4">School-wide Monthly Trend</h2>
        <div className="flex items-end gap-4 h-28">
          {MONTHLY_TREND.map((pt) => {
            const height = `${pt.presentRate ?? 0}%`;
            const isCurrent = pt === MONTHLY_TREND[MONTHLY_TREND.length - 1];
            return (
              <div key={pt.month} className="flex-1 flex flex-col items-center gap-1">
                <span className="text-[10px] font-semibold text-foreground">{pt.presentRate === null ? "—" : `${pt.presentRate}%`}</span>
                <div className="w-full flex items-end" style={{ height: "72px" }}>
                  <div
                    className={cn("w-full rounded-t-md", isCurrent ? "bg-indigo-500" : "bg-indigo-200 dark:bg-indigo-800")}
                    style={{ height }}
                  />
                </div>
                <span className="text-[9px] text-muted-foreground text-center">{pt.month}</span>
              </div>
            );
          })}
        </div>
      </PremiumCard>
      </Reveal>
    </div>
  );
}
