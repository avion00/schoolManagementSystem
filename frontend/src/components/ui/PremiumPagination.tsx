import { ChevronLeft, ChevronRight } from "lucide-react";

import { Button } from "@/components/ui/button";

/** Numbered pagination with ellipsis-collapsed pages, and a "Showing X–Y of Z" label. */
export function PremiumPagination({
  page,
  pageSize,
  total,
  onPage,
  itemLabel = "items",
}: {
  page: number;
  pageSize: number;
  total: number;
  onPage: (page: number) => void;
  itemLabel?: string;
}) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const from = Math.min((page - 1) * pageSize + 1, total);
  const to = Math.min(page * pageSize, total);

  const pages: (number | "…")[] = [];
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pages.push(i);
  } else {
    pages.push(1);
    if (page > 3) pages.push("…");
    for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) pages.push(i);
    if (page < totalPages - 2) pages.push("…");
    pages.push(totalPages);
  }

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 px-1 py-3">
      <p className="text-sm text-muted-foreground">
        Showing <span className="font-medium text-foreground">{from}–{to}</span> of{" "}
        <span className="font-medium text-foreground">{total}</span> {itemLabel}
      </p>
      <div className="flex items-center gap-1">
        <Button variant="outline" size="icon" className="h-8 w-8" disabled={page <= 1} onClick={() => onPage(page - 1)}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        {pages.map((p, i) =>
          p === "…" ? (
            <span key={`el-${i}`} className="px-2 text-sm text-muted-foreground">…</span>
          ) : (
            <Button key={p} variant={p === page ? "default" : "outline"} size="icon" className="h-8 w-8 text-xs" onClick={() => onPage(p)}>
              {p}
            </Button>
          ),
        )}
        <Button variant="outline" size="icon" className="h-8 w-8" disabled={page >= totalPages} onClick={() => onPage(page + 1)}>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
