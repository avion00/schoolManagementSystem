import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

export interface FilterPillOption<T extends string> {
  value: T;
  label: string;
  icon?: ReactNode;
}

/** Segmented filter pill row — one active solid pill, the rest ghost/muted. */
export function FilterPillGroup<T extends string>({
  value,
  onChange,
  options,
  className,
}: {
  value: T;
  onChange: (v: T) => void;
  options: readonly FilterPillOption<T>[];
  className?: string;
}) {
  return (
    <div className={cn("flex flex-wrap items-center gap-1.5", className)}>
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          onClick={() => onChange(o.value)}
          className={cn(
            "flex shrink-0 items-center gap-1.5 rounded-xl px-3.5 py-2 text-[12.5px] font-medium transition-all active:scale-95",
            value === o.value
              ? "bg-primary text-primary-foreground shadow-sm"
              : "bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground",
          )}
        >
          {o.icon}
          {o.label}
        </button>
      ))}
    </div>
  );
}
