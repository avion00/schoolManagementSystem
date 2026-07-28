import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

interface PageSectionProps {
  title?: string;
  icon?: LucideIcon;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}

/**
 * Lightweight section divider for grouping content blocks on non-form pages
 * (Dashboard rows, detail-page tab panels) — a small uppercase label + icon,
 * not a card. For form fields use FormSection; for read-only card content
 * use DetailCard.
 */
export function PageSection({ title, icon: Icon, action, children, className }: PageSectionProps) {
  return (
    <div className={className}>
      {title && (
        <div className="mb-2.5 flex items-center justify-between gap-2">
          <h2 className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.09em] text-muted-foreground/70">
            {Icon && <Icon className="h-3.5 w-3.5" />}
            {title}
          </h2>
          {action}
        </div>
      )}
      {children}
    </div>
  );
}
