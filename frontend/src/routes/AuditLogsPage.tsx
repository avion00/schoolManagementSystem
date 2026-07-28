import { useMemo, useState } from "react";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { Loader2, Search } from "lucide-react";

import { AuditLogsTable } from "@/components/account/AuditLogsTable";
import { PremiumSelect } from "@/components/ui/PremiumSelect";
import { listAuditLogs } from "@/lib/audit";

const PAGE_SIZE = 25;

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

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 rounded-2xl border border-border/60 bg-card p-3.5 shadow-elevated">
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
          <PremiumSelect
            value={severity}
            onChange={setSeverity}
            className="w-40"
            options={[
              { value: "all", label: "Any Severity" },
              { value: "Low", label: "Low" },
              { value: "Medium", label: "Medium" },
              { value: "High", label: "High" },
            ]}
          />
          <PremiumSelect
            value={dateRange}
            onChange={(v) => setDateRange(v as typeof dateRange)}
            className="w-40"
            options={[
              { value: "all", label: "Any Date" },
              { value: "today", label: "Today" },
              { value: "7d", label: "Last 7 days" },
              { value: "30d", label: "Last 30 days" },
            ]}
          />
        </div>
      </div>

      <AuditLogsTable
        logs={filtered}
        loading={isLoading}
        pagination={{
          page,
          pageSize: PAGE_SIZE,
          total: data?.count ?? 0,
          onPage: setPage,
          itemLabel: "log entries",
        }}
      />
    </div>
  );
}
