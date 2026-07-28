import { createFileRoute, Link } from "@tanstack/react-router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { PageHeader } from "@/components/hermes/AppShell";
import { Users, ChevronRight } from "lucide-react";

export const Route = createFileRoute("/settings")({
  head: () => ({ meta: [{ title: "Settings — Hermes" }] }),
  component: SettingsPage,
});

function SettingsPage() {
  return (
    <>
      <PageHeader
        title="Settings"
        subtitle="Team, preferences and safety defaults."
        actions={<Button asChild size="sm" className="gap-1"><Link to="/settings/users"><Users className="h-4 w-4" /> Users & roles <ChevronRight className="h-3.5 w-3.5" /></Link></Button>}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-4xl">
        <Card className="card-elevated">
          <CardHeader><CardTitle className="text-base">Workspace</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div><Label className="text-xs">Workspace name</Label><Input defaultValue="Mission Ops" /></div>
            <div><Label className="text-xs">Owner</Label><Input defaultValue="Mike (Mission Ops)" /></div>
            <div><Label className="text-xs">Default project</Label><Input defaultValue="FlottaHub" /></div>
          </CardContent>
        </Card>
        <Card className="card-elevated">
          <CardHeader><CardTitle className="text-base">Safety defaults</CardTitle></CardHeader>
          <CardContent className="space-y-4 text-sm">
            <Toggle label="Safe Research Mode on for every new brief" hint="Recommended. Conservative rate limits and human-like pauses." checked />
            <Toggle label="Require CMO approval for pricing / offer changes" checked />
            <Toggle label="Require CMO approval for website copy edits" checked />
            <Toggle label="Send Slack alert on circuit-breaker trip" checked />
            <Toggle label="Allow auto-publish on Instagram / Facebook after approval" checked />
          </CardContent>
        </Card>
        <Card className="card-elevated">
          <CardHeader><CardTitle className="text-base">Team</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm">
            {[
              { n: "Mike (Mission Ops)", r: "Owner / CMO" },
              { n: "Anna R.", r: "Producer" },
              { n: "Tom H.", r: "Producer" },
              { n: "Marco G.", r: "Producer (IT)" },
            ].map((m) => (
              <div key={m.n} className="flex items-center justify-between border-b last:border-0 py-2">
                <div><div className="font-medium">{m.n}</div><div className="text-xs text-muted-foreground">{m.r}</div></div>
                <Button size="sm" variant="ghost">Manage</Button>
              </div>
            ))}
          </CardContent>
        </Card>
        <Card className="card-elevated">
          <CardHeader><CardTitle className="text-base">Data & retention</CardTitle></CardHeader>
          <CardContent className="space-y-3 text-sm">
            <Toggle label="Auto-delete rejected drafts after 7 days" checked />
            <Toggle label="Auto-clean browser caches after each job" checked />
            <Toggle label="Retain research media (large files) beyond analysis" />
          </CardContent>
        </Card>
      </div>
    </>
  );
}

function Toggle({ label, hint, checked }: { label: string; hint?: string; checked?: boolean }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div className="min-w-0"><div>{label}</div>{hint && <div className="text-xs text-muted-foreground mt-0.5">{hint}</div>}</div>
      <Switch defaultChecked={checked} />
    </div>
  );
}
