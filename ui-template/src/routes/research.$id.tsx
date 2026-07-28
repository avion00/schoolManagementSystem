import { createFileRoute, Link } from "@tanstack/react-router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/hermes/AppShell";
import { viralPosts } from "@/lib/hermes-data";
import { Play, ArrowLeft, ShieldCheck, Sparkles, Eye, Heart, MessageCircle, Share2, ExternalLink } from "lucide-react";

export const Route = createFileRoute("/research/$id")({
  head: () => ({ meta: [{ title: "Viral analysis — Hermes" }] }),
  component: ViralDetail,
});

function ViralDetail() {
  const { id } = Route.useParams();
  const v = viralPosts.find((p) => p.id === id) ?? viralPosts[0];

  return (
    <>
      <div className="mb-4">
        <Button variant="ghost" size="sm" asChild className="gap-1"><Link to="/research"><ArrowLeft className="h-4 w-4" />Back to findings</Link></Button>
      </div>
      <PageHeader
        title={`${v.platform} · ${v.creator}`}
        subtitle={`Viral score ${v.viralScore} · ${v.age} ago · ${v.followers} followers`}
        actions={
          <>
            <Button variant="outline" className="gap-1"><ExternalLink className="h-4 w-4" />Open original</Button>
            <Button asChild className="gap-1"><Link to="/patterns"><Sparkles className="h-4 w-4" />Send to patterns</Link></Button>
          </>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,480px)_1fr] gap-6">
        <div className="space-y-4">
          <div className="aspect-[9/16] rounded-xl overflow-hidden bg-navy relative">
            <img src={v.thumb} alt="" className="h-full w-full object-cover" />
            <div className="absolute inset-0 grid place-items-center">
              <button className="grid h-16 w-16 place-items-center rounded-full bg-white/95 hover:bg-white text-navy shadow-lg">
                <Play className="h-7 w-7 ml-1" fill="currentColor" />
              </button>
            </div>
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-4 text-white">
              <div className="text-xs opacity-80">{v.creator} · {v.followers} followers</div>
              <div className="text-sm font-medium mt-1">{v.hook}</div>
            </div>
          </div>
          <Card className="card-elevated">
            <CardContent className="p-4 grid grid-cols-4 gap-2 text-sm">
              <Metric icon={Eye} v={v.views} l="Views" />
              <Metric icon={Heart} v={v.likes} l="Likes" />
              <Metric icon={MessageCircle} v={v.comments} l="Comments" />
              <Metric icon={Share2} v={v.shares} l="Shares" />
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline" className="gap-1"><ShieldCheck className="h-3 w-3 text-mint" />Verified evidence</Badge>
            <Badge variant="secondary">Interpretation flagged separately</Badge>
          </div>

          <Card className="card-elevated">
            <CardHeader><CardTitle className="text-base">Hook (first 1–3s)</CardTitle></CardHeader>
            <CardContent><blockquote className="border-l-2 border-ember pl-3 italic text-sm">{v.hook}</blockquote></CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="card-elevated">
              <CardHeader><CardTitle className="text-base">Transcript <Verified /></CardTitle></CardHeader>
              <CardContent className="text-sm text-muted-foreground space-y-2 max-h-56 overflow-y-auto">
                <p><span className="text-foreground">0:00</span> — {v.hook}</p>
                <p><span className="text-foreground">0:03</span> — "Look, I ran a fleet of 18 trucks for four years..."</p>
                <p><span className="text-foreground">0:09</span> — "The three biggest leaks are fuel cards, idle time, and expired documents."</p>
                <p><span className="text-foreground">0:22</span> — "Here's what actually moved the number..."</p>
                <p><span className="text-foreground">0:38</span> — CTA: "Link in bio for the free audit template."</p>
              </CardContent>
            </Card>
            <Card className="card-elevated">
              <CardHeader><CardTitle className="text-base">On-screen text <Verified /></CardTitle></CardHeader>
              <CardContent className="text-sm text-muted-foreground space-y-1">
                <p>"€800/month per truck"</p>
                <p>"3 hidden leaks"</p>
                <p>"Free audit template →"</p>
              </CardContent>
            </Card>
          </div>

          <Card className="card-elevated">
            <CardHeader><CardTitle className="text-base">Pain, promise, trigger <Interp /></CardTitle></CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <Bit k="Pain" v="Money leaking through untracked fleet operations" />
              <Bit k="Promise" v="Plug three specific leaks in one weekend" />
              <Bit k="Trigger" v="Loss-aversion + specific figure" />
            </CardContent>
          </Card>

          <Card className="card-elevated">
            <CardHeader><CardTitle className="text-base">Presenter, setting & production <Interp /></CardTitle></CardHeader>
            <CardContent className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
              <Bit k="Presenter" v="Male, 35–45, ex-operator" />
              <Bit k="Style" v="Confident, matter-of-fact" />
              <Bit k="Clothing" v="Fleece + polo, workwear" />
              <Bit k="Location" v="Truck cab, dashboard behind" />
              <Bit k="Camera" v="Handheld, chest-up, natural light" />
              <Bit k="Length / pacing" v="42s, 8 cuts, no music" />
              <Bit k="Captions" v="Yellow subtitle bar, bold" />
              <Bit k="CTA / offer" v="Free audit template via bio" />
              <Bit k="Music" v="None (voice-only)" />
            </CardContent>
          </Card>

          <Card className="card-elevated">
            <CardHeader><CardTitle className="text-base">Top comment themes <Verified /></CardTitle></CardHeader>
            <CardContent className="text-sm space-y-1.5">
              <div>· "Fuel cards are the worst — mine got skimmed twice" (188 likes)</div>
              <div>· "Where do I get this template?" (142 likes)</div>
              <div>· "My old boss lost €14k last year to idle time alone" (96 likes)</div>
            </CardContent>
          </Card>

          <Card className="card-elevated bg-secondary/40">
            <CardHeader><CardTitle className="text-base flex items-center gap-2"><Sparkles className="h-4 w-4 text-ember" />Why this went viral <Interp /></CardTitle></CardHeader>
            <CardContent className="text-sm">
              Specific figure in the hook triggers loss-aversion instantly. The presenter's workwear and cab setting removes ad-feel — viewers accept him as a peer. Comments show the audience arrived at the CTA on their own, which is why saves and shares are so disproportionate.
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}

function Metric({ icon: Icon, v, l }: any) {
  return (
    <div className="text-center">
      <Icon className="h-4 w-4 mx-auto text-muted-foreground" />
      <div className="font-bold mt-1">{v}</div>
      <div className="text-[10px] uppercase tracking-wide text-muted-foreground">{l}</div>
    </div>
  );
}
function Bit({ k, v }: { k: string; v: string }) {
  return <div><div className="text-[10px] uppercase tracking-wide text-muted-foreground">{k}</div><div>{v}</div></div>;
}
function Verified() { return <Badge variant="outline" className="ml-2 gap-1 text-[10px] font-normal"><ShieldCheck className="h-2.5 w-2.5 text-mint" />Verified</Badge>; }
function Interp() { return <Badge variant="secondary" className="ml-2 text-[10px] font-normal">Hermes interpretation</Badge>; }
