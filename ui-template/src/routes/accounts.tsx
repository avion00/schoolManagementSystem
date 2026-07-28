import { createFileRoute } from "@tanstack/react-router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/hermes/AppShell";
import { platformAccounts, projects } from "@/lib/hermes-data";
import { Plus, ShieldCheck, ShieldAlert, ShieldX } from "lucide-react";

export const Route = createFileRoute("/accounts")({
  head: () => ({ meta: [{ title: "Accounts & Platforms — Hermes" }] }),
  component: AccountsPage,
});

function AccountsPage() {
  return (
    <>
      <PageHeader
        title="Accounts & Platforms"
        subtitle="One matrix, all projects. Health, publishing method, last sync."
        actions={<Button className="gap-1"><Plus className="h-4 w-4" />Add account</Button>}
      />
      <div className="space-y-6">
        {projects.map((p) => {
          const rows = platformAccounts[p.id];
          return (
            <Card key={p.id} className="card-elevated">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full" style={{ backgroundColor: p.color }} />
                  {p.name}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
                  {rows.map((a) => (
                    <div key={a.platform} className="rounded-lg border p-3 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="font-semibold text-sm">{a.platform}</div>
                        <Health status={a.health} />
                      </div>
                      <div className="text-sm text-muted-foreground truncate">
                        {a.connected ? a.handle : <span className="italic">No {a.platform} account configured</span>}
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        <Badge variant={a.research ? "outline" : "secondary"} className="text-[10px]">
                          Research: {a.research ? "on" : "off"}
                        </Badge>
                        <Badge variant={a.publish === "Automatic" ? "default" : a.publish === "Manual" ? "outline" : "secondary"} className="text-[10px]">
                          Publish: {a.publish}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between pt-1">
                        <span className="text-[11px] text-muted-foreground">Sync: {a.lastSync}</span>
                        <Button size="sm" variant="ghost" className="h-7 text-xs">{a.connected ? "Edit" : "Connect"}</Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </>
  );
}

function Health({ status }: { status: string }) {
  if (status === "healthy") return <ShieldCheck className="h-4 w-4 text-mint" />;
  if (status === "degraded") return <ShieldAlert className="h-4 w-4 text-amber" />;
  return <ShieldX className="h-4 w-4 text-muted-foreground" />;
}
