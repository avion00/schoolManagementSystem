import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

/** Label + control + hint/error row, for building forms consistently. */
export function FormField({
  label,
  hint,
  error,
  required,
  children,
  className,
}: {
  label: string;
  hint?: string;
  error?: string;
  required?: boolean;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <label className="mb-1.5 block text-[12px] font-medium text-foreground">
        {label}
        {required && <span className="ml-0.5 text-rose-500">*</span>}
      </label>
      {children}
      {hint && !error && <p className="mt-1 text-[11px] text-muted-foreground">{hint}</p>}
      {error && (
        <p className={cn("mt-1 text-[11px] text-rose-500")}>{error}</p>
      )}
    </div>
  );
}
