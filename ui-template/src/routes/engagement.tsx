import { createFileRoute } from "@tanstack/react-router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/hermes/AppShell";
import { engagementOpportunities, projects } from "@/lib/hermes-data";
import { Copy, ExternalLink, CheckCircle2, Video, TrendingUp } from "lucide-react";

export const Route = createFileRoute("/engagement")({
  head: () => ({ meta: [{ title: "Engagement Radar — Hermes" }] }),
  component: Engagement,
});

function Engagement() {
  return (
    <>
      <PageHeader
        title="Engagement Radar"
        subtitle="~20 valuable conversations per day. Replies are drafted for a human to post. Helpful first, subtle mention only when natural."
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {engagementOpportunities.map((o) => {
          const project = projects.find((p) => p.id === o.project)!;
          return (
            <Card key={o.id} className="card-elevated">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                      <Badge variant="secondary" className="text-[10px]">{o.platform}</Badge>
                      <span>{o.creator}</span>
                      <span className="h-1 w-1 rounded-full bg-muted-foreground/40" />
                      <span className="flex items-center gap-1"><TrendingUp className="h-3 w-3" />{o.velocity}</span>
                    </div>
                    <CardTitle className="text-sm font-medium leading-snug">"{o.excerpt}"</CardTitle>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="inline-block h-2 w-2 rounded-full" style={{ backgroundColor: project.color }} />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="rounded-md bg-secondary p-2.5 text-xs"><span className="font-medium">Why it's relevant · </span>{o.relevance}</div>
                <div>
                  <div className="text-[11px] uppercase tracking-wide text-muted-foreground mb-1">Suggested reply</div>
                  <blockquote className="border-l-2 border-ember pl-3 italic">{o.reply}</blockquote>
                </div>
                {o.replyIdea !== "None." && o.replyIdea !== "None — text reply is enough here." && o.replyIdea !== "None — natural mention only if the thread invites it." && (
                  <div className="flex items-start gap-2 text-xs text-muted-foreground"><Video className="h-3.5 w-3.5 mt-0.5 shrink-0 text-ember" /><span>{o.replyIdea}</span></div>
                )}
                <div className="text-xs text-muted-foreground"><span className="font-medium text-foreground">Expected benefit · </span>{o.benefit}</div>
                <div className="flex flex-wrap gap-2 pt-1">
                  <Button size="sm" variant="outline" className="gap-1"><ExternalLink className="h-3.5 w-3.5" />Open original</Button>
                  <Button size="sm" variant="outline" className="gap-1"><Copy className="h-3.5 w-3.5" />Copy reply</Button>
                  <Button size="sm" className="gap-1"><CheckCircle2 className="h-3.5 w-3.5" />Mark as posted</Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </>
  );
}
