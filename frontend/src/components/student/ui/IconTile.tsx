import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

export type IconTileTone = "violet" | "emerald" | "amber" | "blue" | "rose" | "teal" | "slate";

const TONE_CLASS: Record<IconTileTone, string> = {
  violet: "bg-violet-100 text-violet-600 dark:bg-violet-500/15 dark:text-violet-300",
  emerald: "bg-emerald-100 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-300",
  amber: "bg-amber-100 text-amber-600 dark:bg-amber-500/15 dark:text-amber-300",
  blue: "bg-blue-100 text-blue-600 dark:bg-blue-500/15 dark:text-blue-300",
  rose: "bg-rose-100 text-rose-600 dark:bg-rose-500/15 dark:text-rose-300",
  teal: "bg-teal-100 text-teal-600 dark:bg-teal-500/15 dark:text-teal-300",
  slate: "bg-slate-100 text-slate-600 dark:bg-slate-500/15 dark:text-slate-300",
};

const SIZE_CLASS = {
  sm: { box: "h-8 w-8 rounded-lg", icon: "h-4 w-4" },
  md: { box: "h-10 w-10 rounded-xl", icon: "h-5 w-5" },
  lg: { box: "h-12 w-12 rounded-xl", icon: "h-6 w-6" },
};

/** Small colored icon chip shared by subject rows, quick links, and info-card headers. */
export function IconTile({
  icon: Icon,
  tone = "slate",
  size = "md",
  className,
}: {
  icon: LucideIcon;
  tone?: IconTileTone;
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const s = SIZE_CLASS[size];
  return (
    <span className={cn("flex shrink-0 items-center justify-center", s.box, TONE_CLASS[tone], className)}>
      <Icon className={s.icon} />
    </span>
  );
}
