import { createFileRoute, Link } from "@tanstack/react-router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/hermes/AppShell";
import { demoUsers } from "@/lib/hermes-auth";
import { projectById } from "@/lib/hermes-data";
import { assignments } from "@/lib/hermes-assignments";
import { UserPlus, ShieldCheck, Users } from "lucide-react";

export const Route = createFileRoute("/settings/users")({
  head: () => ({ meta: [{ title: "Users & Roles — Hermes" }] }),
  component: UsersAdmin,
});

function UsersAdmin() {
  return (
    <>
      <div className="mb-3"><Button variant="ghost" size="sm" asChild><Link to="/settings">← Settings</Link></Button></div>
      <PageHeader
        title="Users & roles"
        subtitle="Manage administrators and creators. Prototype only — changes are not persisted."
        actions={<Button size="sm" className="gap-1"><UserPlus className="h-4 w-4" /> Invite user</Button>}
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
        <Stat icon={ShieldCheck} label="Administrators" value={demoUsers.filter((u) => u.role === "admin").length} />
        <Stat icon={Users} label="Creators" value={demoUsers.filter((u) => u.role === "creator" && u.active).length} />
        <Stat icon={Users} label="Disabled" value={demoUsers.filter((u) => !u.active).length} />
      </div>

      <Card className="card-elevated">
        <CardHeader><CardTitle className="text-base">All users</CardTitle></CardHeader>
        <CardContent className="p-0">
          <div className="grid grid-cols-[minmax(0,1.4fr)_100px_minmax(0,1fr)_120px_120px_100px] px-4 py-2 text-[11px] font-medium uppercase tracking-wide text-muted-foreground border-b bg-secondary/40">
            <span>Name</span><span>Role</span><span>Projects</span><span>Workload</span><span>Last login</span><span>Status</span>
          </div>
          {demoUsers.map((u) => {
            const load = assignments.filter((a) => a.assigneeId === u.id && !["Approved","Scheduled","Published"].includes(a.status)).length;
            return (
              <div key={u.id} className="grid grid-cols-[minmax(0,1.4fr)_100px_minmax(0,1fr)_120px_120px_100px] px-4 py-3 text-sm items-center border-b last:border-0 hover:bg-secondary/40">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="grid h-8 w-8 place-items-center rounded-full bg-secondary text-xs font-semibold shrink-0">{u.avatarInitials}</div>
                  <div className="min-w-0">
                    <div className="font-medium truncate">{u.name}</div>
                    <div className="text-xs text-muted-foreground truncate">{u.email}</div>
                  </div>
                </div>
                <Badge variant="outline" className="text-[10px] w-fit capitalize">{u.role}</Badge>
                <div className="flex flex-wrap gap-1">
                  {u.projects === "all" ? (
                    <Badge variant="secondary" className="text-[10px]">All projects</Badge>
                  ) : (
                    u.projects.map((pid) => {
                      const p = projectById(pid);
                      return <Badge key={pid} variant="outline" className="text-[10px] gap-1"><span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: p.color }} />{p.name}</Badge>;
                    })
                  )}
                </div>
                <span className="text-xs text-muted-foreground">{u.role === "creator" ? `${load} active` : "—"}</span>
                <span className="text-xs text-muted-foreground">{u.lastLogin ?? "—"}</span>
                <div className="flex items-center gap-2">
                  {u.active
                    ? <Badge className="bg-mint/15 text-mint border-0 text-[10px]">Active</Badge>
                    : <Badge className="bg-rose/15 text-rose border-0 text-[10px]">Disabled</Badge>}
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>
    </>
  );
}

function Stat({ icon: Icon, label, value }: { icon: any; label: string; value: number }) {
  return (
    <Card className="card-elevated">
      <CardContent className="p-3 flex items-center gap-3">
        <div className="grid h-9 w-9 place-items-center rounded-md bg-secondary"><Icon className="h-4 w-4" /></div>
        <div>
          <div className="text-xl font-bold font-display">{value}</div>
          <div className="text-xs text-muted-foreground">{label}</div>
        </div>
      </CardContent>
    </Card>
  );
}
