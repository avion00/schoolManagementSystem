import { cn } from "@/lib/utils";

export type PremiumBadgeTone = "success" | "warning" | "danger" | "neutral" | "info" | "purple";

const TONE_CLASS: Record<PremiumBadgeTone, string> = {
  success: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300",
  warning: "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300",
  danger: "bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300",
  info: "bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300",
  purple: "bg-violet-100 text-violet-700 dark:bg-violet-500/15 dark:text-violet-300",
  neutral: "bg-muted text-muted-foreground",
};

/** Small pill for record state (Active/Inactive, Paid/Overdue, Open/Closed…). */
export function PremiumBadge({
  label,
  tone,
  className,
}: {
  label: string;
  tone: PremiumBadgeTone;
  className?: string;
}) {
  return (
    <span className={cn("inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-medium", TONE_CLASS[tone], className)}>
      {label}
    </span>
  );
}
