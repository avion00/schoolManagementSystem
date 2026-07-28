import { createFileRoute } from "@tanstack/react-router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { PageHeader } from "@/components/hermes/AppShell";
import { commandCenter } from "@/lib/hermes-data";
import { Pause, HardDrive, Activity, ShieldCheck, AlertTriangle, RotateCcw } from "lucide-react";

export const Route = createFileRoute("/system")({
  head: () => ({ meta: [{ title: "System Health — Hermes" }] }),
  component: SystemPage,
});

function SystemPage() {
  const c = commandCenter;
  const storagePct = (c.storageUsedGB / c.storageTotalGB) * 100;
  return (
    <>
      <PageHeader
        title="Storage & System Health"
        subtitle="What Hermes is doing under the hood right now."
        actions={<Button variant="outline" className="gap-1"><Pause className="h-4 w-4" />Pause all research</Button>}
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card className="card-elevated">
          <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><HardDrive className="h-4 w-4" />Storage</CardTitle></CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-display">{c.storageUsedGB} <span className="text-sm text-muted-foreground font-normal">/ {c.storageTotalGB} GB</span></div>
            <Progress value={storagePct} className="h-1.5 mt-2" />
            <div className="text-xs text-muted-foreground mt-1">{Math.round(storagePct)}% used</div>
          </CardContent>
        </Card>
        <Card className="card-elevated">
          <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><Activity className="h-4 w-4" />Browser processes</CardTitle></CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-display">{c.browserProcesses} <span className="text-sm text-muted-foreground font-normal">/ {c.browserLimit}</span></div>
            <div className="text-xs text-muted-foreground mt-1">Within safe limits</div>
          </CardContent>
        </Card>
        <Card className="card-elevated">
          <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-mint" />Circuit breaker</CardTitle></CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-display">Healthy</div>
            <div className="text-xs text-muted-foreground mt-1">0 failures in last hour</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="card-elevated">
          <CardHeader><CardTitle className="text-base">Recent events</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm">
            <Ev tone="warn" t="12 min ago" m="Facebook Reels rate-limit hit — job auto-paused and requeued" />
            <Ev tone="ok" t="34 min ago" m="Cleanup: 2.1 GB temporary browser files removed" />
            <Ev tone="ok" t="1h ago" m="Research job 'fresh dog food routines' completed (98 results)" />
            <Ev tone="warn" t="2h ago" m="Instagram session token refresh required — resolved automatically" />
            <Ev tone="ok" t="3h ago" m="Circuit breaker reset after cooldown" />
          </CardContent>
        </Card>
        <Card className="card-elevated">
          <CardHeader><CardTitle className="text-base">Retention policy</CardTitle></CardHeader>
          <CardContent className="space-y-2.5 text-sm">
            <Rule k="Temporary browser files" v="Deleted within 1–3 days" />
            <Rule k="Rejected drafts" v="Deleted after 7 days" />
            <Rule k="Research media" v="Links, transcripts and analysis kept. Large downloads not retained." />
            <Rule k="Approved / published assets" v="Retained temporarily, then archived safely" />
            <Rule k="Browser caches" v="Automatic cleanup after every job" />
          </CardContent>
        </Card>
        <Card className="card-elevated">
          <CardHeader><CardTitle className="text-base flex items-center gap-2"><RotateCcw className="h-4 w-4" />Cleanup history</CardTitle></CardHeader>
          <CardContent className="space-y-1.5 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">Today</span><span>4.8 GB freed</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Yesterday</span><span>6.1 GB freed</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">7-day total</span><span>38.4 GB freed</span></div>
          </CardContent>
        </Card>
        <Card className="card-elevated">
          <CardHeader><CardTitle className="text-base">Research queue</CardTitle></CardHeader>
          <CardContent className="text-sm space-y-1.5">
            <div className="flex justify-between"><span className="text-muted-foreground">Running</span><span>3</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Queued</span><span>2</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Failed last 24h</span><span>0</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Avg job duration</span><span>7m 12s</span></div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}

function Ev({ tone, t, m }: { tone: "ok" | "warn"; t: string; m: string }) {
  const Icon = tone === "warn" ? AlertTriangle : ShieldCheck;
  return (
    <div className="flex items-start gap-2">
      <Icon className={`h-4 w-4 mt-0.5 shrink-0 ${tone === "warn" ? "text-amber" : "text-mint"}`} />
      <div className="min-w-0 flex-1">
        <div>{m}</div>
        <div className="text-xs text-muted-foreground">{t}</div>
      </div>
    </div>
  );
}
function Rule({ k, v }: { k: string; v: string }) {
  return (
    <div className="grid grid-cols-[minmax(0,180px)_1fr] gap-3">
      <div className="text-muted-foreground">{k}</div>
      <div>{v}</div>
    </div>
  );
}
