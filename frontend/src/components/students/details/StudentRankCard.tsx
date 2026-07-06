import { TrendingUp } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { RankInfo } from "@/data/studentDetailsData";
import { cn } from "@/lib/utils";

function RankBadge({ rank, total, label }: { rank: number; total: number; label: string }) {
  const pct = ((total - rank + 1) / total) * 100;
  return (
    <div className="flex flex-col items-center rounded-2xl border border-border/60 bg-muted/30 p-4 text-center">
      <span className="text-3xl font-extrabold text-foreground">#{rank}</span>
      <span className="mt-0.5 text-xs text-muted-foreground">of {total}</span>
      <span className="mt-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">{label}</span>
      <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-muted">
        <div className="h-full rounded-full bg-primary" style={{ width: `${pct.toFixed(0)}%` }} />
      </div>
      <span className="mt-1 text-[10px] text-muted-foreground">Top {(100 - pct + 1).toFixed(0)}%</span>
    </div>
  );
}

function TagList({ items, color }: { items: string[]; color: string }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {items.map((item) => (
        <span key={item} className={cn("rounded-full px-2.5 py-0.5 text-[11px] font-medium", color)}>
          {item}
        </span>
      ))}
    </div>
  );
}

export function StudentRankCard({ rank }: { rank: RankInfo }) {
  const perfColor =
    rank.overallPerformance === "Excellent" ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400" :
    rank.overallPerformance === "Good"      ? "bg-blue-500/10 text-blue-700 dark:text-blue-400" :
    rank.overallPerformance === "Average"   ? "bg-amber-500/10 text-amber-700 dark:text-amber-400" :
    "bg-rose-500/10 text-rose-700 dark:text-rose-400";

  return (
    <Card className="rounded-2xl shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between text-sm font-semibold">
          <span className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-primary" />
            Rank & Performance
          </span>
          <span className={cn("rounded-full px-2.5 py-0.5 text-[11px] font-bold", perfColor)}>
            {rank.overallPerformance}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* Rank cards */}
        <div className="grid grid-cols-2 gap-3">
          <RankBadge rank={rank.classRank}   total={rank.classTotalStudents}   label="Class Rank" />
          <RankBadge rank={rank.sectionRank} total={rank.sectionTotalStudents} label="Section Rank" />
        </div>

        {/* Average score */}
        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Average Score</p>
            <p className="text-sm font-bold text-foreground">{rank.averageScore}%</p>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary transition-all duration-700"
              style={{ width: `${rank.averageScore}%` }}
            />
          </div>
        </div>

        {/* Strengths */}
        <div className="space-y-2">
          <p className="text-[10.5px] font-semibold uppercase tracking-wide text-muted-foreground">Strengths</p>
          <TagList items={rank.strengths} color="bg-emerald-500/10 text-emerald-700 dark:text-emerald-400" />
        </div>

        {/* Needs improvement */}
        <div className="space-y-2">
          <p className="text-[10.5px] font-semibold uppercase tracking-wide text-muted-foreground">Needs Improvement</p>
          <TagList items={rank.improvements} color="bg-amber-500/10 text-amber-700 dark:text-amber-400" />
        </div>
      </CardContent>
    </Card>
  );
}
