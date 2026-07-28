import type { ReactNode } from "react";

import { MiniSparkline } from "@/components/charts/MiniSparkline";
import { Reveal } from "@/components/motion";
import { cn } from "@/lib/utils";

export interface StudentProgressBar {
  label: string;
  value: number;
  suffix?: string;
  colorCls?: string;
}

/** Ring/percentage meter — small SVG circle, no chart library needed. */
export function StudentRingStat({
  percent,
  label,
  size = 80,
  strokeCls = "stroke-primary",
}: {
  percent: number;
  label?: string;
  size?: number;
  strokeCls?: string;
}) {
  const r = (size - 10) / 2;
  const circumference = 2 * Math.PI * r;
  const offset = circumference * (1 - Math.min(100, Math.max(0, percent)) / 100);
  return (
    <div className="relative shrink-0 drop-shadow-sm" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} strokeWidth={7} className="fill-none stroke-muted" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          strokeWidth={7}
          strokeLinecap="round"
          className={cn("fill-none transition-all duration-700 ease-out", strokeCls)}
          style={{ strokeDasharray: circumference, strokeDashoffset: offset }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-display text-base font-bold tracking-tight text-foreground">{percent}%</span>
        {label && <span className="text-[9px] text-muted-foreground">{label}</span>}
      </div>
    </div>
  );
}

/** Card shell with a title + list of thin progress bars — learning progress, attendance breakdown, etc. */
export function StudentProgressCard({
  title,
  icon,
  action,
  bars,
  trendData,
  trendColor = "#6366f1",
  footer,
  className,
}: {
  title: string;
  icon?: ReactNode;
  action?: ReactNode;
  bars?: StudentProgressBar[];
  /** Optional decorative sparkline rendered beside the title (e.g. recent performance trend). */
  trendData?: Record<string, number>[];
  trendColor?: string;
  footer?: ReactNode;
  className?: string;
}) {
  return (
    <Reveal className={cn("h-full", className)}>
      <div className="h-full rounded-2xl border border-border/60 bg-card p-4 shadow-elevated sm:p-5">
        <div className="mb-3.5 flex items-center justify-between gap-3">
          <p className="flex items-center gap-2 font-display text-[14px] font-semibold text-foreground">
            {icon}
            {title}
          </p>
          {action ?? (trendData && <MiniSparkline data={trendData} color={trendColor} width={72} height={28} />)}
        </div>
        <div className="space-y-3.5">
          {bars?.map((b) => (
            <div key={b.label}>
              <div className="mb-1.5 flex items-center justify-between text-[12.5px]">
                <span className="font-medium text-foreground">{b.label}</span>
                <span className="tabular-nums text-muted-foreground">{b.value}{b.suffix ?? "%"}</span>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className={cn("h-full rounded-full transition-all duration-700 ease-out", b.colorCls ?? "bg-primary")}
                  style={{ width: `${Math.min(100, Math.max(0, b.value))}%` }}
                />
              </div>
            </div>
          ))}
          {footer}
        </div>
      </div>
    </Reveal>
  );
}
