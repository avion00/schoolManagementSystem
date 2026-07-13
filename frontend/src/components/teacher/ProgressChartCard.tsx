import type { LucideIcon } from "lucide-react";

import { PremiumCard } from "@/components/ui/PremiumCard";

export interface ProgressRow {
  label: string;
  value: number;
  sublabel?: string;
}

/** Generic titled card of labeled progress bars — syllabus coverage, homework completion, lesson-plan status, etc. */
export function ProgressChartCard({
  title,
  icon: Icon,
  rows,
}: {
  title: string;
  icon?: LucideIcon;
  rows: ProgressRow[];
}) {
  return (
    <PremiumCard className="p-5">
      <div className="mb-3 flex items-center gap-2">
        {Icon && <Icon className="h-4 w-4 text-muted-foreground" />}
        <h2 className="text-[13.5px] font-semibold text-foreground">{title}</h2>
      </div>
      <div className="space-y-3">
        {rows.map((row) => (
          <div key={row.label}>
            <div className="mb-1 flex items-center justify-between text-[12.5px]">
              <span className="font-medium text-foreground">{row.label}</span>
              <span className="text-muted-foreground">{row.sublabel ? `${row.sublabel} · ` : ""}{row.value}%</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-muted/60">
              <div className="h-full rounded-full bg-primary transition-all duration-500" style={{ width: `${row.value}%` }} />
            </div>
          </div>
        ))}
      </div>
    </PremiumCard>
  );
}
