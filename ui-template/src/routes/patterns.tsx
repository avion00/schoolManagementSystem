import { createFileRoute, Link } from "@tanstack/react-router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/hermes/AppShell";
import { winningPatterns, projects } from "@/lib/hermes-data";
import { useProject } from "@/components/hermes/ProjectProvider";
import { Sparkles, TrendingUp, ArrowRight, AlertTriangle } from "lucide-react";

export const Route = createFileRoute("/patterns")({
  head: () => ({ meta: [{ title: "Winning Patterns — Hermes" }] }),
  component: PatternsPage,
});

function PatternsPage() {
  const { projectId } = useProject();
  const patterns = winningPatterns.filter((p) => p.project === projectId);
  const project = projects.find((p) => p.id === projectId)!;

  return (
    <>
      <PageHeader
        title="Winning Patterns"
        subtitle={`Top proven patterns Hermes has identified for ${project.name}. Hermes decides the direction. You only step in when flagged.`}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 gap-6">
        {patterns.map((p) => (
          <Card key={p.id} className="card-elevated">
            <CardHeader>
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge className="gradient-ember text-navy border-0">{p.confidence} confidence</Badge>
                    <Badge variant="outline" className="gap-1"><TrendingUp className="h-3 w-3" />{p.evidence.split(",")[1]?.trim()}</Badge>
                  </div>
                  <CardTitle className="text-lg mt-2">{p.title}</CardTitle>
                </div>
                <Sparkles className="h-5 w-5 text-ember shrink-0" />
              </div>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <Field label="Evidence">{p.evidence}</Field>
              <Field label="Why it works">{p.why}</Field>
              <Field label="Recommended adaptation">
                <div className="rounded-md bg-secondary p-3">{p.adaptation}</div>
              </Field>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Field label="Customer pain">{p.pain}</Field>
                <Field label="Recommended CTA">{p.cta}</Field>
              </div>
              <Field label="Recommended hook">
                <blockquote className="border-l-2 border-ember pl-3 italic">{p.hook}</blockquote>
              </Field>
              <div className="flex gap-2 pt-2">
                <Button asChild className="gap-1"><Link to="/production"><ArrowRight className="h-4 w-4" />Create production recipe</Link></Button>
                <Button variant="outline">More evidence</Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="card-elevated mt-8 border-amber/40 bg-amber/5">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2"><AlertTriangle className="h-4 w-4 text-amber" />1 pattern needs CMO attention</CardTitle>
        </CardHeader>
        <CardContent className="text-sm">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <div className="font-medium">"£1 first-box trial" (Hartley Dogs)</div>
              <div className="text-muted-foreground mt-1">Recommendation proposes changing the current 50% off offer. Pricing change → routed to CMO Insights.</div>
            </div>
            <Button variant="outline" asChild><Link to="/cmo">Open in CMO Insights</Link></Button>
          </div>
        </CardContent>
      </Card>
    </>
  );
}

function Field({ label, children }: any) {
  return (
    <div>
      <div className="text-[11px] uppercase tracking-wide text-muted-foreground mb-1">{label}</div>
      <div>{children}</div>
    </div>
  );
}
