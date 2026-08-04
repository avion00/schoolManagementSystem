import type { LucideIcon } from "lucide-react";

import { IconTile, type IconTileTone } from "@/components/student/ui/IconTile";

/** Compact icon + big number + label tile — used for "Today's Summary"-style mini stat grids. */
export function SummaryMiniCard({
  icon,
  tone,
  value,
  label,
}: {
  icon: LucideIcon;
  tone: IconTileTone;
  value: number | string;
  label: string;
}) {
  return (
    <div className="flex flex-col items-center gap-1.5 rounded-xl border border-border/60 bg-card p-3 text-center shadow-elevated">
      <IconTile icon={icon} tone={tone} size="sm" />
      <span className="font-display text-lg font-bold text-foreground">{value}</span>
      <span className="text-[10.5px] text-muted-foreground">{label}</span>
    </div>
  );
}
