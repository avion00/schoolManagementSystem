import { ArrowRight, type LucideIcon } from "lucide-react";
import { Link } from "react-router-dom";

import { PopNumber } from "@/components/motion";
import { cn } from "@/lib/utils";

export interface AttentionItem {
  id: string;
  label: string;
  value: string;
  linkLabel: string;
  to: string;
  icon: LucideIcon;
  tone: "rose" | "amber" | "blue" | "violet";
}

const toneMap: Record<AttentionItem["tone"], string> = {
  rose: "border-rose-500/30 bg-rose-500/[0.06] text-rose-700 dark:text-rose-400",
  amber: "border-amber-500/30 bg-amber-500/[0.06] text-amber-700 dark:text-amber-400",
  blue: "border-blue-500/30 bg-blue-500/[0.06] text-blue-700 dark:text-blue-400",
  violet: "border-violet-500/30 bg-violet-500/[0.06] text-violet-700 dark:text-violet-400",
};

/**
 * Urgent-tile row for "what needs attention now" — pending approvals, low
 * attendance alerts, overdue fees, etc. Distinct from StatCard (routine KPIs):
 * always tone-bordered and always links somewhere actionable.
 */
export function AttentionCard({ item }: { item: AttentionItem }) {
  const Icon = item.icon;
  return (
    <Link
      to={item.to}
      className={cn(
        "group flex flex-col gap-3 rounded-2xl border-2 p-4 shadow-elevated transition-all hover:shadow-lg",
        toneMap[item.tone],
      )}
    >
      <div className="flex items-center justify-between">
        <Icon className="h-5 w-5 shrink-0" />
        <span className="font-display text-2xl font-bold tabular-nums tracking-tight">
          <PopNumber value={item.value} />
        </span>
      </div>
      <div>
        <p className="text-sm font-semibold text-foreground">{item.label}</p>
        <span className="mt-1 inline-flex items-center gap-1 text-xs font-medium opacity-80 transition-transform group-hover:translate-x-0.5">
          {item.linkLabel}
          <ArrowRight className="h-3 w-3" />
        </span>
      </div>
    </Link>
  );
}
