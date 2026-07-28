import { createFileRoute } from "@tanstack/react-router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/hermes/AppShell";
import { cmoInsights, projects } from "@/lib/hermes-data";
import { AlertTriangle, Lightbulb } from "lucide-react";

export const Route = createFileRoute("/cmo")({
  head: () => ({ meta: [{ title: "CMO Insights — Hermes" }] }),
  component: CMO,
});

const sevTone: Record<string, string> = {
  high: "bg-rose/15 text-rose border-rose/30",
  medium: "bg-amber/15 text-amber border-amber/30",
  low: "bg-mint/15 text-mint border-mint/30",
};

function CMO() {
  return (
    <>
      <PageHeader
        title="CMO Insights"
        subtitle="Only decisions that need Mike's judgment. Everything else Hermes handles."
      />
      <div className="space-y-4">
        {cmoInsights.map((i) => {
          const project = projects.find((p) => p.id === i.project)!;
          return (
            <Card key={i.id} className="card-elevated">
              <CardHeader>
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`grid h-9 w-9 place-items-center rounded-md border ${sevTone[i.severity]}`}>
                      {i.severity === "high" ? <AlertTriangle className="h-4 w-4" /> : <Lightbulb className="h-4 w-4" />}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: project.color }} />
                        <span>{project.name}</span>
                        <Badge variant="outline" className="text-[10px] uppercase">{i.severity}</Badge>
                      </div>
                      <CardTitle className="text-base mt-1">{i.title}</CardTitle>
                    </div>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <Button size="sm" variant="outline">Decline</Button>
                    <Button size="sm">Approve</Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="text-sm">
                <p className="text-muted-foreground">{i.body}</p>
                <div className="mt-3 text-xs uppercase tracking-wide text-muted-foreground">Decision · <span className="normal-case text-foreground">{i.decision}</span></div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </>
  );
}
