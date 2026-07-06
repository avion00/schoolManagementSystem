import { type ReactNode } from "react";

/**
 * Page-level toolbar: shows an optional description line and action buttons.
 * The page title itself is displayed in the Shell header (not duplicated here).
 *
 * The `title` prop is accepted for backwards-compatibility but NOT rendered —
 * the Shell header already shows it via the breadcrumb system.
 */
export function PageHeader({
  description,
  children,
}: {
  title?: string;
  description?: string;
  children?: ReactNode;
}) {
  if (!description && !children) return null;
  return (
    <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
      {description && (
        <p className="text-sm text-muted-foreground">{description}</p>
      )}
      {children && <div className="flex items-center gap-2">{children}</div>}
    </div>
  );
}
