import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription,
} from "@/components/ui/sheet";
import { PageHeader } from "@/components/hermes/AppShell";
import { publishingCalendar, projects } from "@/lib/hermes-data";
import { Copy, ExternalLink, Zap, Hand } from "lucide-react";

export const Route = createFileRoute("/calendar")({
  head: () => ({ meta: [{ title: "Publishing Calendar — Hermes" }] }),
  component: Calendar,
});

const platformColor: Record<string, string> = {
  TikTok: "border-l-navy",
  Instagram: "border-l-rose",
  Facebook: "border-l-primary",
  X: "border-l-foreground",
};
const platformChip: Record<string, string> = {
  TikTok: "bg-navy/10 text-navy",
  Instagram: "bg-rose/10 text-rose",
  Facebook: "bg-primary/10 text-primary",
  X: "bg-foreground/10 text-foreground",
};

type Item = (typeof publishingCalendar)[number]["items"][number];

function Calendar() {
  const [view, setView] = useState<"week" | "month">("week");
  const [selected, setSelected] = useState<Item | null>(null);

  return (
    <>
      <PageHeader
        title="Publishing Calendar"
        subtitle="Instagram & Facebook publish automatically once approved. TikTok & X ship as a manual publishing pack."
        actions={
          <div className="inline-flex rounded-md border p-0.5 bg-card">
            <button onClick={() => setView("week")} className={`px-2.5 py-1 rounded text-xs ${view === "week" ? "bg-secondary" : "text-muted-foreground"}`}>Week</button>
            <button onClick={() => setView("month")} className={`px-2.5 py-1 rounded text-xs ${view === "month" ? "bg-secondary" : "text-muted-foreground"}`}>Month</button>
          </div>
        }
      />

      <div className="flex items-center gap-4 mb-4 text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-1.5"><Zap className="h-3.5 w-3.5 text-mint" /> Automatic publish</span>
        <span className="inline-flex items-center gap-1.5"><Hand className="h-3.5 w-3.5 text-amber" /> Manual pack (employee)</span>
      </div>

      {view === "week" ? (
        <div className="grid grid-cols-7 gap-2">
          {publishingCalendar.map((d) => (
            <div key={d.day} className="min-w-0">
              <div className="flex items-baseline justify-between mb-2 px-1">
                <div className="text-[10px] font-semibold uppercase text-muted-foreground">{d.day}</div>
                <div className="text-base font-bold">{d.date}</div>
              </div>
              <div className={`space-y-1.5 ${d.items.length === 0 ? "min-h-[60px]" : "min-h-[120px]"}`}>
                {d.items.length === 0 && (
                  <div className="text-[10px] text-muted-foreground/50 border border-dashed rounded p-2 text-center">—</div>
                )}
                {d.items.map((item, i) => {
                  const project = projects.find((p) => p.id === item.project)!;
                  const auto = item.mode === "Automatic";
                  return (
                    <button
                      key={i}
                      onClick={() => setSelected(item)}
                      className={`w-full text-left rounded-md border-l-4 bg-card border-y border-r p-2 space-y-1 hover:shadow-sm transition-shadow ${platformColor[item.platform]}`}
                    >
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-[10px] font-semibold">{item.time}</span>
                        {auto ? <Zap className="h-3 w-3 text-mint" /> : <Hand className="h-3 w-3 text-amber" />}
                      </div>
                      <div className="text-[11px] font-medium leading-tight line-clamp-2">{item.title}</div>
                      <div className="flex items-center gap-1">
                        <span className={`text-[9px] px-1 rounded ${platformChip[item.platform]}`}>{item.platform}</span>
                        <span className="h-1.5 w-1.5 rounded-full shrink-0" style={{ backgroundColor: project.color }} />
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-7 gap-1 text-xs">
          {["Mon","Tue","Wed","Thu","Fri","Sat","Sun"].map((d) => (
            <div key={d} className="text-[10px] font-semibold uppercase text-muted-foreground text-center py-1">{d}</div>
          ))}
          {Array.from({ length: 35 }).map((_, i) => {
            const date = i - 6;
            const dayIdx = i % 7;
            const items = date > 0 && date < 8 ? publishingCalendar[dayIdx]?.items ?? [] : [];
            const inMonth = date > 0 && date <= 30;
            return (
              <div key={i} className={`min-h-[80px] rounded border p-1.5 ${inMonth ? "bg-card" : "bg-secondary/30 text-muted-foreground/50"}`}>
                <div className="text-[10px] font-semibold mb-1">{inMonth ? date : ""}</div>
                <div className="space-y-1">
                  {items.slice(0, 2).map((item, j) => (
                    <button key={j} onClick={() => setSelected(item)} className={`w-full text-left text-[9px] px-1 py-0.5 rounded truncate ${platformChip[item.platform]}`}>
                      {item.time} {item.title}
                    </button>
                  ))}
                  {items.length > 2 && <div className="text-[9px] text-muted-foreground">+{items.length - 2}</div>}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Sheet open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <SheetContent className="w-full sm:max-w-md p-0">
          {selected && (() => {
            const project = projects.find((p) => p.id === selected.project)!;
            const auto = selected.mode === "Automatic";
            return (
              <div className="flex flex-col h-full">
                <SheetHeader className="p-5 border-b">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge className={`${platformChip[selected.platform]} border-0 text-[10px]`}>{selected.platform}</Badge>
                    <Badge variant={auto ? "default" : "outline"} className="text-[10px] gap-1">
                      {auto ? <Zap className="h-3 w-3" /> : <Hand className="h-3 w-3" />}
                      {selected.mode}
                    </Badge>
                  </div>
                  <SheetTitle>{selected.title}</SheetTitle>
                  <SheetDescription>{selected.time} · <span className="inline-flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: project.color }} />{project.name}</span></SheetDescription>
                </SheetHeader>
                <div className="flex-1 overflow-y-auto p-5 space-y-4 text-sm">
                  <div className="aspect-[9/16] max-w-[220px] mx-auto rounded-lg overflow-hidden bg-navy">
                    <img src="https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=600&q=80" alt="" className="h-full w-full object-cover" />
                  </div>
                  <PackRow label="Caption">
                    Missed 14 jobs last week under a sink. Now the phone actually gets answered — even when I'm elbow-deep. Full breakdown 👇
                    <Button size="sm" variant="ghost" className="h-6 ml-1 gap-1 text-xs"><Copy className="h-3 w-3" />Copy</Button>
                  </PackRow>
                  <PackRow label="Hashtags">#tradielife #plumberuk #missedcalls</PackRow>
                  <PackRow label="Instructions">Post the video, paste caption + hashtags. Reply to first 5 comments within 30 minutes.</PackRow>
                </div>
                <div className="p-4 border-t flex gap-2">
                  {auto ? (
                    <Button className="flex-1" variant="outline">View auto-publish log</Button>
                  ) : (
                    <>
                      <Button className="flex-1 gap-1"><ExternalLink className="h-4 w-4" />Open {selected.platform}</Button>
                      <Button variant="outline">Mark published</Button>
                    </>
                  )}
                </div>
              </div>
            );
          })()}
        </SheetContent>
      </Sheet>
    </>
  );
}

function PackRow({ label, children }: any) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-wide text-muted-foreground mb-1">{label}</div>
      <div className="text-sm">{children}</div>
    </div>
  );
}
