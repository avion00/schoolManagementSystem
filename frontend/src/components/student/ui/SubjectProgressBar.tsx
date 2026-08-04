import { cn } from "@/lib/utils";

/** Thin animated progress bar shared by subject syllabus/score rows. */
export function SubjectProgressBar({ percent, colorCls = "bg-primary" }: { percent: number; colorCls?: string }) {
  return (
    <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
      <div
        className={cn("h-full rounded-full transition-all duration-700 ease-out", colorCls)}
        style={{ width: `${Math.min(100, Math.max(0, percent))}%` }}
      />
    </div>
  );
}
