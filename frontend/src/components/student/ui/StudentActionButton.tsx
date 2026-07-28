import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

/** One compact icon action button — used in rows/grids via StudentQuickActions. */
export function StudentActionButton({
  label,
  icon: Icon,
  onClick,
  tone = "primary",
}: {
  label: string;
  icon: LucideIcon;
  onClick?: () => void;
  tone?: "primary" | "neutral";
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "t-lift group relative flex flex-col items-center gap-2 overflow-hidden rounded-2xl border px-3 py-4 text-center shadow-sm transition-all",
        tone === "primary"
          ? "border-border/60 bg-card/80 hover:border-primary/40 hover:bg-primary/[0.06] hover:shadow-md"
          : "border-border/60 bg-card/80 hover:border-border hover:bg-muted/60 hover:shadow-md",
      )}
    >
      <span
        className={cn(
          "flex h-9 w-9 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-110",
          tone === "primary" ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground",
        )}
      >
        <Icon className="h-[18px] w-[18px]" />
      </span>
      <span className="text-[12px] font-medium leading-tight text-foreground">{label}</span>
    </button>
  );
}
