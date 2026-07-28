import { cn } from "@/lib/utils";

export type StudentPillTone = "success" | "warning" | "danger" | "info" | "purple" | "neutral";

const TONE_CLASS: Record<StudentPillTone, string> = {
  success: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300",
  warning: "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300",
  danger: "bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300",
  info: "bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300",
  purple: "bg-violet-100 text-violet-700 dark:bg-violet-500/15 dark:text-violet-300",
  neutral: "bg-muted text-muted-foreground",
};

/** Small status pill shared across every student page (Active, Ongoing, Pass/Fail, ticket status…). */
export function StudentStatusPill({
  label,
  tone = "neutral",
  dot = false,
  className,
}: {
  label: string;
  tone?: StudentPillTone;
  dot?: boolean;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-medium",
        TONE_CLASS[tone],
        className,
      )}
    >
      {dot && <span className={cn("h-1.5 w-1.5 rounded-full", tone === "neutral" ? "bg-muted-foreground" : "bg-current")} />}
      {label}
    </span>
  );
}
