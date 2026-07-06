import { useState, useMemo } from "react";
import { ScrollText, Search, CheckCircle, XCircle, AlertTriangle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { SettingsSection } from "./SettingsSection";
import { AUDIT_LOGS } from "@/data/settingsData";
import type { AuditLog } from "@/data/settingsData";
import { cn } from "@/lib/utils";

const STATUS_CLS: Record<AuditLog["status"], string> = {
  Success: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300",
  Failed:  "bg-rose-50    text-rose-700   dark:bg-rose-950/40   dark:text-rose-300",
  Warning: "bg-amber-50   text-amber-700  dark:bg-amber-950/40  dark:text-amber-300",
};
const STATUS_ICON: Record<AuditLog["status"], React.ElementType> = {
  Success: CheckCircle,
  Failed:  XCircle,
  Warning: AlertTriangle,
};

const PAGE_SIZE = 10;
const MODULES = Array.from(new Set(AUDIT_LOGS.map((l) => l.module)));

export function AuditLogsSettings() {
  const [search, setSearch]   = useState("");
  const [module, setModule]   = useState("");
  const [status, setStatus]   = useState("");
  const [page,   setPage]     = useState(1);

  const filtered = useMemo(() =>
    AUDIT_LOGS.filter((l) => {
      if (search && !l.action.toLowerCase().includes(search.toLowerCase())
        && !l.user.toLowerCase().includes(search.toLowerCase())) return false;
      if (module && l.module !== module) return false;
      if (status && l.status !== status) return false;
      return true;
    }),
  [search, module, status]);

  const pages  = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePg = Math.min(page, pages);
  const slice  = filtered.slice((safePg - 1) * PAGE_SIZE, safePg * PAGE_SIZE);

  return (
    <div className="space-y-5">
      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <div className="relative flex-1 min-w-[180px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <Input placeholder="Search logs…" value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="pl-9 h-9 text-[13px]" />
        </div>
        <select value={module} onChange={(e) => { setModule(e.target.value); setPage(1); }}
          className="h-9 rounded-lg border border-input bg-background px-3 text-[13px] text-foreground focus:outline-none focus:ring-2 focus:ring-ring">
          <option value="">All Modules</option>
          {MODULES.map((m) => <option key={m} value={m}>{m}</option>)}
        </select>
        <select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }}
          className="h-9 rounded-lg border border-input bg-background px-3 text-[13px] text-foreground focus:outline-none focus:ring-2 focus:ring-ring">
          <option value="">All Statuses</option>
          {["Success","Failed","Warning"].map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        {(search || module || status) && (
          <button onClick={() => { setSearch(""); setModule(""); setStatus(""); setPage(1); }}
            className="h-9 rounded-lg border border-border px-3 text-[13px] text-muted-foreground hover:bg-muted transition-colors">
            Clear
          </button>
        )}
        <p className="ml-auto flex items-center text-[12px] text-muted-foreground whitespace-nowrap">
          {filtered.length} log{filtered.length !== 1 ? "s" : ""}
        </p>
      </div>

      <SettingsSection icon={ScrollText} title="System Audit Trail"
        subtitle="All administrative actions and system events"
        noPad>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="border-b border-border bg-muted/30">
              <tr>
                {["Date & Time","User","Role","Action","Module","IP Address","Status"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {slice.length === 0 && (
                <tr><td colSpan={7} className="px-6 py-12 text-center text-[13px] text-muted-foreground">No logs match your filters.</td></tr>
              )}
              {slice.map((log) => {
                const Icon = STATUS_ICON[log.status];
                return (
                  <tr key={log.id} className="hover:bg-muted/20 transition-colors">
                    <td className="px-4 py-3 text-[11px] text-muted-foreground whitespace-nowrap">{log.date}</td>
                    <td className="px-4 py-3">
                      <p className="text-[13px] font-medium text-foreground">{log.user}</p>
                    </td>
                    <td className="px-4 py-3 text-[12px] text-muted-foreground">{log.role}</td>
                    <td className="px-4 py-3 max-w-[220px]">
                      <p className="truncate text-[12px] text-foreground">{log.action}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className="rounded-md bg-muted px-2 py-0.5 text-[11px] text-muted-foreground">{log.module}</span>
                    </td>
                    <td className="px-4 py-3 text-[11px] font-mono text-muted-foreground">{log.ipAddress}</td>
                    <td className="px-4 py-3">
                      <span className={cn("inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold", STATUS_CLS[log.status])}>
                        <Icon className="h-3 w-3" />
                        {log.status}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {pages > 1 && (
          <div className="flex items-center justify-between border-t border-border px-4 py-3">
            <p className="text-[12px] text-muted-foreground">
              {(safePg-1)*PAGE_SIZE+1}–{Math.min(safePg*PAGE_SIZE, filtered.length)} of {filtered.length}
            </p>
            <div className="flex gap-1">
              <button disabled={safePg===1} onClick={() => setPage(safePg-1)}
                className="flex h-7 w-7 items-center justify-center rounded-lg border border-border text-xs text-muted-foreground hover:bg-muted disabled:opacity-40">‹</button>
              {Array.from({length: pages}, (_,i)=>i+1).map((p) => (
                <button key={p} onClick={() => setPage(p)}
                  className={cn("flex h-7 w-7 items-center justify-center rounded-lg text-xs", p === safePg ? "bg-primary text-primary-foreground" : "border border-border text-muted-foreground hover:bg-muted")}>
                  {p}
                </button>
              ))}
              <button disabled={safePg===pages} onClick={() => setPage(safePg+1)}
                className="flex h-7 w-7 items-center justify-center rounded-lg border border-border text-xs text-muted-foreground hover:bg-muted disabled:opacity-40">›</button>
            </div>
          </div>
        )}
      </SettingsSection>
    </div>
  );
}
