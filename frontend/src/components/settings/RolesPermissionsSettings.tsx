import { useState } from "react";
import { ShieldCheck, Users, Check, X } from "lucide-react";
import { SettingsSection } from "./SettingsSection";
import {
  ROLES, PERM_MODULES, PERM_ACTIONS,
  SUPER_ADMIN_PERMS, TEACHER_PERMS,
} from "@/data/settingsData";
import type { PermMatrix, PermModule, PermAction } from "@/data/settingsData";
import { cn } from "@/lib/utils";

const ROLE_COLOR_MAP: Record<string, string> = {
  rose:    "bg-rose-50    text-rose-700    dark:bg-rose-950/40   dark:text-rose-300",
  violet:  "bg-violet-50  text-violet-700  dark:bg-violet-950/40 dark:text-violet-300",
  blue:    "bg-blue-50    text-blue-700    dark:bg-blue-950/40   dark:text-blue-300",
  emerald: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300",
  amber:   "bg-amber-50   text-amber-700   dark:bg-amber-950/40  dark:text-amber-300",
  cyan:    "bg-cyan-50    text-cyan-700    dark:bg-cyan-950/40   dark:text-cyan-300",
  slate:   "bg-slate-100  text-slate-600   dark:bg-slate-800     dark:text-slate-400",
  neutral: "bg-neutral-100 text-neutral-600 dark:bg-neutral-800  dark:text-neutral-400",
};

const PERMS_BY_ROLE: Record<string, PermMatrix> = {
  "Super Admin": SUPER_ADMIN_PERMS,
  "Teacher":     TEACHER_PERMS,
};

export function RolesPermissionsSettings() {
  const [activeRole, setActiveRole] = useState("Super Admin");
  const matrix: PermMatrix = PERMS_BY_ROLE[activeRole] ?? TEACHER_PERMS;
  const [perms, setPerms] = useState<PermMatrix>({ ...matrix });

  function toggle(mod: PermModule, action: PermAction) {
    setPerms((p) => ({
      ...p,
      [mod]: { ...p[mod], [action]: !p[mod][action] },
    }));
  }

  function handleRoleChange(role: string) {
    setActiveRole(role);
    setPerms(PERMS_BY_ROLE[role] ?? TEACHER_PERMS);
  }

  const isSuperAdmin = activeRole === "Super Admin";

  return (
    <div className="space-y-5">
      {/* Role cards */}
      <SettingsSection icon={ShieldCheck} title="Roles" subtitle="User roles and access levels">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {ROLES.map((role) => {
            const colCls = ROLE_COLOR_MAP[role.color] ?? ROLE_COLOR_MAP.slate;
            const isActive = activeRole === role.name;
            return (
              <button
                key={role.id}
                onClick={() => handleRoleChange(role.name)}
                className={cn(
                  "flex flex-col gap-3 rounded-2xl border p-4 text-left transition-all",
                  isActive ? "border-primary ring-1 ring-primary bg-primary/5" : "border-border hover:border-primary/40",
                )}
              >
                <div className="flex items-start justify-between gap-2">
                  <span className={cn("rounded-full px-2.5 py-0.5 text-[11px] font-semibold", colCls)}>
                    {role.name}
                  </span>
                  {role.isSystem && (
                    <span className="rounded-md bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">System</span>
                  )}
                </div>
                <p className="text-[11px] text-muted-foreground line-clamp-2">{role.description}</p>
                <div className="flex gap-3 text-[11px]">
                  <span className="flex items-center gap-1 text-foreground font-medium">
                    <Users className="h-3 w-3" /> {role.userCount.toLocaleString()}
                  </span>
                  <span className="text-muted-foreground">{role.permissionCount} perms</span>
                </div>
              </button>
            );
          })}
        </div>
      </SettingsSection>

      {/* Permissions matrix */}
      <SettingsSection icon={ShieldCheck}
        title={`Permissions — ${activeRole}`}
        subtitle="Manage what this role can access and modify">
        {isSuperAdmin && (
          <div className="mb-4 flex items-center gap-2 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900 px-4 py-3">
            <ShieldCheck className="h-4 w-4 text-rose-600 shrink-0" />
            <p className="text-[12px] text-rose-800 dark:text-rose-300">
              Super Admin has full access to all modules. Permissions cannot be restricted.
            </p>
          </div>
        )}

        <div className="overflow-x-auto rounded-xl border border-border">
          <table className="min-w-full text-sm">
            <thead className="border-b border-border bg-muted/30">
              <tr>
                <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground min-w-[120px]">Module</th>
                {PERM_ACTIONS.map((a) => (
                  <th key={a} className="px-3 py-3 text-center text-[11px] font-semibold uppercase tracking-wider text-muted-foreground capitalize">
                    {a}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {PERM_MODULES.map((mod) => (
                <tr key={mod} className="hover:bg-muted/20 transition-colors">
                  <td className="px-4 py-3 text-[13px] font-medium text-foreground">{mod}</td>
                  {PERM_ACTIONS.map((action) => {
                    const checked = perms[mod]?.[action] ?? false;
                    return (
                      <td key={action} className="px-3 py-3 text-center">
                        <button
                          disabled={isSuperAdmin}
                          onClick={() => toggle(mod, action)}
                          className={cn(
                            "inline-flex h-6 w-6 items-center justify-center rounded-md transition-colors",
                            checked
                              ? "bg-primary text-primary-foreground"
                              : "border border-border bg-background text-transparent hover:border-primary/50",
                            isSuperAdmin && "cursor-not-allowed",
                          )}
                        >
                          {checked ? <Check className="h-3.5 w-3.5" /> : <X className="h-3 w-3 text-muted-foreground/30" />}
                        </button>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {!isSuperAdmin && (
          <div className="mt-4 flex gap-3">
            <button
              onClick={() => { console.log("Permissions saved:", { role: activeRole, perms }); }}
              className="inline-flex h-9 items-center gap-2 rounded-xl bg-primary px-5 text-[13px] font-semibold text-primary-foreground hover:opacity-90"
            >
              Save Permissions
            </button>
          </div>
        )}
      </SettingsSection>
    </div>
  );
}
