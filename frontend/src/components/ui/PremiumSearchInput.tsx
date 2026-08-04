import { Search, X } from "lucide-react";

import { cn } from "@/lib/utils";

/**
 * Apple-like search field: leading search icon, animated clear button that
 * fades + scales in only once there's a value (transitions.dev clear-dissolve
 * feel, in a lighter-weight CSS-only form than the full canvas glow effect).
 */
export function PremiumSearchInput({
  value,
  onChange,
  placeholder = "Search by name, admission no, reg no, guardian…",
  hint,
  className,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  /** Optional trailing keyboard-shortcut badge (e.g. "⌘ K") shown when the field is empty. */
  hint?: string;
  className?: string;
}) {
  const hasValue = value.length > 0;
  return (
    <div className={cn("relative", className)}>
      <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={cn(
          "h-11 w-full rounded-xl border border-neutral-200 bg-white pl-10 text-[13px] text-foreground shadow-sm",
          "placeholder:text-muted-foreground/70 transition-shadow",
          "focus:outline-none focus:ring-2 focus:ring-ring",
          "dark:border-neutral-800 dark:bg-neutral-950",
          hasValue ? "pr-9" : hint ? "pr-14" : "pr-3.5",
        )}
      />
      {hint && !hasValue && (
        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 rounded-md border border-border/60 bg-muted/60 px-1.5 py-0.5 text-[10.5px] font-medium text-muted-foreground">
          {hint}
        </span>
      )}
      <button
        type="button"
        tabIndex={hasValue ? 0 : -1}
        aria-hidden={!hasValue}
        onClick={() => onChange("")}
        className={cn(
          "t-clear-btn absolute right-2.5 top-1/2 -translate-y-1/2 rounded-full p-1 text-muted-foreground hover:bg-accent hover:text-foreground",
          hasValue && "is-visible",
        )}
        aria-label="Clear search"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
