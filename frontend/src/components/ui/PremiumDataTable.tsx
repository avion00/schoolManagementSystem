import { ChevronDown, ChevronUp, ChevronsUpDown } from "lucide-react";
import { useMemo, type CSSProperties, type ReactNode } from "react";
import type { LucideIcon } from "lucide-react";

import { Checkbox } from "@/components/ui/checkbox";
import { PremiumEmptyState } from "@/components/ui/PremiumEmptyState";
import { PremiumPagination } from "@/components/ui/PremiumPagination";
import { PremiumSkeleton } from "@/components/ui/PremiumSkeleton";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

export interface PremiumDataTableColumn<T> {
  key: string;
  header: ReactNode;
  render: (row: T) => ReactNode;
  width?: string;
  align?: "left" | "right" | "center";
  sortable?: boolean;
  /** Hidden from the visible column set — drive from a "Columns" PremiumDropdownMenu. */
  hidden?: boolean;
}

export interface PremiumDataTablePagination {
  page: number;
  pageSize: number;
  total: number;
  onPage: (page: number) => void;
  itemLabel?: string;
}

/**
 * The one reusable table shell for Students, Teachers, Parents, Billing,
 * Attendance, etc. Sticky header, click-to-sort columns, row selection with
 * a header select-all checkbox, per-row action slot (pair with
 * RowActionMenu), loading skeleton, empty state, optional built-in
 * pagination, a bulk-actions bar when rows are selected, and a staggered
 * row fade-in on first render.
 */
export function PremiumDataTable<T>({
  columns,
  rows,
  rowKey,
  loading = false,
  skeletonRows = 6,
  sortField,
  sortDir = "asc",
  onSort,
  selectable = false,
  selectedKeys,
  onSelectionChange,
  rowActions,
  emptyIcon,
  emptyTitle = "No records found",
  emptyDescription,
  emptyAction,
  bulkActions,
  pagination,
  stickyHeader = true,
  className,
}: {
  columns: PremiumDataTableColumn<T>[];
  rows: T[];
  rowKey: (row: T) => string | number;
  loading?: boolean;
  skeletonRows?: number;
  sortField?: string;
  sortDir?: "asc" | "desc";
  onSort?: (field: string) => void;
  selectable?: boolean;
  selectedKeys?: Set<string | number>;
  onSelectionChange?: (keys: Set<string | number>) => void;
  rowActions?: (row: T) => ReactNode;
  emptyIcon?: LucideIcon;
  emptyTitle?: string;
  emptyDescription?: string;
  emptyAction?: ReactNode;
  bulkActions?: (selectedCount: number, clear: () => void) => ReactNode;
  pagination?: PremiumDataTablePagination;
  stickyHeader?: boolean;
  className?: string;
}) {
  const visibleColumns = useMemo(() => columns.filter((c) => !c.hidden), [columns]);
  const keys = selectedKeys ?? new Set<string | number>();
  const pageKeys = useMemo(() => new Set(rows.map(rowKey)), [rows, rowKey]);
  const allSelected = pageKeys.size > 0 && [...pageKeys].every((k) => keys.has(k));
  const someSelected = [...pageKeys].some((k) => keys.has(k)) && !allSelected;
  const selectedOnPage = [...pageKeys].filter((k) => keys.has(k)).length;

  function toggleAll(checked: boolean) {
    if (!onSelectionChange) return;
    const next = new Set(keys);
    pageKeys.forEach((k) => (checked ? next.add(k) : next.delete(k)));
    onSelectionChange(next);
  }
  function toggleRow(key: string | number) {
    if (!onSelectionChange) return;
    const next = new Set(keys);
    next.has(key) ? next.delete(key) : next.add(key);
    onSelectionChange(next);
  }

  const totalCols = visibleColumns.length + (selectable ? 1 : 0) + (rowActions ? 1 : 0);

  return (
    <div className={cn("overflow-hidden rounded-2xl border border-neutral-200/80 bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-950", className)}>
      <div className="w-full overflow-x-auto">
        <Table className="w-full">
          <TableHeader className={cn(stickyHeader && "sticky top-0 z-10")}>
            <TableRow className="border-neutral-200/80 bg-neutral-50/70 hover:bg-neutral-50/70 dark:border-neutral-800 dark:bg-neutral-900/60">
              {selectable && (
                <TableHead className="w-10 pl-4">
                  <Checkbox
                    checked={allSelected ? true : someSelected ? "indeterminate" : false}
                    onCheckedChange={(v) => toggleAll(!!v)}
                    aria-label="Select all on this page"
                  />
                </TableHead>
              )}
              {visibleColumns.map((col) => {
                const active = sortField === col.key;
                const Icon = active ? (sortDir === "asc" ? ChevronUp : ChevronDown) : ChevronsUpDown;
                return (
                  <TableHead key={col.key} className={cn("select-none py-3", col.width, col.align === "right" && "text-right")}>
                    {col.sortable ? (
                      <button
                        type="button"
                        onClick={() => onSort?.(col.key)}
                        className={cn(
                          "flex items-center gap-1 text-left text-[11px] font-semibold uppercase tracking-wide transition-colors",
                          active ? "text-foreground" : "text-muted-foreground hover:text-foreground",
                        )}
                      >
                        {col.header}
                        <Icon className={cn("h-3 w-3 shrink-0", active ? "text-foreground" : "text-muted-foreground/40")} />
                      </button>
                    ) : (
                      <span className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">{col.header}</span>
                    )}
                  </TableHead>
                );
              })}
              {rowActions && <TableHead className="w-16 pr-4 text-right text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Actions</TableHead>}
            </TableRow>
          </TableHeader>

          <TableBody>
            {loading ? (
              Array.from({ length: skeletonRows }).map((_, i) => (
                <TableRow key={`skeleton-${i}`} className="border-neutral-200/70 dark:border-neutral-800/70">
                  {selectable && <TableCell className="pl-4"><PremiumSkeleton className="h-4 w-4 rounded" /></TableCell>}
                  {visibleColumns.map((col) => (
                    <TableCell key={col.key}><PremiumSkeleton className="h-4 w-full max-w-[140px]" /></TableCell>
                  ))}
                  {rowActions && <TableCell className="pr-4"><PremiumSkeleton className="ml-auto h-4 w-6" /></TableCell>}
                </TableRow>
              ))
            ) : rows.length === 0 ? (
              <TableRow className="border-neutral-200/70 dark:border-neutral-800/70">
                <TableCell colSpan={Math.max(totalCols, 1)} className="p-0">
                  <PremiumEmptyState icon={emptyIcon} title={emptyTitle} description={emptyDescription} action={emptyAction} />
                </TableCell>
              </TableRow>
            ) : (
              rows.map((row, i) => {
                const key = rowKey(row);
                const selected = keys.has(key);
                return (
                  <TableRow
                    key={key}
                    className={cn(
                      "t-row-in group border-neutral-200/70 transition-colors hover:bg-neutral-50/70 dark:border-neutral-800/70 dark:hover:bg-neutral-900/40",
                      selected && "bg-primary/[0.04] hover:bg-primary/[0.06]",
                    )}
                    style={{ "--row-index": i } as CSSProperties}
                  >
                    {selectable && (
                      <TableCell className="pl-4">
                        <Checkbox checked={selected} onCheckedChange={() => toggleRow(key)} aria-label={`Select row ${key}`} />
                      </TableCell>
                    )}
                    {visibleColumns.map((col) => (
                      <TableCell key={col.key} className={cn("py-3", col.align === "right" && "text-right")}>
                        {col.render(row)}
                      </TableCell>
                    ))}
                    {rowActions && (
                      <TableCell className="pr-4 text-right">
                        <div className="flex items-center justify-end">{rowActions(row)}</div>
                      </TableCell>
                    )}
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {bulkActions && selectedOnPage > 0 && (
        <div className="flex items-center gap-3 border-t border-neutral-200/80 bg-primary/5 px-4 py-2.5 dark:border-neutral-800">
          <span className="text-sm font-medium text-foreground">{selectedOnPage} selected</span>
          {bulkActions(selectedOnPage, () => onSelectionChange?.(new Set()))}
        </div>
      )}

      {pagination && pagination.total > pagination.pageSize && (
        <div className="border-t border-neutral-200/80 dark:border-neutral-800">
          <PremiumPagination {...pagination} />
        </div>
      )}
    </div>
  );
}
