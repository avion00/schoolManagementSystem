import { useState, type ReactNode } from "react";
import { ChevronDown, type LucideIcon } from "lucide-react";

import { PremiumCard } from "@/components/ui/PremiumCard";
import { cn } from "@/lib/utils";

/**
 * Titled, collapsible card wrapper for grouping a set of FormField rows.
 * Canonical FormSection — previously duplicated as a separate, incompatible
 * component under components/students/forms/FormSection.tsx (collapsible +
 * errorCount but no action slot). Merged here so every form uses one
 * component: collapsible behavior + errorCount badge (from the students
 * variant) plus the action slot (from this file's original static version).
 */
export function FormSection({
  icon: Icon,
  title,
  subtitle,
  action,
  defaultOpen = true,
  errorCount = 0,
  children,
}: {
  icon: LucideIcon;
  title: string;
  subtitle?: string;
  action?: ReactNode;
  defaultOpen?: boolean;
  errorCount?: number;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <PremiumCard className="overflow-hidden">
      {/* ── Section header ────────────────────────────────────────────── */}
      <button
        type="button"
        className="flex w-full items-center gap-3 px-5 py-4 text-left transition-colors hover:bg-muted/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
      >
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-primary/10">
          <Icon className="h-4 w-4 text-primary" />
        </div>

        <div className="min-w-0 flex-1">
          <p className="font-display text-sm font-semibold leading-tight tracking-tight text-foreground">{title}</p>
          {subtitle && (
            <p className="mt-0.5 text-[11px] text-muted-foreground">{subtitle}</p>
          )}
        </div>

        {errorCount > 0 && (
          <span className="shrink-0 rounded-full bg-destructive px-2 py-0.5 text-[11px] font-bold text-destructive-foreground">
            {errorCount} error{errorCount > 1 ? "s" : ""}
          </span>
        )}

        {action && (
          <div className="shrink-0" onClick={(e) => e.stopPropagation()}>
            {action}
          </div>
        )}

        <ChevronDown
          className={cn(
            "h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200",
            open && "rotate-180",
          )}
        />
      </button>

      {/* ── Animated body ────────────────────────────────────────────── */}
      <div
        className={cn(
          "grid transition-all duration-300 ease-in-out",
          open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
        )}
      >
        <div className="overflow-hidden">
          <div className="border-t border-border/50 px-5 pb-6 pt-5">
            {children}
          </div>
        </div>
      </div>
    </PremiumCard>
  );
}
