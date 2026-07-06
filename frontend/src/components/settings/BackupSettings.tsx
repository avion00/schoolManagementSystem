import { useState } from "react";
import { HardDrive, Download, RefreshCw, Users, GraduationCap, CreditCard, CalendarCheck, ClipboardList, CheckCircle, XCircle, Clock } from "lucide-react";
import { Card } from "@/components/ui/card";
import { SettingsSection, SettingsField, ToggleRow } from "./SettingsSection";
import { BACKUP_INFO } from "@/data/settingsData";
import type { BackupStatus } from "@/data/settingsData";
import { cn } from "@/lib/utils";

const STATUS_CLS: Record<BackupStatus, string> = {
  Success: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300",
  Running: "bg-blue-50    text-blue-700   dark:bg-blue-950/40   dark:text-blue-300",
  Failed:  "bg-rose-50    text-rose-700   dark:bg-rose-950/40   dark:text-rose-300",
  Pending: "bg-amber-50   text-amber-700  dark:bg-amber-950/40  dark:text-amber-300",
};
const STATUS_ICON: Record<BackupStatus, React.ElementType> = {
  Success: CheckCircle,
  Running: RefreshCw,
  Failed:  XCircle,
  Pending: Clock,
};

const EXPORT_ACTIONS = [
  { label: "Export Students",    icon: GraduationCap, cls: "text-blue-600    bg-blue-50    dark:bg-blue-950/40   hover:bg-blue-100   dark:hover:bg-blue-950/60" },
  { label: "Export Teachers",    icon: Users,         cls: "text-violet-600  bg-violet-50  dark:bg-violet-950/40 hover:bg-violet-100 dark:hover:bg-violet-950/60" },
  { label: "Export Fee Records", icon: CreditCard,    cls: "text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-950/60" },
  { label: "Export Attendance",  icon: CalendarCheck, cls: "text-amber-600   bg-amber-50   dark:bg-amber-950/40  hover:bg-amber-100  dark:hover:bg-amber-950/60" },
  { label: "Export Exams",       icon: ClipboardList, cls: "text-rose-600    bg-rose-50    dark:bg-rose-950/40   hover:bg-rose-100   dark:hover:bg-rose-950/60" },
];

const storagePercent = Math.round((parseFloat(BACKUP_INFO.storageUsed) / parseFloat(BACKUP_INFO.storageTotal)) * 100);

export function BackupSettings() {
  const [info, setInfo]   = useState({ ...BACKUP_INFO });
  const [creating, setCreating] = useState(false);

  async function handleCreate() {
    setCreating(true);
    await new Promise((r) => setTimeout(r, 1500));
    console.log("Backup created");
    setCreating(false);
    alert("Backup created successfully!");
  }

  return (
    <div className="space-y-5">
      {/* Status overview */}
      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { label: "Last Backup",    value: BACKUP_INFO.lastBackup,  color: "text-foreground"    },
          { label: "Storage Used",   value: BACKUP_INFO.storageUsed, color: "text-primary"       },
          { label: "Backup Status",  value: BACKUP_INFO.status,      color: "text-emerald-600"   },
        ].map(({ label, value, color }) => (
          <Card key={label} className="flex flex-col gap-2 rounded-2xl p-4 shadow-sm">
            <p className="text-[11px] text-muted-foreground">{label}</p>
            <p className={cn("text-[16px] font-bold", color)}>{value}</p>
          </Card>
        ))}
      </div>

      {/* Storage bar */}
      <SettingsSection icon={HardDrive} title="Storage"
        subtitle={`${BACKUP_INFO.storageUsed} of ${BACKUP_INFO.storageTotal} used`}>
        <div className="space-y-3">
          <div className="flex items-center justify-between text-[12px]">
            <span className="text-muted-foreground">Used: {BACKUP_INFO.storageUsed}</span>
            <span className="font-semibold text-foreground">{storagePercent}%</span>
            <span className="text-muted-foreground">Total: {BACKUP_INFO.storageTotal}</span>
          </div>
          <div className="h-3 w-full overflow-hidden rounded-full bg-muted">
            <div
              className={cn("h-full rounded-full transition-all", storagePercent > 80 ? "bg-rose-500" : "bg-primary")}
              style={{ width: `${storagePercent}%` }}
            />
          </div>
        </div>
      </SettingsSection>

      {/* Backup config */}
      <SettingsSection icon={HardDrive} title="Backup Configuration"
        subtitle="Auto-backup schedule and retention">
        <div className="space-y-4">
          <div className="divide-y divide-border rounded-xl border border-border overflow-hidden">
            <ToggleRow label="Automatic Backup" sublabel="Run backups on schedule automatically"
              checked={info.autoBackup} onChange={(v) => setInfo((p) => ({ ...p, autoBackup: v }))} />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <SettingsField label="Backup Frequency">
              <select value={info.backupFreq}
                onChange={(e) => setInfo((p) => ({ ...p, backupFreq: e.target.value as typeof p.backupFreq }))}
                className="h-9 w-full rounded-lg border border-input bg-background px-3 text-[13px] text-foreground focus:outline-none focus:ring-2 focus:ring-ring">
                {["Daily","Weekly","Monthly"].map((f) => <option key={f} value={f}>{f}</option>)}
              </select>
            </SettingsField>
            <SettingsField label="Retain Backups (days)">
              <input type="number" value={info.retainDays}
                onChange={(e) => setInfo((p) => ({ ...p, retainDays: Number(e.target.value) }))}
                className="h-9 w-full rounded-lg border border-input bg-background px-3 text-[13px] text-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
            </SettingsField>
          </div>
          <div className="flex gap-3">
            <button onClick={handleCreate} disabled={creating}
              className="inline-flex h-9 items-center gap-2 rounded-xl bg-primary px-5 text-[13px] font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-60">
              <HardDrive className="h-4 w-4" />
              {creating ? "Creating…" : "Create Backup Now"}
            </button>
            <button onClick={() => console.log("Download backup")}
              className="inline-flex h-9 items-center gap-2 rounded-xl border border-border px-5 text-[13px] font-medium text-foreground hover:bg-muted transition-colors">
              <Download className="h-4 w-4" /> Download Latest
            </button>
          </div>
        </div>
      </SettingsSection>

      {/* Export data */}
      <SettingsSection icon={Download} title="Export Data"
        subtitle="Download school data as Excel or CSV">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {EXPORT_ACTIONS.map(({ label, icon: Icon, cls }) => (
            <button key={label} onClick={() => console.log(`Export: ${label}`)}
              className={cn("flex items-center gap-3 rounded-xl p-4 text-[13px] font-medium transition-colors", cls)}>
              <Icon className="h-5 w-5 shrink-0" />
              {label}
              <Download className="ml-auto h-4 w-4 shrink-0 opacity-60" />
            </button>
          ))}
        </div>
      </SettingsSection>

      {/* Backup history */}
      <SettingsSection icon={HardDrive} title="Backup History" noPad>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="border-b border-border bg-muted/30">
              <tr>
                {["Date","Size","Type","Status","Created By","Action"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {BACKUP_INFO.history.map((b) => {
                const Icon = STATUS_ICON[b.status];
                return (
                  <tr key={b.id} className="hover:bg-muted/20 transition-colors">
                    <td className="px-4 py-3 text-[12px] text-muted-foreground whitespace-nowrap">{b.date}</td>
                    <td className="px-4 py-3 text-[13px] text-foreground">{b.size}</td>
                    <td className="px-4 py-3">
                      <span className="rounded-md bg-muted px-2 py-0.5 text-[11px] text-muted-foreground">{b.type}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={cn("inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold", STATUS_CLS[b.status])}>
                        <Icon className="h-3 w-3" />
                        {b.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-[12px] text-muted-foreground">{b.createdBy}</td>
                    <td className="px-4 py-3">
                      {b.status === "Success" && (
                        <button title="Download" className="flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
                          <Download className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </SettingsSection>
    </div>
  );
}
