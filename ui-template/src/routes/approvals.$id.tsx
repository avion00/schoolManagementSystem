import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { PageHeader } from "@/components/hermes/AppShell";
import { productionCards } from "@/lib/hermes-data";
import { Play, Pause, Volume2, Maximize, ZoomIn, ArrowLeft, Check, X, RotateCcw, ChevronLeft, ChevronRight } from "lucide-react";

export const Route = createFileRoute("/approvals/$id")({
  head: () => ({ meta: [{ title: "Asset review — Hermes" }] }),
  component: AssetReview,
});

function AssetReview() {
  const { id } = Route.useParams();
  const card = productionCards.find((c) => c.id === id) ?? productionCards[0];
  const [playing, setPlaying] = useState(false);
  const [decision, setDecision] = useState<string | null>(null);

  return (
    <>
      <div className="mb-4"><Button variant="ghost" size="sm" asChild className="gap-1"><Link to="/approvals"><ArrowLeft className="h-4 w-4" />Back to approvals</Link></Button></div>
      <PageHeader
        title={card.title}
        subtitle={`Assignee: ${card.assignee} · Stage: ${card.stage} · Due ${card.due}`}
        actions={<div className="flex items-center gap-1"><Button variant="ghost" size="icon"><ChevronLeft className="h-4 w-4" /></Button><Button variant="ghost" size="icon"><ChevronRight className="h-4 w-4" /></Button></div>}
      />

      <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] gap-6">
        <div className="space-y-4">
          <div className="rounded-xl overflow-hidden bg-navy aspect-[9/16] max-h-[75vh] mx-auto w-full max-w-[520px] relative">
            <img src="https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?w=1200&q=90" alt="" className="h-full w-full object-cover" />
            <button className="absolute inset-0 grid place-items-center" onClick={() => setPlaying(!playing)}>
              <div className="grid h-20 w-20 place-items-center rounded-full bg-white/95 text-navy shadow-2xl hover:scale-105 transition-transform">
                {playing ? <Pause className="h-8 w-8" fill="currentColor" /> : <Play className="h-8 w-8 ml-1" fill="currentColor" />}
              </div>
            </button>
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-4">
              <div className="flex items-center gap-2 text-white text-xs">
                <span>0:12</span>
                <div className="flex-1 h-1 bg-white/20 rounded"><div className="h-full w-1/3 bg-ember rounded" /></div>
                <span>0:38</span>
                <Button size="icon" variant="ghost" className="h-8 w-8 text-white hover:bg-white/10"><Volume2 className="h-4 w-4" /></Button>
                <Button size="icon" variant="ghost" className="h-8 w-8 text-white hover:bg-white/10"><Maximize className="h-4 w-4" /></Button>
                <Button size="icon" variant="ghost" className="h-8 w-8 text-white hover:bg-white/10"><ZoomIn className="h-4 w-4" /></Button>
              </div>
            </div>
          </div>

          <Card className="card-elevated">
            <CardHeader><CardTitle className="text-base">Version history</CardTitle></CardHeader>
            <CardContent className="space-y-2 text-sm">
              {[
                { v: "v3", when: "10 min ago", who: "Anna R.", note: "Re-cut with tighter hook" },
                { v: "v2", when: "2 days ago", who: "Anna R.", note: "First revision after CMO note" },
                { v: "v1", when: "3 days ago", who: "Anna R.", note: "Initial submission" },
              ].map((h, i) => (
                <div key={h.v} className="flex items-start gap-3 pb-2 border-b last:border-0">
                  <Badge variant={i === 0 ? "default" : "secondary"} className="text-xs shrink-0">{h.v}{i === 0 ? " · current" : ""}</Badge>
                  <div className="min-w-0 flex-1">
                    <div className="text-xs text-muted-foreground">{h.when} · {h.who}</div>
                    <div>{h.note}</div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Card className="card-elevated">
            <CardHeader><CardTitle className="text-base">Recipe · what was requested</CardTitle></CardHeader>
            <CardContent className="text-sm space-y-3">
              <Row k="Hook" v="&ldquo;3 fuel-card mistakes that cost me €7,400 last year.&rdquo;" />
              <Row k="Presenter" v="Male 35–45, in truck cab, workwear" />
              <Row k="Framing" v="Chest-up, handheld, natural light" />
              <Row k="Length" v="35–45s, 6–10 cuts, no music" />
              <Row k="On-screen text" v="Yellow subtitle bar. Numbers bolded." />
              <Row k="Caption" v="Short. Ends with 'link in bio for the audit template.'" />
              <Row k="CTA" v="Free audit template via bio link" />
              <Row k="Hashtags" v="#fleetmanager #trasporti #FlottaHub" />
            </CardContent>
          </Card>

          <Card className="card-elevated">
            <CardHeader><CardTitle className="text-base">Compared to submission</CardTitle></CardHeader>
            <CardContent className="text-sm space-y-2">
              <Diff ok label="Presenter matches profile" />
              <Diff ok label="On-screen text: yellow bar, numbers bolded" />
              <Diff ok label="Length 38s — within range" />
              <Diff warn label="Music present at 0:22–0:31 — recipe said none" />
              <Diff ok label="CTA verbatim match" />
            </CardContent>
          </Card>

          <Card className="card-elevated">
            <CardHeader><CardTitle className="text-base">Reviewer notes</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div className="rounded-md bg-secondary p-3 text-sm">
                <div className="font-medium text-xs mb-1">Mike · yesterday</div>
                "Hook is good but soften the cut at 0:04 — feels rushed."
              </div>
              <Textarea placeholder="Add revision notes or approval comment..." rows={3} />
              <div className="flex flex-wrap gap-2">
                <Button className="gap-1 bg-mint text-navy hover:bg-mint/90" onClick={() => setDecision("approved")}><Check className="h-4 w-4" />Approve</Button>
                <Button variant="outline" className="gap-1" onClick={() => setDecision("revision")}><RotateCcw className="h-4 w-4" />Request revision</Button>
                <Button variant="ghost" className="gap-1 text-rose hover:text-rose" onClick={() => setDecision("rejected")}><X className="h-4 w-4" />Reject</Button>
              </div>
              {decision && (
                <div className={`text-xs rounded-md p-2 ${decision === "approved" ? "bg-mint/15 text-mint" : decision === "rejected" ? "bg-rose/15 text-rose" : "bg-amber/15 text-amber"}`}>
                  Prototype: marked as <b>{decision}</b>. No live publish action taken.
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="grid grid-cols-[110px_1fr] gap-3">
      <div className="text-[11px] uppercase tracking-wide text-muted-foreground pt-0.5">{k}</div>
      <div dangerouslySetInnerHTML={{ __html: v }} />
    </div>
  );
}
function Diff({ ok, warn, label }: { ok?: boolean; warn?: boolean; label: string }) {
  return (
    <div className="flex items-start gap-2">
      <span className={`mt-1 h-1.5 w-1.5 rounded-full shrink-0 ${ok ? "bg-mint" : warn ? "bg-amber" : "bg-rose"}`} />
      <span>{label}</span>
    </div>
  );
}
