import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Boxes, KeyRound, Loader2, Lock, ShieldCheck, Sparkles } from "lucide-react";

import { RoleCard } from "@/components/account/RoleCard";
import { PermissionMatrix } from "@/components/account/PermissionMatrix";
import { MetricCard } from "@/components/ui/MetricCard";
import { listPermissions, listRoles, listUsers } from "@/lib/admin";

export function RolesPermissionsPage() {
  const rolesQuery = useQuery({ queryKey: ["roles"], queryFn: listRoles });
  const permissionsQuery = useQuery({ queryKey: ["permissions"], queryFn: listPermissions });
  const usersQuery = useQuery({ queryKey: ["users", "summary"], queryFn: () => listUsers({ page: 1, page_size: 200 }) });

  const roles = rolesQuery.data ?? [];
  const permissions = permissionsQuery.data ?? [];
  const users = usersQuery.data?.results ?? [];
  const isLoading = rolesQuery.isLoading || permissionsQuery.isLoading;

  const userCountByRole = useMemo(() => {
    const map = new Map<string, number>();
    for (const role of roles) map.set(role.name, users.filter((u) => u.roles.includes(role.name)).length);
    return map;
  }, [roles, users]);

  const stats = [
    { label: "Total Roles", value: roles.length, icon: ShieldCheck },
    { label: "Total Permissions", value: permissions.length, icon: KeyRound },
    { label: "Custom Roles", value: roles.filter((r) => !r.is_system).length, icon: Sparkles },
    { label: "Modules Covered", value: new Set(permissions.map((p) => p.module)).size, icon: Boxes },
  ];

  if (isLoading) {
    return <div className="flex items-center justify-center py-20 text-muted-foreground"><Loader2 className="h-6 w-6 animate-spin" /></div>;
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {stats.map((s) => (
          <MetricCard key={s.label} label={s.label} value={s.value} icon={s.icon} />
        ))}
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {roles.map((role) => (
          <RoleCard key={role.id} role={role} userCount={userCountByRole.get(role.name) ?? 0} />
        ))}
      </div>

      <div>
        <h2 className="mb-3 text-[14px] font-semibold text-foreground">Permission Matrix</h2>
        <p className="mb-3 flex items-center gap-1 text-[12px] text-muted-foreground">
          Toggle a permission for a role to grant or revoke it immediately. Roles marked <Lock className="h-3 w-3" /> are system roles and cannot be edited.
        </p>
        <PermissionMatrix roles={roles} permissions={permissions} />
      </div>
    </div>
  );
}
