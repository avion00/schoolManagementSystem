import { createFileRoute } from "@tanstack/react-router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/hermes/AppShell";
import { projects, platformAccounts, type ProjectId } from "@/lib/hermes-data";
import { useProject } from "@/components/hermes/ProjectProvider";
import { Plus, Pencil, ShieldCheck, ShieldAlert, ShieldX } from "lucide-react";

export const Route = createFileRoute("/projects")({
  head: () => ({ meta: [{ title: "Projects — Hermes" }] }),
  component: ProjectsPage,
});

function ProjectsPage() {
  const { projectId, setProjectId } = useProject();
  const project = projects.find((p) => p.id === projectId)!;
  const accounts = platformAccounts[projectId as ProjectId];

  return (
    <>
      <PageHeader title="Projects" subtitle="Business context, brand voice and connected platforms." />

      <div className="flex flex-wrap gap-2 mb-6">
        {projects.map((p) => (
          <button
            key={p.id}
            onClick={() => setProjectId(p.id)}
            className={`px-4 py-2 rounded-md text-sm font-medium border transition-colors ${
              p.id === projectId ? "bg-primary text-primary-foreground border-primary" : "bg-card hover:bg-accent"
            }`}
          >
            <span className="inline-block h-2 w-2 rounded-full mr-2 align-middle" style={{ backgroundColor: p.color }} />
            {p.name}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <Card className="lg:col-span-2 card-elevated">
          <CardHeader className="flex-row items-start justify-between">
            <div>
              <CardTitle className="text-xl">{project.name}</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">{project.tagline}</p>
            </div>
            <Button variant="outline" size="sm" className="gap-1"><Pencil className="h-3.5 w-3.5" /> Edit</Button>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <Field label="Business description" value={project.description} />
            <div className="grid grid-cols-2 gap-4">
              <Field label="Target customer" value={project.customer} />
              <Field label="Offer" value={project.offer} />
              <Field label="Country" value={project.country} />
              <Field label="Language" value={project.language} />
            </div>
            <Field label="Brand voice" value={project.voice} />
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="card-elevated">
            <CardHeader><CardTitle className="text-base">Approved claims</CardTitle></CardHeader>
            <CardContent className="space-y-1.5">
              {project.approvedClaims.map((c) => (
                <div key={c} className="flex items-start gap-2 text-sm"><ShieldCheck className="h-4 w-4 text-mint mt-0.5 shrink-0" /><span>{c}</span></div>
              ))}
            </CardContent>
          </Card>
          <Card className="card-elevated">
            <CardHeader><CardTitle className="text-base">Prohibited claims</CardTitle></CardHeader>
            <CardContent className="space-y-1.5">
              {project.prohibitedClaims.map((c) => (
                <div key={c} className="flex items-start gap-2 text-sm"><ShieldX className="h-4 w-4 text-rose mt-0.5 shrink-0" /><span>{c}</span></div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>

      <Card className="card-elevated">
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle>Connected platforms</CardTitle>
          <Button size="sm" className="gap-1"><Plus className="h-4 w-4" /> Add account</Button>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs uppercase text-muted-foreground border-b">
                  <th className="py-2 pr-4 font-medium">Platform</th>
                  <th className="py-2 pr-4 font-medium">Account</th>
                  <th className="py-2 pr-4 font-medium">Research</th>
                  <th className="py-2 pr-4 font-medium">Publishing</th>
                  <th className="py-2 pr-4 font-medium">Last sync</th>
                  <th className="py-2 pr-4 font-medium">Health</th>
                  <th className="py-2 font-medium"></th>
                </tr>
              </thead>
              <tbody>
                {accounts.map((a) => (
                  <tr key={a.platform} className="border-b last:border-0">
                    <td className="py-3 pr-4 font-medium">{a.platform}</td>
                    <td className="py-3 pr-4">
                      {a.connected ? a.handle : <span className="text-muted-foreground italic">No {a.platform} account configured</span>}
                    </td>
                    <td className="py-3 pr-4">
                      {a.research ? <Badge variant="outline" className="gap-1"><span className="h-1.5 w-1.5 rounded-full bg-mint" />Enabled</Badge> : <Badge variant="secondary">Disabled</Badge>}
                    </td>
                    <td className="py-3 pr-4"><Badge variant={a.publish === "Automatic" ? "default" : a.publish === "Manual" ? "outline" : "secondary"}>{a.publish}</Badge></td>
                    <td className="py-3 pr-4 text-muted-foreground">{a.lastSync}</td>
                    <td className="py-3 pr-4"><HealthBadge status={a.health} /></td>
                    <td className="py-3 text-right"><Button variant="ghost" size="sm">{a.connected ? "Edit" : "Connect"}</Button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1">{label}</div>
      <div>{value}</div>
    </div>
  );
}

function HealthBadge({ status }: { status: string }) {
  if (status === "healthy") return <Badge variant="outline" className="gap-1"><ShieldCheck className="h-3 w-3 text-mint" />Healthy</Badge>;
  if (status === "degraded") return <Badge variant="outline" className="gap-1"><ShieldAlert className="h-3 w-3 text-amber" />Degraded</Badge>;
  return <Badge variant="secondary">Not configured</Badge>;
}
