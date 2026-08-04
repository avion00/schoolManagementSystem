import type { LucideIcon } from "lucide-react";
import { Sparkles } from "lucide-react";

import { StudentInsightCard } from "@/components/student/ui/StudentInsightCard";
import { StudentSectionHeader } from "@/components/student/ui/StudentSectionHeader";
import { StudentStatusPill, type StudentPillTone } from "@/components/student/ui/StudentStatusPill";
import { cn } from "@/lib/utils";

export interface StudentQuickInsight {
  id: string;
  icon: LucideIcon;
  iconCls?: string;
  title: string;
  description: string;
  badge: string;
  badgeTone: StudentPillTone;
}

/** A short, scannable list of contextual callouts — streaks, patterns, upcoming reviews, tips. */
export function StudentQuickInsightsCard({ insights }: { insights: StudentQuickInsight[] }) {
  return (
    <StudentInsightCard className="p-4 sm:p-5">
      <StudentSectionHeader icon={Sparkles} title="Quick Insights" />
      <div className="space-y-2.5">
        {insights.map((ins) => (
          <div key={ins.id} className="flex items-start justify-between gap-3 rounded-xl bg-muted/30 p-3">
            <div className="flex min-w-0 items-start gap-2.5">
              <span className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary", ins.iconCls)}>
                <ins.icon className="h-4 w-4" />
              </span>
              <div className="min-w-0">
                <p className="text-[13px] font-semibold text-foreground">{ins.title}</p>
                <p className="text-[11.5px] text-muted-foreground">{ins.description}</p>
              </div>
            </div>
            <StudentStatusPill label={ins.badge} tone={ins.badgeTone} className="shrink-0" />
          </div>
        ))}
      </div>
    </StudentInsightCard>
  );
}
