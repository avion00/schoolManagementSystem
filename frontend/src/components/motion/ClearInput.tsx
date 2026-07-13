import { X, type LucideIcon } from "lucide-react";
import { forwardRef } from "react";

import { cn } from "@/lib/utils";

/**
 * Controlled text input with an animated clear button that fades/scales in
 * once there's a value. Use for search bars, filter fields, toolbar search.
 */
export const ClearInput = forwardRef<HTMLInputElement, {
  value: string;
  onChange: (value: string) => void;
  onClear?: () => void;
  placeholder?: string;
  icon?: LucideIcon;
  className?: string;
  inputClassName?: string;
}>(function ClearInput({ value, onChange, onClear, placeholder, icon: Icon, className, inputClassName }, ref) {
  const hasValue = value.length > 0;
  return (
    <div className={cn("relative", className)}>
      {Icon && (
        <Icon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      )}
      <input
        ref={ref}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={cn(
          "h-9 w-full rounded-xl border border-input bg-background text-[13px] text-foreground placeholder:text-muted-foreground/70",
          "transition-shadow focus:outline-none focus:ring-2 focus:ring-ring/50",
          Icon ? "pl-9" : "pl-3.5",
          hasValue ? "pr-9" : "pr-3.5",
          inputClassName,
        )}
      />
      <button
        type="button"
        tabIndex={hasValue ? 0 : -1}
        aria-hidden={!hasValue}
        onClick={() => { onChange(""); onClear?.(); }}
        className={cn(
          "t-clear-btn absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-1 text-muted-foreground hover:bg-accent hover:text-foreground",
          hasValue && "is-visible",
        )}
        aria-label="Clear"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
});
