import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { PageHeader } from "@/components/hermes/AppShell";
import { opportunityExample } from "@/lib/hermes-data";
import { CheckCircle2, AlertTriangle, Compass, ArrowRight, Archive } from "lucide-react";

export const Route = createFileRoute("/opportunity")({
  head: () => ({ meta: [{ title: "Opportunity Research — Hermes" }] }),
  component: OppPage,
});

function OppPage() {
  const [showReport, setShowReport] = useState(true);
  const o = opportunityExample;

  return (
    <>
      <PageHeader
        title="Opportunity Research"
        subtitle="Research a possible business or product before it becomes a Mission Ops project."
      />

      <div className="grid grid-cols-1 xl:grid-cols-[420px_1fr] gap-6">
        <Card className="card-elevated">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Compass className="h-5 w-5 text-ember" />Research brief</CardTitle>
            <p className="text-xs text-muted-foreground">All fields are optional. Hermes fills gaps from public research.</p>
          </CardHeader>
          <CardContent className="space-y-3">
            <F label="Proposed product / service" defaultValue={o.proposedProduct} multi />
            <F label="Problem it solves" defaultValue={o.problem} multi />
            <F label="Expected customer" defaultValue={o.customer} />
            <div className="grid grid-cols-2 gap-3">
              <F label="Country" defaultValue={o.country} />
              <F label="Language" defaultValue={o.language} />
            </div>
            <F label="Competitors / comparables" defaultValue={o.competitors} />
            <F label="Preferred platforms" defaultValue={o.platforms} />
            <F label="Known price / business model" defaultValue={o.price} />
            <F label="Mike's assumptions & questions" defaultValue={o.mikeAssumptions} multi />
            <Button className="w-full" onClick={() => setShowReport(true)}>Start opportunity research</Button>
          </CardContent>
        </Card>

        {showReport && (
          <div className="space-y-4">
            <Card className="card-elevated">
              <CardHeader className="flex-row items-start justify-between">
                <div>
                  <div className="text-xs uppercase tracking-wide text-muted-foreground">Fictional example</div>
                  <CardTitle className="text-2xl mt-1">{o.name}</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">{o.proposedProduct}</p>
                </div>
                <div className="text-right">
                  <div className="text-xs text-muted-foreground">Opportunity score</div>
                  <div className="font-display text-4xl font-bold text-ember">{o.score}</div>
                  <Badge variant="outline" className="mt-1 gap-1"><AlertTriangle className="h-3 w-3 text-amber" />{o.recommendation}</Badge>
                </div>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                <Section title="Evidence of demand">{o.demand}</Section>
                <Section title="Viral content already working">{o.viralAlready}</Section>
                <Section title="Pain points">
                  <ul className="space-y-1">{o.pains.map((p) => <li key={p} className="flex gap-2"><CheckCircle2 className="h-4 w-4 text-mint mt-0.5 shrink-0" />{p}</li>)}</ul>
                </Section>
                <Section title="Competitors">
                  <ul className="space-y-1.5">{o.competitorsFound.map((c) => (
                    <li key={c.name}><span className="font-medium">{c.name}</span> — <span className="text-muted-foreground">{c.note}</span></li>
                  ))}</ul>
                </Section>
                <Section title="Common offers & CTAs">{o.offers}</Section>
                <Section title="Market concerns">{o.concerns}</Section>
                <Section title="Recommended next step" className="md:col-span-2">
                  <div className="rounded-md bg-secondary p-3">{o.next}</div>
                </Section>
              </CardContent>
            </Card>

            <div className="flex flex-wrap gap-2">
              <Button className="gap-1"><ArrowRight className="h-4 w-4" />Create Mission Ops project</Button>
              <Button variant="outline">Continue researching</Button>
              <Button variant="ghost" className="gap-1"><Archive className="h-4 w-4" />Archive opportunity</Button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

function F({ label, defaultValue, multi }: { label: string; defaultValue?: string; multi?: boolean }) {
  return (
    <div>
      <Label className="text-xs mb-1.5 block">{label}</Label>
      {multi ? <Textarea defaultValue={defaultValue} rows={2} /> : <Input defaultValue={defaultValue} />}
    </div>
  );
}
function Section({ title, children, className = "" }: any) {
  return (
    <div className={className}>
      <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1.5">{title}</div>
      <div>{children}</div>
    </div>
  );
}
