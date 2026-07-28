import { createFileRoute } from "@tanstack/react-router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/hermes/AppShell";
import { useAuth } from "@/components/hermes/AuthProvider";
import { projectById } from "@/lib/hermes-data";
import { assignmentsFor } from "@/lib/hermes-assignments";
import { LogOut } from "lucide-react";

export const Route = createFileRoute("/profile")({
  head: () => ({ meta: [{ title: "My Profile — Hermes" }] }),
  component: ProfilePage,
});

function ProfilePage() {
  const { user, logout } = useAuth();
  if (!user) return null;
  const mine = assignmentsFor(user.id);
  const projs = user.projects === "all" ? [] : user.projects;

  return (
    <>
      <PageHeader title="My profile" subtitle="Your Hermes creator account." />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-5xl">
        <Card className="card-elevated">
          <CardHeader><CardTitle className="text-base">Account</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex items-center gap-3 mb-3">
              <div className="grid h-14 w-14 place-items-center rounded-full bg-secondary text-lg font-semibold">{user.avatarInitials}</div>
              <div>
                <div className="font-medium">{user.name}</div>
                <div className="text-xs text-muted-foreground">{user.email}</div>
              </div>
            </div>
            <Row k="Role" v="Creator" />
            <Row k="Status" v={user.active ? "Active" : "Disabled"} />
            <Row k="Last login" v={user.lastLogin ?? "—"} />
            <Button variant="outline" size="sm" className="gap-2 mt-3" onClick={logout}><LogOut className="h-4 w-4" /> Sign out</Button>
          </CardContent>
        </Card>
        <Card className="card-elevated">
          <CardHeader><CardTitle className="text-base">Projects you can access</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm">
            {projs.length === 0 && <div className="text-xs text-muted-foreground">All projects</div>}
            {projs.map((id) => {
              const p = projectById(id);
              return (
                <div key={id} className="flex items-center gap-2 border-b last:border-0 py-1.5">
                  <span className="h-2 w-2 rounded-full" style={{ backgroundColor: p.color }} />
                  <div className="min-w-0">
                    <div className="font-medium">{p.name}</div>
                    <div className="text-xs text-muted-foreground truncate">{p.tagline}</div>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
        <Card className="card-elevated">
          <CardHeader><CardTitle className="text-base">Current workload</CardTitle></CardHeader>
          <CardContent className="text-sm space-y-2">
            <Row k="Active tasks" v={String(mine.filter((a) => !["Approved","Scheduled","Published"].includes(a.status)).length)} />
            <Row k="In revision" v={String(mine.filter((a) => a.status === "Revision Requested").length)} />
            <Row k="Waiting review" v={String(mine.filter((a) => a.status === "Submitted for Review" || a.status === "Resubmitted").length)} />
            <Row k="Completed" v={String(mine.filter((a) => ["Approved","Scheduled","Published"].includes(a.status)).length)} />
          </CardContent>
        </Card>
      </div>
    </>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="grid grid-cols-[120px_1fr] gap-3 border-b last:border-0 py-1.5">
      <div className="text-xs text-muted-foreground">{k}</div>
      <div>{v}</div>
    </div>
  );
}
