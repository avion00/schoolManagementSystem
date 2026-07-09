import { Fragment, useMemo, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Check, Lock } from "lucide-react";
import { toast } from "sonner";

import { setRolePermissions, type Permission, type Role } from "@/lib/admin";
import { cn } from "@/lib/utils";

export function PermissionMatrix({ roles, permissions }: { roles: Role[]; permissions: Permission[] }) {
  const queryClient = useQueryClient();
  const [pending, setPending] = useState<string | null>(null); // `${roleId}:${code}` in flight

  const grouped = useMemo(() => {
    const byModule = new Map<string, Permission[]>();
    for (const p of permissions) {
      const key = p.module || "Other";
      if (!byModule.has(key)) byModule.set(key, []);
      byModule.get(key)!.push(p);
    }
    return Array.from(byModule.entries()).sort((a, b) => a[0].localeCompare(b[0]));
  }, [permissions]);

  const mutation = useMutation({
    mutationFn: ({ role, codes }: { role: Role; codes: string[] }) => setRolePermissions(role.id, codes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["roles"] });
      toast.success("Role permissions updated.");
    },
    onError: () => toast.error("Could not update role permissions."),
    onSettled: () => setPending(null),
  });

  function toggle(role: Role, code: string) {
    if (role.is_system) return;
    const has = role.permissions.includes(code);
    const nextCodes = has ? role.permissions.filter((c) => c !== code) : [...role.permissions, code];
    setPending(`${role.id}:${code}`);
    mutation.mutate({ role, codes: nextCodes });
  }

  if (roles.length === 0 || permissions.length === 0) {
    return <p className="py-8 text-center text-[12.5px] text-muted-foreground">No roles or permissions available yet.</p>;
  }

  return (
    <div className="overflow-x-auto rounded-2xl border border-border/60 bg-card shadow-sm">
      <table className="w-full min-w-[720px] border-collapse text-[12px]">
        <thead className="sticky top-0 z-10 bg-muted/60">
          <tr>
            <th className="sticky left-0 z-20 bg-muted/60 px-4 py-2.5 text-left font-semibold text-foreground">Permission</th>
            {roles.map((role) => (
              <th key={role.id} className="min-w-[100px] px-2 py-2.5 text-center font-medium text-muted-foreground">
                <span className="flex flex-col items-center gap-0.5">
                  {role.name}
                  {role.is_system && <Lock className="h-3 w-3 text-muted-foreground/60" />}
                </span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {grouped.map(([module, perms]) => (
            <Fragment key={module}>
              <tr className="bg-muted/30">
                <td colSpan={roles.length + 1} className="px-4 py-1.5 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                  {module}
                </td>
              </tr>
              {perms.map((perm) => (
                <tr key={perm.id} className="border-t border-border/40 hover:bg-muted/20">
                  <td className="sticky left-0 z-10 bg-card px-4 py-2 text-foreground">
                    <span className="font-medium">{perm.name}</span>
                    <span className="ml-1.5 font-mono text-[10.5px] text-muted-foreground">{perm.code}</span>
                  </td>
                  {roles.map((role) => {
                    const checked = role.permissions.includes(perm.code);
                    const isPending = pending === `${role.id}:${perm.code}`;
                    return (
                      <td key={role.id} className="px-2 py-2 text-center">
                        <button
                          type="button"
                          disabled={role.is_system || isPending}
                          onClick={() => toggle(role, perm.code)}
                          title={role.is_system ? "System roles cannot be modified" : `Toggle ${perm.name} for ${role.name}`}
                          className={cn(
                            "inline-flex h-5 w-5 items-center justify-center rounded-md border transition-colors",
                            checked ? "border-primary bg-primary text-primary-foreground" : "border-input bg-background",
                            role.is_system ? "cursor-not-allowed opacity-50" : "cursor-pointer hover:border-primary/50",
                            isPending && "animate-pulse",
                          )}
                        >
                          {checked && <Check className="h-3 w-3" />}
                        </button>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
}
