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

export function AuditLogsTable({ logs }: { logs: AuditLogEntry[] }) {
  if (logs.length === 0) {
    return <p className="py-12 text-center text-[12.5px] text-muted-foreground">No audit activity matches the current filters.</p>;
  }

  return (
    <div className="overflow-x-auto rounded-2xl border border-border/60 bg-card shadow-sm">
      <table className="w-full min-w-[900px] text-[12px]">
        <thead className="bg-muted/40">
          <tr>
            {["Log ID", "User", "Action", "Module", "Target", "IP Address", "Device", "Time", "Severity", "Status"].map((h) => (
              <th key={h} className="px-4 py-2.5 text-left font-medium text-muted-foreground">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {logs.map((log) => (
            <tr key={log.id} className="border-t border-border/40 hover:bg-muted/20">
              <td className="px-4 py-2.5 font-mono text-[11px] text-muted-foreground">{log.id.slice(0, 8)}</td>
              <td className="px-4 py-2.5 text-foreground">{log.actor_email ?? "System"}</td>
              <td className="px-4 py-2.5 font-medium text-foreground">{log.action}</td>
              <td className="px-4 py-2.5 text-muted-foreground">{moduleOf(log.action)}</td>
              <td className="px-4 py-2.5 text-muted-foreground">{targetOf(log)}</td>
              <td className="px-4 py-2.5 font-mono text-[11px] text-muted-foreground">{log.ip_address ?? "—"}</td>
              <td className="px-4 py-2.5 text-muted-foreground">{deviceOf(log.user_agent)}</td>
              <td className="whitespace-nowrap px-4 py-2.5 text-muted-foreground">
                {new Date(log.created_at).toLocaleString(undefined, { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}
              </td>
              <td className="px-4 py-2.5">
                <span className={cn("rounded-full px-2 py-0.5 text-[11px] font-medium", SEVERITY_STYLE[severityOf(log.action)])}>{severityOf(log.action)}</span>
              </td>
              <td className="px-4 py-2.5">
                <span className={cn("rounded-full px-2 py-0.5 text-[11px] font-medium", STATUS_STYLE[statusOf(log.action)])}>{statusOf(log.action)}</span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
