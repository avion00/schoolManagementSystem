import { Link } from "react-router-dom";
import { Layers } from "lucide-react";

import { Reveal } from "@/components/motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Student } from "@/data/studentsData";
import { cn } from "@/lib/utils";

const ROW_TONES = [
  "bg-blue-100 text-blue-600 dark:bg-blue-500/15 dark:text-blue-300",
  "bg-emerald-100 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-300",
  "bg-violet-100 text-violet-600 dark:bg-violet-500/15 dark:text-violet-300",
  "bg-amber-100 text-amber-600 dark:bg-amber-500/15 dark:text-amber-300",
  "bg-cyan-100 text-cyan-600 dark:bg-cyan-500/15 dark:text-cyan-300",
];
const BAR_TONES = ["bg-blue-500", "bg-emerald-500", "bg-violet-500", "bg-amber-500", "bg-cyan-500"];

export function StudentsByClassCard({ students }: { students: Student[] }) {
  const groups = new Map<string, number>();
  for (const s of students) {
    const key = s.section ? `${s.className} · Section ${s.section}` : s.className;
    groups.set(key, (groups.get(key) ?? 0) + 1);
  }
  const rows = [...groups.entries()]
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);
  const max = Math.max(...rows.map((r) => r.count), 1);

  return (
    <Reveal className="h-full">
      <Card className="h-full rounded-2xl border-border/60 shadow-elevated">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="font-display text-[15px] font-semibold">Students by Class</CardTitle>
          <Link to="/classes" className="text-[12.5px] font-medium text-primary hover:underline">
            View All
          </Link>
        </CardHeader>
        <CardContent className="space-y-4">
          {rows.map((r, i) => (
            <div key={r.label} className="flex items-center gap-3">
              <span className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-lg", ROW_TONES[i % ROW_TONES.length])}>
                <Layers className="h-4 w-4" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[13px] font-medium text-foreground">{r.label}</p>
                <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className={cn("h-full rounded-full transition-all", BAR_TONES[i % BAR_TONES.length])}
                    style={{ width: `${Math.round((r.count / max) * 100)}%` }}
                  />
                </div>
              </div>
              <span className="shrink-0 text-[13px] font-semibold tabular-nums text-foreground">{r.count}</span>
              <span className="w-9 shrink-0 text-right text-[12px] tabular-nums text-muted-foreground">
                {students.length ? Math.round((r.count / students.length) * 100) : 0}%
              </span>
            </div>
          ))}
        </CardContent>
      </Card>
    </Reveal>
  );
}
