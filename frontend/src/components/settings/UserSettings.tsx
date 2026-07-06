import { Users, UserPlus, Pencil, ShieldOff, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SettingsSection } from "./SettingsSection";
import { ADMIN_USERS } from "@/data/settingsData";
import type { UserStatus } from "@/data/settingsData";
import { cn } from "@/lib/utils";

const STATUS_CLS: Record<UserStatus, string> = {
  Active:    "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-400/40 dark:bg-emerald-950/40 dark:text-emerald-300",
  Inactive:  "bg-slate-100  text-slate-500   ring-1 ring-slate-300/50   dark:bg-slate-800      dark:text-slate-400",
  Suspended: "bg-rose-50    text-rose-700    ring-1 ring-rose-400/40    dark:bg-rose-950/40    dark:text-rose-300",
};

const ROLE_CLS: Record<string, string> = {
  "Super Admin":  "bg-rose-50    text-rose-700    dark:bg-rose-950/40   dark:text-rose-300",
  "Principal":    "bg-violet-50  text-violet-700  dark:bg-violet-950/40 dark:text-violet-300",
  "Teacher":      "bg-blue-50    text-blue-700    dark:bg-blue-950/40   dark:text-blue-300",
  "Accountant":   "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300",
  "Receptionist": "bg-amber-50   text-amber-700   dark:bg-amber-950/40  dark:text-amber-300",
  "HR Manager":   "bg-cyan-50    text-cyan-700    dark:bg-cyan-950/40   dark:text-cyan-300",
};

function initials(name: string) {
  return name.trim().split(" ").filter(Boolean).map((w) => w[0]).slice(0,2).join("").toUpperCase();
}

export function UserSettings() {
  return (
    <div className="space-y-5">
      <SettingsSection
        icon={Users}
        title="Admin Users"
        subtitle={`${ADMIN_USERS.length} users with administrative access`}
        action={
          <Button size="sm" className="h-8 gap-1.5 text-[12px]">
            <UserPlus className="h-3.5 w-3.5" /> Invite User
          </Button>
        }
        noPad>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="border-b border-border bg-muted/30">
              <tr>
                {["User","Email","Role","Status","Last Login","Actions"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {ADMIN_USERS.map((u) => (
                <tr key={u.id} className="group hover:bg-muted/20 transition-colors">
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[11px] font-bold text-primary">
                        {initials(u.name)}
                      </div>
                      <p className="text-[13px] font-medium text-foreground">{u.name}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3.5 text-[12px] text-muted-foreground">{u.email}</td>
                  <td className="px-4 py-3.5">
                    <span className={cn("rounded-full px-2.5 py-0.5 text-[11px] font-semibold", ROLE_CLS[u.role] ?? "bg-muted text-muted-foreground")}>
                      {u.role}
                    </span>
                  </td>
                  <td className="px-4 py-3.5">
                    <span className={cn("rounded-full px-2.5 py-0.5 text-[11px] font-semibold", STATUS_CLS[u.status])}>
                      {u.status}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-[12px] text-muted-foreground whitespace-nowrap">{u.lastLogin}</td>
                  <td className="px-4 py-3.5">
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button title="Edit Role" className="flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button title="Disable" className="flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground hover:bg-amber-50 hover:text-amber-600 dark:hover:bg-amber-950/30 transition-colors">
                        <ShieldOff className="h-3.5 w-3.5" />
                      </button>
                      <button title="Delete" className="flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/30 transition-colors">
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SettingsSection>
    </div>
  );
}
