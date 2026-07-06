import { useState, useMemo, useCallback } from "react";
import { LayoutGrid, List } from "lucide-react";
import { NoticeSummaryCards } from "@/components/notices/NoticeSummaryCards";
import { NoticeToolbar, EMPTY_FILTERS } from "@/components/notices/NoticeToolbar";
import { NoticeCardGrid }  from "@/components/notices/NoticeCardGrid";
import { NoticeTable }     from "@/components/notices/NoticeTable";
import { NOTICES } from "@/data/noticesData";
import type { NoticeFilters } from "@/components/notices/NoticeToolbar";
import { cn } from "@/lib/utils";

type ViewMode = "card" | "table";

function applyFilters(filters: NoticeFilters) {
  return NOTICES.filter((n) => {
    if (filters.search) {
      const q = filters.search.toLowerCase();
      if (!n.title.toLowerCase().includes(q)
        && !n.summary.toLowerCase().includes(q)
        && !n.publishedBy.toLowerCase().includes(q)
        && !n.category.toLowerCase().includes(q)) return false;
    }
    if (filters.category && n.category  !== filters.category)  return false;
    if (filters.audience && n.audience  !== filters.audience)   return false;
    if (filters.priority && n.priority  !== filters.priority)   return false;
    if (filters.status   && n.status    !== filters.status)     return false;
    if (filters.dateFrom && n.publishDate && n.publishDate < filters.dateFrom) return false;
    if (filters.dateTo   && n.publishDate && n.publishDate > filters.dateTo)   return false;
    return true;
  });
}

export function NoticeBoardPage() {
  const [view,    setView]    = useState<ViewMode>("card");
  const [filters, setFilters] = useState<NoticeFilters>(EMPTY_FILTERS);

  const onChange  = useCallback((f: NoticeFilters) => setFilters(f), []);
  const onClear   = useCallback(() => setFilters(EMPTY_FILTERS), []);

  const filtered = useMemo(() => applyFilters(filters), [filters]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Notice Board</h1>
        <p className="text-[13px] text-muted-foreground mt-0.5">
          Manage school notices, announcements, and circulars
        </p>
      </div>

      {/* Summary KPIs */}
      <NoticeSummaryCards />

      {/* Toolbar */}
      <NoticeToolbar
        filters={filters} onChange={onChange} onClear={onClear}
        total={NOTICES.length} filtered={filtered.length}
      />

      {/* View toggle */}
      <div className="flex items-center justify-between">
        <p className="text-[12px] text-muted-foreground">
          {filtered.length} notice{filtered.length !== 1 ? "s" : ""}
        </p>

        <div className="relative flex rounded-lg border border-border overflow-hidden">
          {/* Sliding background */}
          <div
            className={cn(
              "absolute top-0 bottom-0 w-1/2 bg-primary transition-transform duration-200 ease-out",
              view === "table" ? "translate-x-full" : "translate-x-0",
            )}
          />
          {([["card", LayoutGrid, "Card View"], ["table", List, "Table View"]] as const).map(([v, Icon, label]) => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={cn(
                "relative z-10 flex items-center gap-1.5 px-4 py-2 text-[12px] font-medium transition-colors",
                view === v ? "text-primary-foreground" : "text-muted-foreground hover:text-foreground",
              )}
            >
              <Icon className="h-3.5 w-3.5" />
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      {view === "card"
        ? <NoticeCardGrid notices={filtered} />
        : <NoticeTable    notices={filtered} />}
    </div>
  );
}
