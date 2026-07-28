import type { ButtonHTMLAttributes } from "react";

import { cn } from "@/lib/utils";

/** Outline CTA — View Attendance, secondary actions next to a primary button. */
export function StudentSecondaryButton({ className, children, ...props }: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      className={cn(
        "inline-flex w-full items-center justify-center gap-1.5 rounded-xl border border-border/70 bg-card/60 px-3.5 py-2.5 text-[12.5px] font-medium text-foreground transition-colors hover:border-primary/40 hover:bg-primary/5 active:scale-[0.98]",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}
