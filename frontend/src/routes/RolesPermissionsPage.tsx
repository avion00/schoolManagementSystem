import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Loader2, Lock } from "lucide-react";

import { RoleCard } from "@/components/account/RoleCard";
import { PermissionMatrix } from "@/components/account/PermissionMatrix";
import { Card, CardContent } from "@/components/ui/card";
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
    { label: "Total Roles", value: roles.length },
    { label: "Total Permissions", value: permissions.length },
    { label: "Custom Roles", value: roles.filter((r) => !r.is_system).length },
    { label: "Modules Covered", value: new Set(permissions.map((p) => p.module)).size },
  ];

  if (isLoading) {
    return <div className="flex items-center justify-center py-20 text-muted-foreground"><Loader2 className="h-6 w-6 animate-spin" /></div>;
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {stats.map((s) => (
          <Card key={s.label} className="rounded-2xl border-border/60 shadow-sm">
            <CardContent className="p-4">
              <p className="text-[11px] text-muted-foreground">{s.label}</p>
              <p className="mt-1 text-xl font-semibold tabular-nums text-purple-600 dark:text-purple-400">{s.value}</p>
            </CardContent>
          </Card>
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
