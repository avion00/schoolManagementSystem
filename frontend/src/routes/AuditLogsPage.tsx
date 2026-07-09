import { useMemo, useState } from "react";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { ChevronLeft, ChevronRight, Loader2, Search } from "lucide-react";

import { AuditLogsTable } from "@/components/account/AuditLogsTable";
import { Button } from "@/components/ui/button";
import { listAuditLogs } from "@/lib/audit";

const PAGE_SIZE = 25;
const selectClass = "h-8 rounded-lg border border-input bg-background px-2.5 text-[12px] text-foreground focus:outline-none focus:ring-1 focus:ring-ring";

function severityOf(action: string): "Low" | "Medium" | "High" {
  const a = action.toLowerCase();
  if (a.includes("delete") || a.includes("fail") || a.includes("security")) return "High";
  if (a.includes("role") || a.includes("permission") || a.includes("password") || a.includes("deactivate")) return "Medium";
  return "Low";
}

export function AuditLogsPage() {
  const [search, setSearch] = useState("");
  const [severity, setSeverity] = useState("all");
  const [dateRange, setDateRange] = useState<"all" | "today" | "7d" | "30d">("all");
  const [page, setPage] = useState(1);

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ["audit-logs", search, page],
    queryFn: () => listAuditLogs({ search: search || undefined, page }),
    placeholderData: keepPreviousData,
  });

  const filtered = useMemo(() => {
    let rows = data?.results ?? [];
    if (severity !== "all") rows = rows.filter((l) => severityOf(l.action) === severity);
    if (dateRange !== "all") {
      const limitHours = dateRange === "today" ? 24 : dateRange === "7d" ? 24 * 7 : 24 * 30;
      rows = rows.filter((l) => Date.now() - new Date(l.created_at).getTime() <= limitHours * 3600_000);
    }
    return rows;
  }, [data, severity, dateRange]);

  const totalPages = data ? Math.max(1, Math.ceil(data.count / PAGE_SIZE)) : 1;

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 rounded-2xl border border-border/60 bg-card p-3.5 shadow-sm">
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative min-w-[240px] flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground/60" />
            <input
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search by action, module, or target..."
              className="h-8 w-full rounded-lg border border-input bg-background pl-8 pr-3 text-[12px] text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
            />
          </div>
          {isFetching && <Loader2 className="h-4 w-4 shrink-0 animate-spin text-muted-foreground" />}
          <span className="text-[11.5px] text-muted-foreground">{data ? `${data.count} log entries` : ""}</span>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <select value={severity} onChange={(e) => setSeverity(e.target.value)} className={selectClass}>
            <option value="all">Any Severity</option>
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
          </select>
          <select value={dateRange} onChange={(e) => setDateRange(e.target.value as typeof dateRange)} className={selectClass}>
            <option value="all">Any Date</option>
            <option value="today">Today</option>
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
          </select>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20 text-muted-foreground"><Loader2 className="h-6 w-6 animate-spin" /></div>
      ) : (
        <>
          <AuditLogsTable logs={filtered} />
          {data && data.count > PAGE_SIZE && (
            <div className="flex items-center justify-end gap-2">
              <span className="text-[12px] text-muted-foreground">Page {page} of {totalPages}</span>
              <Button variant="outline" size="icon" className="h-7 w-7" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}><ChevronLeft className="h-3.5 w-3.5" /></Button>
              <Button variant="outline" size="icon" className="h-7 w-7" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}><ChevronRight className="h-3.5 w-3.5" /></Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
