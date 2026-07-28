import { createFileRoute, Link } from "@tanstack/react-router";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/hermes/AppShell";
import { productionCards, projects } from "@/lib/hermes-data";
import { Play, Clock, User } from "lucide-react";

export const Route = createFileRoute("/approvals")({
  head: () => ({ meta: [{ title: "Approvals — Hermes" }] }),
  component: ApprovalsList,
});

const statusTone: Record<string, string> = {
  "Review required": "bg-amber/15 text-amber",
  "Revision requested": "bg-rose/15 text-rose",
};

function ApprovalsList() {
  const waiting = productionCards.filter((c) => c.stage === "Review required" || c.stage === "Revision requested");
  return (
    <>
      <PageHeader
        title="Approvals queue"
        subtitle={`${waiting.length} assets waiting on review. Open full review to compare against the recipe.`}
      />
      <Card className="card-elevated">
        <CardContent className="p-0 divide-y">
          {waiting.map((c, i) => {
            const project = projects.find((p) => p.id === c.project)!;
            return (
              <div key={c.id} className="grid grid-cols-[80px_minmax(0,1fr)_auto] md:grid-cols-[100px_minmax(0,1fr)_auto] gap-4 p-4 items-center hover:bg-secondary/40 transition-colors">
                <div className="relative aspect-[9/16] rounded-md overflow-hidden bg-navy">
                  <img src="https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?w=200&q=80" alt="" className="h-full w-full object-cover" />
                  <div className="absolute inset-0 grid place-items-center bg-black/30">
                    <Play className="h-5 w-5 text-white" fill="currentColor" />
                  </div>
                </div>
                <div className="min-w-0 space-y-1.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium">{c.title}</span>
                    <Badge variant="outline" className="text-[10px]">v{i + 2}</Badge>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
                    <span className="inline-flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: project.color }} />{project.name}</span>
                    <span className="inline-flex items-center gap-1"><User className="h-3 w-3" />{c.assignee}</span>
                    <span className="inline-flex items-center gap-1"><Clock className="h-3 w-3" />Due {c.due}</span>
                    <span>Video · 9:16</span>
                  </div>
                  <Badge className={`${statusTone[c.stage]} border-0 text-[10px]`}>{c.stage}</Badge>
                </div>
                <Button size="sm" asChild><Link to="/approvals/$id" params={{ id: c.id }}>Open full review</Link></Button>
              </div>
            );
          })}
          {waiting.length === 0 && (
            <div className="p-10 text-center text-sm text-muted-foreground">Nothing waiting. Great job.</div>
          )}
        </CardContent>
      </Card>
    </>
  );
}
