import { FileClock } from "lucide-react";

import { PremiumDataTable, type PremiumDataTableColumn } from "@/components/ui/PremiumDataTable";
import type { PremiumDataTablePagination } from "@/components/ui/PremiumDataTable";
import type { AuditLogEntry } from "@/lib/audit";
import { cn } from "@/lib/utils";

function moduleOf(action: string): string {
  const first = action.split(".")[0] || "system";
  return first.charAt(0).toUpperCase() + first.slice(1);
}

function targetOf(log: AuditLogEntry): string {
  if (!log.object_type) return "—";
  const shortId = log.object_id ? ` #${log.object_id.slice(0, 8)}` : "";
  return `${log.object_type}${shortId}`;
}

function deviceOf(userAgent: string): string {
  if (!userAgent) return "Unknown device";
  if (/edg/i.test(userAgent)) return "Edge";
  if (/chrome/i.test(userAgent)) return "Chrome";
  if (/firefox/i.test(userAgent)) return "Firefox";
  if (/safari/i.test(userAgent)) return "Safari";
  return "Other";
}

function severityOf(action: string): "Low" | "Medium" | "High" {
  const a = action.toLowerCase();
  if (a.includes("delete") || a.includes("fail") || a.includes("security")) return "High";
  if (a.includes("role") || a.includes("permission") || a.includes("password") || a.includes("deactivate")) return "Medium";
  return "Low";
}

function statusOf(action: string): "Success" | "Failed" {
  return action.toLowerCase().includes("fail") ? "Failed" : "Success";
}

const SEVERITY_STYLE: Record<string, string> = {
  Low: "bg-slate-200 text-slate-600 dark:bg-slate-500/20 dark:text-slate-300",
  Medium: "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300",
  High: "bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300",
};
const STATUS_STYLE: Record<string, string> = {
  Success: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300",
  Failed: "bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300",
};

const columns: PremiumDataTableColumn<AuditLogEntry>[] = [
  {
    key: "id",
    header: "Log ID",
    render: (log) => <span className="font-mono text-[11px] text-muted-foreground">{log.id.slice(0, 8)}</span>,
  },
  {
    key: "actor",
    header: "User",
    render: (log) => <span className="text-foreground">{log.actor_email ?? "System"}</span>,
  },
  {
    key: "action",
    header: "Action",
    render: (log) => <span className="font-medium text-foreground">{log.action}</span>,
  },
  {
    key: "module",
    header: "Module",
    render: (log) => <span className="text-muted-foreground">{moduleOf(log.action)}</span>,
  },
  {
    key: "target",
    header: "Target",
    render: (log) => <span className="text-muted-foreground">{targetOf(log)}</span>,
  },
  {
    key: "ip",
    header: "IP Address",
    render: (log) => <span className="font-mono text-[11px] text-muted-foreground">{log.ip_address ?? "—"}</span>,
  },
  {
    key: "device",
    header: "Device",
    render: (log) => <span className="text-muted-foreground">{deviceOf(log.user_agent)}</span>,
  },
  {
    key: "time",
    header: "Time",
    render: (log) => (
      <span className="whitespace-nowrap text-muted-foreground">
        {new Date(log.created_at).toLocaleString(undefined, { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}
      </span>
    ),
  },
  {
    key: "severity",
    header: "Severity",
    render: (log) => (
      <span className={cn("rounded-full px-2 py-0.5 text-[11px] font-medium", SEVERITY_STYLE[severityOf(log.action)])}>
        {severityOf(log.action)}
      </span>
    ),
  },
  {
    key: "status",
    header: "Status",
    render: (log) => (
      <span className={cn("rounded-full px-2 py-0.5 text-[11px] font-medium", STATUS_STYLE[statusOf(log.action)])}>
        {statusOf(log.action)}
      </span>
    ),
  },
];

export function AuditLogsTable({
  logs,
  loading = false,
  pagination,
}: {
  logs: AuditLogEntry[];
  loading?: boolean;
  pagination?: PremiumDataTablePagination;
}) {
  return (
    <PremiumDataTable
      columns={columns}
      rows={logs}
      rowKey={(log) => log.id}
      loading={loading}
      emptyIcon={FileClock}
      emptyTitle="No audit activity"
      emptyDescription="No audit activity matches the current filters."
      pagination={pagination}
    />
  );
}
