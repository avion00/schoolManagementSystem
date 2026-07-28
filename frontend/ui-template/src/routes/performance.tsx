import { createFileRoute } from "@tanstack/react-router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/hermes/AppShell";
import { performancePosts, projects } from "@/lib/hermes-data";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

export const Route = createFileRoute("/performance")({
  head: () => ({ meta: [{ title: "Performance — Hermes" }] }),
  component: Performance,
});

const verdictTone: Record<string, string> = {
  SCALE: "bg-mint text-navy",
  IMPROVE: "bg-amber text-navy",
  STOP: "bg-rose text-white",
};
const verdictIcon: Record<string, any> = { SCALE: TrendingUp, IMPROVE: Minus, STOP: TrendingDown };

function Performance() {
  return (
    <>
      <PageHeader
        title="Performance & learning"
        subtitle="Every published post scored at 24h and 7 days. Hermes decides what to scale, improve or stop."
      />

      <div className="space-y-4">
        {performancePosts.map((p) => {
          const project = projects.find((pr) => pr.id === p.project)!;
          const Icon = verdictIcon[p.verdict];
          return (
            <Card key={p.id} className="card-elevated">
              <CardContent className="p-4 md:p-5">
                <div className="grid grid-cols-1 lg:grid-cols-[140px_1fr_auto] gap-4">
                  <div className="aspect-[9/16] rounded-md overflow-hidden bg-navy max-w-[140px]">
                    <img src={p.thumb} alt="" className="h-full w-full object-cover" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-2">
                      <span className="h-2 w-2 rounded-full" style={{ backgroundColor: project.color }} />
                      <span className="text-sm text-muted-foreground">{project.name} · {p.platform} · {p.publishedAgo} ago</span>
                    </div>
                    <h3 className="text-lg font-semibold mb-3">{p.title}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <MetricTable label="After 24h" m={p.d1} />
                      <MetricTable label="After 7 days" m={p.d7} />
                    </div>
                    <div className="mt-3 text-sm text-muted-foreground">
                      Inspiration score <span className="text-foreground font-medium">{p.inspirationScore}</span> · Our score <span className="text-foreground font-medium">{p.ourScore}</span>
                    </div>
                    <div className="mt-3 rounded-md bg-secondary p-3 text-sm">
                      <span className="text-xs uppercase tracking-wide text-muted-foreground">Hermes learned · </span>
                      {p.learning}
                    </div>
                  </div>
                  <div className="lg:text-right">
                    <Badge className={`${verdictTone[p.verdict]} gap-1 border-0`}>
                      <Icon className="h-3 w-3" />{p.verdict}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </>
  );
}

function MetricTable({ label, m }: any) {
  return (
    <div>
      <div className="text-[11px] uppercase tracking-wide text-muted-foreground mb-1.5">{label}</div>
      <div className="grid grid-cols-3 gap-x-3 gap-y-1 text-xs">
        <Cell k="Views" v={m.views} /><Cell k="Likes" v={m.likes} /><Cell k="Comments" v={m.comments} />
        <Cell k="Shares" v={m.shares} /><Cell k="Followers +" v={m.followers} /><Cell k="Profile visits" v={m.visits} />
        <Cell k="Clicks" v={m.clicks} /><Cell k="Leads" v={m.leads} /><Cell k="Sales" v={m.sales} />
      </div>
    </div>
  );
}
function Cell({ k, v }: { k: string; v: string | number }) {
  return <div><span className="text-muted-foreground">{k}: </span><span className="font-medium">{v}</span></div>;
}
