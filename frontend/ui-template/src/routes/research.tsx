import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Progress } from "@/components/ui/progress";
import { PageHeader } from "@/components/hermes/AppShell";
import { viralPosts, commandCenter } from "@/lib/hermes-data";
import { useProject } from "@/components/hermes/ProjectProvider";
import { Play, Pause, X, ShieldCheck, Zap, Eye, Heart, MessageCircle, Share2 } from "lucide-react";

export const Route = createFileRoute("/research")({
  head: () => ({ meta: [{ title: "Social Research — Hermes" }] }),
  component: ResearchPage,
});

function ResearchPage() {
  const { projectId } = useProject();
  const [platforms, setPlatforms] = useState<string[]>(["TikTok", "Instagram Reels"]);
  const [safe, setSafe] = useState(true);
  const results = viralPosts.filter((v) => v.project === projectId);

  return (
    <>
      <PageHeader
        title="Social Research"
        subtitle="Controlled research briefs. Nothing runs invisibly — every job shows up here."
      />

      <div className="grid grid-cols-1 xl:grid-cols-[380px_1fr] gap-6">
        <div className="space-y-6">
          <Card className="card-elevated">
            <CardHeader><CardTitle>New research brief</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-xs mb-1.5 block">Keywords / topics</Label>
                <Input defaultValue="fleet management pain, missed calls tradespeople" />
              </div>
              <div>
                <Label className="text-xs mb-1.5 block">Platforms</Label>
                <div className="flex flex-wrap gap-1.5">
                  {["TikTok", "Instagram Reels", "Facebook Reels", "X"].map((p) => (
                    <button
                      key={p}
                      onClick={() => setPlatforms(platforms.includes(p) ? platforms.filter((x) => x !== p) : [...platforms, p])}
                      className={`px-2.5 py-1 rounded text-xs border ${platforms.includes(p) ? "bg-primary text-primary-foreground border-primary" : "bg-card"}`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label className="text-xs mb-1.5 block">Country</Label><Input defaultValue="IT" /></div>
                <div><Label className="text-xs mb-1.5 block">Language</Label><Input defaultValue="it, en" /></div>
              </div>
              <div>
                <Label className="text-xs mb-1.5 block">Max results per platform</Label>
                <Slider defaultValue={[100]} max={500} step={25} />
                <div className="text-xs text-muted-foreground mt-1">100 posts / platform</div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label className="text-xs mb-1.5 block">From</Label><Input type="date" defaultValue="2026-06-15" /></div>
                <div><Label className="text-xs mb-1.5 block">To</Label><Input type="date" defaultValue="2026-07-13" /></div>
              </div>
              <div>
                <Label className="text-xs mb-1.5 block">Minimum views</Label>
                <Input type="number" defaultValue={50000} />
              </div>
              <div className="flex items-center justify-between rounded-md border p-3">
                <div>
                  <div className="text-sm font-medium flex items-center gap-1.5"><ShieldCheck className="h-4 w-4 text-mint" />Safe Research Mode</div>
                  <div className="text-xs text-muted-foreground">Conservative rate limits, human-like pauses</div>
                </div>
                <Switch checked={safe} onCheckedChange={setSafe} />
              </div>
              <Button className="w-full gap-2"><Play className="h-4 w-4" />Start research</Button>
            </CardContent>
          </Card>

          <Card className="card-elevated">
            <CardHeader><CardTitle className="text-base flex items-center gap-2"><Zap className="h-4 w-4 text-ember" />System protections</CardTitle></CardHeader>
            <CardContent className="text-sm space-y-2">
              <Row k="Controlled queue" v="3 running · 2 queued" />
              <Row k="Max simultaneous jobs" v="6" />
              <Row k="Browser processes" v="3 / 6" />
              <Row k="Automatic timeout" v="15 min per job" />
              <Row k="Cleanup" v="Auto after each job" />
              <Row k="Circuit breaker" v={<Badge variant="outline" className="gap-1"><span className="h-1.5 w-1.5 rounded-full bg-mint" />Healthy</Badge>} />
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="card-elevated">
            <CardHeader className="flex-row items-center justify-between">
              <CardTitle className="text-base">Running jobs</CardTitle>
              <Button variant="ghost" size="sm" className="gap-1"><Pause className="h-3.5 w-3.5" />Pause all</Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {commandCenter.researchJobs.map((j) => (
                <div key={j.id} className="space-y-1.5">
                  <div className="flex items-center justify-between gap-2">
                    <div className="text-sm truncate"><span className="font-medium">{j.name}</span></div>
                    <div className="flex items-center gap-1 shrink-0">
                      <span className="text-xs text-muted-foreground">ETA {j.eta}</span>
                      <Button variant="ghost" size="icon" className="h-7 w-7"><Pause className="h-3.5 w-3.5" /></Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7"><X className="h-3.5 w-3.5" /></Button>
                    </div>
                  </div>
                  <Progress value={j.progress} className="h-1.5" />
                </div>
              ))}
            </CardContent>
          </Card>

          <div>
            <h2 className="text-lg font-semibold mb-3">Findings <span className="text-muted-foreground text-sm font-normal">({results.length} verified)</span></h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {results.map((v) => (
                <Card key={v.id} className="card-elevated overflow-hidden hover:shadow-md transition-shadow">
                  <Link to="/research/$id" params={{ id: v.id }}>
                    <div className="aspect-video bg-muted relative">
                      <img src={v.thumb} alt="" className="h-full w-full object-cover" />
                      <Badge className="absolute top-2 left-2 gradient-ember text-navy border-0 font-bold">★ {v.viralScore}</Badge>
                      <Badge variant="secondary" className="absolute top-2 right-2">{v.platform}</Badge>
                      {v.verified && (
                        <Badge className="absolute bottom-2 left-2 bg-mint/90 text-navy border-0 text-[10px] gap-1">
                          <ShieldCheck className="h-3 w-3" /> Verified
                        </Badge>
                      )}
                    </div>
                    <CardContent className="p-3 space-y-2">
                      <div className="text-xs text-muted-foreground">{v.creator} · {v.followers} · {v.age}</div>
                      <div className="text-sm font-medium line-clamp-2 min-h-[2.5rem]">{v.hook}</div>
                      <div className="grid grid-cols-4 gap-1 text-[11px] text-muted-foreground pt-1 border-t">
                        <span className="flex items-center gap-1"><Eye className="h-3 w-3" />{v.views}</span>
                        <span className="flex items-center gap-1"><Heart className="h-3 w-3" />{v.likes}</span>
                        <span className="flex items-center gap-1"><MessageCircle className="h-3 w-3" />{v.comments}</span>
                        <span className="flex items-center gap-1"><Share2 className="h-3 w-3" />{v.shares}</span>
                      </div>
                    </CardContent>
                  </Link>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function Row({ k, v }: { k: string; v: React.ReactNode }) {
  return <div className="flex items-center justify-between"><span className="text-muted-foreground">{k}</span><span>{v}</span></div>;
}
