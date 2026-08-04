import type { LucideIcon } from "lucide-react";

import { Reveal } from "@/components/motion";
import { cn } from "@/lib/utils";

export type StudentIconStatTone = "purple" | "blue" | "green" | "orange";

const TONE_CLASS: Record<StudentIconStatTone, string> = {
  purple: "bg-violet-100 text-violet-600 dark:bg-violet-500/15 dark:text-violet-300",
  blue: "bg-blue-100 text-blue-600 dark:bg-blue-500/15 dark:text-blue-300",
  green: "bg-emerald-100 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-300",
  orange: "bg-orange-100 text-orange-600 dark:bg-orange-500/15 dark:text-orange-300",
};

/** Icon-left stat tile — large circular icon beside a big number, label, and subtitle. */
export function StudentIconStatCard({
  icon: Icon,
  tone,
  value,
  label,
  subtitle,
}: {
  icon: LucideIcon;
  tone: StudentIconStatTone;
  value: number | string;
  label: string;
  subtitle: string;
}) {
  return (
    <Reveal>
      <div className="t-lift flex items-center gap-3.5 rounded-2xl border border-border/60 bg-card p-4 shadow-elevated transition-all hover:-translate-y-0.5 hover:shadow-md sm:p-5">
        <span className={cn("flex h-14 w-14 shrink-0 items-center justify-center rounded-full", TONE_CLASS[tone])}>
          <Icon className="h-6 w-6" />
        </span>
        <div className="min-w-0">
          <p className="font-display text-2xl font-bold text-foreground">{value}</p>
          <p className="text-[13px] font-medium leading-snug text-foreground">{label}</p>
          <p className="text-[11.5px] leading-snug text-muted-foreground">{subtitle}</p>
        </div>
      </div>
    </Reveal>
  );
}
