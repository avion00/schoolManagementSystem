import type { ButtonHTMLAttributes } from "react";

import { cn } from "@/lib/utils";

/** Solid gradient CTA — Pay Fees, primary confirm actions. */
export function StudentPrimaryButton({ className, children, ...props }: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      className={cn(
        "t-lift inline-flex w-full items-center justify-center gap-1.5 rounded-xl bg-gradient-to-b from-primary to-primary/90 px-3.5 py-2.5 text-[12.5px] font-semibold text-primary-foreground shadow-[0_1px_2px_rgb(0_0_0/0.08),0_8px_16px_-8px_rgb(79_70_229/0.5)] transition-all hover:shadow-[0_1px_2px_rgb(0_0_0/0.08),0_10px_20px_-8px_rgb(79_70_229/0.6)] active:scale-[0.98]",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}
