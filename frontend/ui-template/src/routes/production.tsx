import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/hermes/AppShell";
import { productionCards, productionStages, projects } from "@/lib/hermes-data";
import { LayoutGrid, List, Clock, User } from "lucide-react";

export const Route = createFileRoute("/production")({
  head: () => ({ meta: [{ title: "Production — Hermes" }] }),
  component: Production,
});

const stageTone: Record<string, { chip: string; dot: string }> = {
  "Recipe ready": { chip: "bg-navy/10 text-navy", dot: "bg-navy" },
  "Assigned": { chip: "bg-primary/10 text-primary", dot: "bg-primary" },
  "In production": { chip: "bg-ember/15 text-ember", dot: "bg-ember" },
  "Review required": { chip: "bg-amber/15 text-amber", dot: "bg-amber" },
  "Revision requested": { chip: "bg-rose/15 text-rose", dot: "bg-rose" },
  "Approved": { chip: "bg-mint/15 text-mint", dot: "bg-mint" },
  "Scheduled": { chip: "bg-primary/10 text-primary", dot: "bg-primary" },
  "Published": { chip: "bg-muted text-muted-foreground", dot: "bg-muted-foreground" },
};

type GroupKey = "Preparation" | "Production" | "Review" | "Publishing";
const stageGroups: Record<GroupKey, readonly string[]> = {
  Preparation: ["Recipe ready", "Assigned"],
  Production: ["In production"],
  Review: ["Review required", "Revision requested", "Approved"],
  Publishing: ["Scheduled", "Published"],
};

function Production() {
  const [activeGroup, setActiveGroup] = useState<GroupKey>("Production");
  const [view, setView] = useState<"board" | "list">("board");

  const activeStages = stageGroups[activeGroup];
  const visibleCards = productionCards.filter((c) => activeStages.includes(c.stage));

  return (
    <>
      <PageHeader
        title="Production board"
        subtitle="From recipe to publish. Filter by workflow phase; card counts stay visible."
        actions={
          <>
            <div className="inline-flex rounded-md border p-0.5 bg-card">
              <button
                onClick={() => setView("board")}
                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs ${view === "board" ? "bg-secondary" : "text-muted-foreground"}`}
              ><LayoutGrid className="h-3.5 w-3.5" /> Board</button>
              <button
                onClick={() => setView("list")}
                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs ${view === "list" ? "bg-secondary" : "text-muted-foreground"}`}
              ><List className="h-3.5 w-3.5" /> List</button>
            </div>
            <Button size="sm" asChild><Link to="/patterns">New recipe from pattern</Link></Button>
          </>
        }
      />

      {/* Phase selector with full-stage counts */}
      <div className="mb-5 grid grid-cols-2 md:grid-cols-4 gap-2">
        {(Object.keys(stageGroups) as GroupKey[]).map((g) => {
          const stages = stageGroups[g];
          const total = productionCards.filter((c) => stages.includes(c.stage)).length;
          const active = g === activeGroup;
          return (
            <button
              key={g}
              onClick={() => setActiveGroup(g)}
              className={`text-left rounded-lg border p-3 transition-colors ${active ? "border-ember bg-ember/5" : "hover:bg-secondary/50"}`}
            >
              <div className="flex items-center justify-between">
                <span className={`text-sm font-semibold ${active ? "text-ember" : ""}`}>{g}</span>
                <span className="text-lg font-bold font-display">{total}</span>
              </div>
              <div className="mt-2 flex flex-wrap gap-1">
                {stages.map((s) => {
                  const n = productionCards.filter((c) => c.stage === s).length;
                  return (
                    <span key={s} className="inline-flex items-center gap-1 text-[10px] text-muted-foreground">
                      <span className={`h-1.5 w-1.5 rounded-full ${stageTone[s].dot}`} />
                      {s} · {n}
                    </span>
                  );
                })}
              </div>
            </button>
          );
        })}
      </div>

      {view === "board" ? (
        <div className={`grid gap-4 ${activeStages.length === 1 ? "grid-cols-1" : activeStages.length === 2 ? "grid-cols-1 md:grid-cols-2" : "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"}`}>
          {activeStages.map((stage) => {
            const cards = productionCards.filter((c) => c.stage === stage);
            return (
              <div key={stage} className="min-w-0 rounded-lg bg-secondary/40 p-3">
                <div className={`text-xs font-semibold uppercase tracking-wide rounded-md px-2.5 py-1.5 mb-3 inline-flex items-center gap-2 ${stageTone[stage].chip}`}>
                  {stage} <span className="opacity-70">{cards.length}</span>
                </div>
                <div className="space-y-2">
                  {cards.map((c) => {
                    const project = projects.find((p) => p.id === c.project)!;
                    return (
                      <Link key={c.id} to="/approvals/$id" params={{ id: c.id }}>
                        <Card className="card-elevated hover:shadow-md transition-shadow cursor-pointer">
                          <CardContent className="p-3 space-y-2">
                            <div className="flex items-start gap-2">
                              <span className="mt-1.5 h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: project.color }} />
                              <div className="text-sm font-medium leading-snug min-w-0">{c.title}</div>
                            </div>
                            <div className="flex items-center justify-between text-xs text-muted-foreground">
                              <span className="flex items-center gap-1 truncate"><User className="h-3 w-3" />{c.assignee}</span>
                              <span className="flex items-center gap-1 shrink-0"><Clock className="h-3 w-3" />{c.due}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="text-[10px]">Video · 9:16</Badge>
                              <Badge className={`${stageTone[stage].chip} text-[10px] border-0`}>{stage}</Badge>
                            </div>
                          </CardContent>
                        </Card>
                      </Link>
                    );
                  })}
                  {cards.length === 0 && (
                    <div className="text-xs text-muted-foreground border border-dashed rounded-md p-3 text-center bg-card">Empty</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <Card className="card-elevated">
          <CardContent className="p-0">
            <div className="grid grid-cols-[minmax(0,1fr)_120px_120px_100px_120px_100px] px-4 py-2 text-[11px] font-medium uppercase tracking-wide text-muted-foreground border-b bg-secondary/40">
              <span>Title</span><span>Project</span><span>Owner</span><span>Type</span><span>Stage</span><span>Due</span>
            </div>
            {visibleCards.map((c) => {
              const project = projects.find((p) => p.id === c.project)!;
              return (
                <Link key={c.id} to="/approvals/$id" params={{ id: c.id }} className="grid grid-cols-[minmax(0,1fr)_120px_120px_100px_120px_100px] px-4 py-3 text-sm items-center hover:bg-secondary/50 border-b last:border-0">
                  <span className="font-medium truncate">{c.title}</span>
                  <span className="flex items-center gap-1.5 text-xs truncate"><span className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: project.color }} />{project.name}</span>
                  <span className="text-xs text-muted-foreground truncate">{c.assignee}</span>
                  <span className="text-xs">Video 9:16</span>
                  <Badge className={`${stageTone[c.stage].chip} text-[10px] border-0 w-fit`}>{c.stage}</Badge>
                  <span className="text-xs text-muted-foreground">{c.due}</span>
                </Link>
              );
            })}
            {visibleCards.length === 0 && (
              <div className="p-8 text-center text-sm text-muted-foreground">No cards in this phase.</div>
            )}
          </CardContent>
        </Card>
      )}
    </>
  );
}
