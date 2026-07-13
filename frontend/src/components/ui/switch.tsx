import { cn } from "@/lib/utils";

export function Switch({
  checked,
  onCheckedChange,
  disabled,
  className,
  "aria-label": ariaLabel,
}: {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  disabled?: boolean;
  className?: string;
  "aria-label"?: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={ariaLabel}
      disabled={disabled}
      onClick={() => onCheckedChange(!checked)}
      className={cn(
        "relative inline-flex h-5 w-9 shrink-0 rounded-full border-2 border-transparent transition-colors duration-200",
        checked ? "bg-primary" : "bg-muted",
        disabled ? "cursor-not-allowed opacity-40" : "cursor-pointer",
        className,
      )}
    >
      <span
        className={cn(
          "pointer-events-none inline-block h-4 w-4 rounded-full bg-white shadow ring-0 transition-transform duration-200",
          checked ? "translate-x-4" : "translate-x-0",
        )}
      />
    </button>
  );
}
