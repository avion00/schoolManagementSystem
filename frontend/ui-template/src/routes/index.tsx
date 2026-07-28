import { createFileRoute, Link } from "@tanstack/react-router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { PageHeader } from "@/components/hermes/AppShell";
import { commandCenter, viralPosts, projects } from "@/lib/hermes-data";
import { useProject } from "@/components/hermes/ProjectProvider";
import {
  Radar, Sparkles, Clapperboard, CheckCircle2, CalendarDays, Radio,
  HardDrive, Activity, ArrowUpRight, Users, ShoppingBag, AlertCircle,
  Lightbulb, Send, Eye, Heart, MessageCircle,
} from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({ meta: [{ title: "Command Center — Hermes" }] }),
  component: Index,
});

function AttentionCard({ icon: Icon, count, label, cta, to, tone }: any) {
  const toneMap: Record<string, string> = {
    rose: "border-rose/40 bg-rose/5 text-rose",
    amber: "border-amber/40 bg-amber/5 text-amber",
    ember: "border-ember/40 bg-ember/5 text-ember",
  };
  return (
    <Link to={to} className={`block rounded-xl border-2 p-4 hover:shadow-md transition-shadow ${toneMap[tone]}`}>
      <div className="flex items-start justify-between">
        <Icon className="h-5 w-5" />
        <span className="text-3xl font-bold font-display leading-none">{count}</span>
      </div>
      <div className="mt-3 text-sm font-semibold text-foreground">{label}</div>
      <div className="mt-1 text-xs text-muted-foreground flex items-center gap-1">{cta} <ArrowUpRight className="h-3 w-3" /></div>
    </Link>
  );
}

function OpsStat({ icon: Icon, label, value, hint }: any) {
  return (
    <div className="rounded-lg border bg-card p-4">
      <div className="flex items-center gap-2 text-muted-foreground text-xs mb-2">
        <Icon className="h-3.5 w-3.5" />
        {label}
      </div>
      <div className="text-xl font-bold font-display">{value}</div>
      {hint && <div className="text-[11px] text-muted-foreground mt-0.5">{hint}</div>}
    </div>
  );
}

function ResultTile({ icon: Icon, label, value, tone = "default" }: any) {
  const toneMap: Record<string, string> = {
    default: "text-primary bg-primary/10",
    mint: "text-mint bg-mint/10",
    ember: "text-ember bg-ember/10",
  };
  return (
    <div className="flex items-center gap-3 rounded-lg border bg-card p-3">
      <div className={`grid h-9 w-9 place-items-center rounded-md ${toneMap[tone]}`}>
        <Icon className="h-4 w-4" />
      </div>
      <div className="min-w-0">
        <div className="text-lg font-bold font-display leading-tight">{value}</div>
        <div className="text-xs text-muted-foreground truncate">{label}</div>
      </div>
    </div>
  );
}

function Index() {
  const { projectId } = useProject();
  const project = projects.find((p) => p.id === projectId)!;
  const c = commandCenter;
  const findings = viralPosts.filter((v) => v.project === projectId).slice(0, 3);

  return (
    <>
      <PageHeader
        title={`Command Center · ${project.name}`}
        subtitle="What needs Mike now, what's running, and how it's paying off."
        actions={
          <>
            <Button variant="outline" size="sm" asChild><Link to="/system">System health</Link></Button>
            <Button size="sm" asChild><Link to="/research">New research brief</Link></Button>
          </>
        }
      />

      {/* Tier 1 — Needs attention now */}
      <section className="mb-8">
        <div className="flex items-center gap-2 mb-3">
          <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-rose/15">
            <AlertCircle className="h-3.5 w-3.5 text-rose" />
          </span>
          <h2 className="text-sm font-semibold uppercase tracking-wide">Needs attention now</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-3">
          <AttentionCard icon={CheckCircle2} count={c.awaitingApproval} label="Awaiting approval" cta="Review assets" to="/approvals" tone="rose" />
          <AttentionCard icon={Lightbulb} count={2} label="CMO decisions pending" cta="Open CMO Insights" to="/cmo" tone="rose" />
          <AttentionCard icon={Send} count={2} label="Manual publishing packs" cta="Publish to TikTok / X" to="/calendar" tone="amber" />
          <AttentionCard icon={Clapperboard} count={1} label="Overdue in production" cta="Open production board" to="/production" tone="amber" />
          <AttentionCard icon={Radio} count={c.engagementOpportunities} label="Fresh engagement opps" cta="See radar" to="/engagement" tone="ember" />
        </div>
      </section>

      {/* Tier 2 — Current operations */}
      <section className="mb-8">
        <div className="flex items-center gap-2 mb-3">
          <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-primary/15">
            <Activity className="h-3.5 w-3.5 text-primary" />
          </span>
          <h2 className="text-sm font-semibold uppercase tracking-wide">Current operations</h2>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <Card className="lg:col-span-2 card-elevated">
            <CardHeader className="flex-row items-center justify-between pb-3">
              <CardTitle className="text-base flex items-center gap-2"><Radar className="h-4 w-4" /> Research jobs running</CardTitle>
              <Button variant="ghost" size="sm" asChild><Link to="/research">View all</Link></Button>
            </CardHeader>
            <CardContent className="space-y-3">
              {c.researchJobs.map((j) => (
                <div key={j.id} className="space-y-1.5">
                  <div className="flex items-center justify-between gap-2">
                    <div className="text-sm font-medium truncate">{j.name}</div>
                    <div className="text-xs text-muted-foreground shrink-0">ETA {j.eta}</div>
                  </div>
                  <Progress value={j.progress} className="h-1.5" />
                </div>
              ))}
            </CardContent>
          </Card>
          <div className="grid grid-cols-2 gap-3">
            <OpsStat icon={Clapperboard} label="In production" value={c.awaitingProduction} hint="Across all projects" />
            <OpsStat icon={CalendarDays} label="Scheduled this week" value={c.scheduledThisWeek} hint="Auto + manual" />
            <OpsStat icon={Sparkles} label="New viral findings" value={c.viralFindings} hint="Last 24h" />
            <OpsStat icon={CheckCircle2} label="Approved, awaiting slot" value={1} hint="From approvals" />
          </div>
        </div>
      </section>

      {/* Tier 3 — Results & system health */}
      <section className="mb-8">
        <div className="flex items-center gap-2 mb-3">
          <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-mint/15">
            <ArrowUpRight className="h-3.5 w-3.5 text-mint" />
          </span>
          <h2 className="text-sm font-semibold uppercase tracking-wide">Results & system health</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
          <ResultTile icon={Users} label="Attributed leads (7d)" value={c.attributedLeads} tone="mint" />
          <ResultTile icon={ShoppingBag} label="Attributed sales (7d)" value={c.attributedSales} tone="mint" />
          <ResultTile icon={Radio} label="Engagement opps live" value={c.engagementOpportunities} tone="ember" />
          <ResultTile icon={Sparkles} label="Verified findings" value={c.viralFindings} tone="ember" />
          <ResultTile icon={HardDrive} label={`Storage ${c.storageUsedGB}/${c.storageTotalGB}GB`} value={`${Math.round(c.storageUsedGB/c.storageTotalGB*100)}%`} />
          <ResultTile icon={Activity} label={`Browsers ${c.browserProcesses}/${c.browserLimit} · Healthy`} value="OK" tone="mint" />
        </div>
      </section>

      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold uppercase tracking-wide">Fresh viral findings for {project.name}</h2>
          <Button variant="ghost" size="sm" asChild><Link to="/research">See all findings</Link></Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {findings.map((v) => (
            <Link key={v.id} to="/research/$id" params={{ id: v.id }}>
              <Card className="card-elevated overflow-hidden hover:shadow-md transition-shadow">
                <div className="aspect-video bg-muted relative">
                  <img src={v.thumb} alt="" className="h-full w-full object-cover" />
                  <Badge className="absolute top-2 left-2 gradient-ember text-navy border-0">Viral {v.viralScore}</Badge>
                  <Badge variant="secondary" className="absolute top-2 right-2">{v.platform}</Badge>
                </div>
                <CardContent className="p-4">
                  <div className="text-xs text-muted-foreground mb-1">{v.creator} · {v.followers} · {v.age}</div>
                  <div className="text-sm font-medium line-clamp-2">{v.hook}</div>
                  <div className="mt-3 flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><Eye className="h-3 w-3" />{v.views}</span>
                    <span className="flex items-center gap-1"><Heart className="h-3 w-3" />{v.likes}</span>
                    <span className="flex items-center gap-1"><MessageCircle className="h-3 w-3" />{v.comments}</span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}
