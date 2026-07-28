import type { ReactNode } from "react";
import { PlayCircle, type LucideIcon } from "lucide-react";

import { Reveal, TiltCard } from "@/components/motion";
import { StudentQuickActions, type StudentQuickAction } from "@/components/student/ui/StudentQuickActions";
import { StudentMetricCard } from "@/components/student/ui/StudentMetricCard";

export interface StudentHeroMetric {
  label: string;
  value: string | number;
  icon?: LucideIcon;
  iconCls?: string;
}

/**
 * The student "command center" hero — greeting, class/date meta, current
 * class status, a status pill, a mini progress summary row, and a quick
 * actions grid. Premium gradient-tinted spotlight panel with soft decorative
 * glow orbs, matching the tiered card system used across the page.
 */
export function StudentHeroCard({
  greeting,
  meta,
  statusLine,
  statusPill,
  metrics,
  actions,
}: {
  greeting: string;
  meta: string;
  statusLine?: string;
  statusPill?: ReactNode;
  metrics?: StudentHeroMetric[];
  actions?: StudentQuickAction[];
}) {
  return (
    <TiltCard max={1.5}>
      <Reveal>
        <div className="relative overflow-hidden rounded-3xl border border-primary/15 bg-gradient-to-br from-primary/[0.08] via-card to-violet-500/[0.06] p-6 shadow-[0_1px_2px_rgb(15_23_42/0.06),0_20px_44px_-20px_rgb(79_70_229/0.3)] dark:from-primary/[0.12] dark:via-card dark:to-violet-500/[0.08] dark:shadow-[0_1px_2px_rgb(0_0_0/0.4),0_20px_44px_-20px_rgb(99_102_241/0.3)] sm:p-8">
          {/* Decorative glow orbs */}
          <div className="pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full bg-primary/10 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-16 right-1/3 h-56 w-56 rounded-full bg-violet-500/10 blur-3xl" />
          <div className="pointer-events-none absolute -left-16 top-1/2 h-48 w-48 -translate-y-1/2 rounded-full bg-emerald-500/[0.06] blur-3xl" />

          <div className="relative flex flex-wrap items-start justify-between gap-3">
            <div>
              <h1 className="font-display text-2xl font-bold tracking-tight text-foreground sm:text-3xl">{greeting}</h1>
              <p className="mt-1 text-[13.5px] text-muted-foreground">{meta}</p>
              {statusLine && (
                <p className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-[12.5px] font-medium text-primary ring-1 ring-primary/15">
                  <PlayCircle className="h-3.5 w-3.5" />
                  {statusLine}
                </p>
              )}
            </div>
            {statusPill}
          </div>

          {metrics && metrics.length > 0 && (
            <div className="relative mt-6 grid grid-cols-2 gap-2.5 sm:grid-cols-3">
              {metrics.map((m) => (
                <StudentMetricCard key={m.label} label={m.label} value={m.value} icon={m.icon} iconCls={m.iconCls} spotlight />
              ))}
            </div>
          )}

          {actions && actions.length > 0 && (
            <div className="relative mt-6">
              <StudentQuickActions actions={actions} />
            </div>
          )}
        </div>
      </Reveal>
    </TiltCard>
  );
}
