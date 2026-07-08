import { useEffect, useRef, useState, type ReactNode } from "react";

import { cn } from "@/lib/utils";

/** Label + error text + a shake replay tied to each submit attempt (shared by billing forms). */
export function FormField({
  id, label, required, error, attempt, children, className,
}: {
  id: string; label: string; required?: boolean; error?: string; attempt: number; children: ReactNode; className?: string;
}) {
  const [shake, setShake] = useState(false);
  const mounted = useRef(false);

  useEffect(() => {
    if (!mounted.current) { mounted.current = true; return; }
    if (error) {
      setShake(true);
      const t = setTimeout(() => setShake(false), 450);
      return () => clearTimeout(t);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [attempt]);

  return (
    <div className={cn("flex flex-col gap-1.5", shake && "t-shake", className)} data-field={id}>
      <label htmlFor={id} className="text-[12px] font-medium text-foreground">
        {label}{required && <span className="ml-0.5 text-rose-500">*</span>}
      </label>
      {children}
      {error && <p className="text-[11px] text-rose-500">{error}</p>}
    </div>
  );
}

export const fieldInputClass = (hasError?: boolean) => cn(
  "h-9 w-full rounded-lg border border-input bg-background px-3 text-[12px] text-foreground shadow-sm",
  "focus:outline-none focus:ring-1 focus:ring-ring",
  hasError && "border-rose-400",
);

export function scrollToFirstError(errors: Record<string, string | undefined>) {
  const firstKey = Object.keys(errors).find((k) => errors[k]);
  if (firstKey) {
    document.querySelector(`[data-field="${firstKey}"]`)?.scrollIntoView({ behavior: "smooth", block: "center" });
  }
}
