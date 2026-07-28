import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/hermes/AppShell";
import { useAuth } from "@/components/hermes/AuthProvider";
import { assignmentsFor, statusTone, type Assignment, type AssignmentStatus } from "@/lib/hermes-assignments";
import { projectById } from "@/lib/hermes-data";
import { Clock, ArrowRight, RotateCcw, Zap, Hourglass, CheckCircle2, Sparkles, AlertTriangle, User } from "lucide-react";

export const Route = createFileRoute("/my-work")({
  head: () => ({ meta: [{ title: "My Work — Hermes" }] }),
  component: MyWork,
});

const IMMINENT = /today|tomorrow|hour|min|now/i;

function MyWork() {
  const { user } = useAuth();
  if (!user) return null;
  const mine = assignmentsFor(user.id);

  const group = (statuses: AssignmentStatus[]) => mine.filter((a) => statuses.includes(a.status));
  const revisions = group(["Revision Requested"]);
  const newOnes = group(["Assigned"]);
  const inProdAll = group(["In Production"]);
  const dueSoon = inProdAll.filter((a) => IMMINENT.test(a.due));
  const inProd = inProdAll.filter((a) => !dueSoon.includes(a));
  const waiting = group(["Submitted for Review", "Resubmitted"]);
  const completed = group(["Approved", "Scheduled", "Published"]);

  return (
    <>
      <PageHeader
        title={`Hi ${user.name.split(" ")[0]} — here's your work`}
        subtitle="Everything assigned to you, grouped by what needs your attention first."
      />

      <div className="grid grid-cols-2 md:grid-cols-6 gap-3 mb-6">
        <Stat icon={RotateCcw} label="Revisions" value={revisions.length} tone="text-rose" />
        <Stat icon={Sparkles} label="New" value={newOnes.length} tone="text-primary" />
        <Stat icon={Clock} label="Due soon" value={dueSoon.length} tone="text-amber" />
        <Stat icon={Zap} label="In production" value={inProd.length} tone="text-ember" />
        <Stat icon={Hourglass} label="Waiting" value={waiting.length} tone="text-amber" />
        <Stat icon={CheckCircle2} label="Approved" value={completed.length} tone="text-mint" />
      </div>

      <Section
        title="Revision requests"
        hint="Read each admin note carefully and upload a new version."
        items={revisions}
        emptyText="No revisions right now."
        variant="revision"
      />
      <Section
        title="New assignments"
        hint="Read the full recipe before starting production."
        items={newOnes}
        emptyText="No new assignments."
      />
      <Section
        title="Due soon"
        hint="Already in production and due imminently — finish and submit."
        items={dueSoon}
        emptyText="Nothing urgent."
      />
      <Section
        title="In production"
        items={inProd}
        emptyText="Nothing in production."
      />
      <Section
        title="Waiting for approval"
        hint="Submitted — no further action needed from you until an admin decides."
        items={waiting}
        emptyText="No submissions waiting."
        variant="waiting"
      />
      <Section
        title="Approved / Completed"
        items={completed}
        emptyText="Nothing completed yet."
      />
    </>
  );
}

function Stat({ icon: Icon, label, value, tone }: any) {
  return (
    <Card className="card-elevated">
      <CardContent className="p-3 flex items-center gap-2.5">
        <Icon className={`h-4 w-4 ${tone}`} />
        <div className="min-w-0">
          <div className="text-lg font-bold font-display leading-none">{value}</div>
          <div className="text-[11px] text-muted-foreground mt-0.5">{label}</div>
        </div>
      </CardContent>
    </Card>
  );
}

function Section({ title, hint, items, emptyText, variant }: { title: string; hint?: string; items: Assignment[]; emptyText: string; variant?: "revision" | "waiting" }) {
  return (
    <section className="mb-6">
      <div className="flex items-baseline justify-between mb-2">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          {title} <span className="ml-1 text-foreground/60">· {items.length}</span>
        </h2>
        {hint && <span className="text-xs text-muted-foreground">{hint}</span>}
      </div>
      {items.length === 0 ? (
        <div className="text-xs text-muted-foreground border border-dashed rounded-md p-4 bg-card">{emptyText}</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
          {items.map((a) =>
            variant === "revision" ? <RevisionCard key={a.id} a={a} /> :
            variant === "waiting"  ? <WaitingCard  key={a.id} a={a} /> :
                                     <AssignmentCard key={a.id} a={a} />
          )}
        </div>
      )}
    </section>
  );
}

export function AssignmentCard({ a }: { a: Assignment }) {
  const project = projectById(a.project);
  const tone = statusTone[a.status];
  return (
    <Card className="card-elevated hover:shadow-md transition-shadow">
      <CardContent className="p-4 space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground mb-1">
              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: project.color }} />
              {project.name}
            </div>
            <div className="font-medium leading-snug">{a.title}</div>
          </div>
          {a.priority === "High" && <Badge className="bg-rose/15 text-rose border-0 text-[10px]">High</Badge>}
        </div>
        <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
          <span>{a.assetType}</span>
          <span className="inline-flex items-center gap-1"><Clock className="h-3 w-3" /> Due {a.due}</span>
        </div>
        <Badge className={`${tone.chip} border-0 text-[10px]`}>{a.status}</Badge>
        <div className="flex items-center justify-between pt-1">
          <span className="text-[11px] text-muted-foreground">v{a.versions.length}</span>
          <Button size="sm" asChild className="gap-1">
            <Link to="/tasks/$id" params={{ id: a.id }}>Open task <ArrowRight className="h-3.5 w-3.5" /></Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

/** Revision-request card — highlighted with an amber warning frame (not error red).
 *  Shows admin, timestamp, current version, due, and a preview of the instructions. */
export function RevisionCard({ a }: { a: Assignment }) {
  const project = projectById(a.project);
  const [expanded, setExpanded] = useState(false);
  const instructions = a.revisionInstructions ?? "";
  const preview = instructions.split("\n").slice(0, 2).join("\n");
  const isLong = instructions.length > preview.length;
  const currentV = a.versions.length;

  return (
    <Card className="border-amber/50 bg-amber/5 hover:shadow-md transition-shadow">
      <CardContent className="p-4 space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground mb-1">
              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: project.color }} />
              {project.name}
              <span>·</span>
              <span>{a.assetType}</span>
            </div>
            <div className="font-medium leading-snug">{a.title}</div>
          </div>
          <Badge className="bg-amber/20 text-amber-foreground border border-amber/40 text-[10px] gap-1">
            <AlertTriangle className="h-3 w-3" /> Revision
          </Badge>
        </div>

        <div className="rounded-md bg-background/70 border border-amber/30 p-2.5">
          <div className="flex items-center justify-between text-[11px] text-muted-foreground mb-1">
            <span className="inline-flex items-center gap-1 font-medium text-foreground">
              <User className="h-3 w-3" /> {a.revisionRequestedBy ?? "Admin"}
            </span>
            <span>{a.revisionRequestedAt ?? "Recently"}</span>
          </div>
          <div className={`text-xs whitespace-pre-line ${expanded ? "" : "line-clamp-3"}`}>
            {expanded ? instructions : preview}
          </div>
          {isLong && (
            <button
              onClick={() => setExpanded((v) => !v)}
              className="mt-1.5 text-[11px] font-medium text-primary hover:underline"
            >
              {expanded ? "Show less" : "Read full instructions"}
            </button>
          )}
        </div>

        <div className="grid grid-cols-3 gap-2 text-[11px]">
          <MiniMeta label="Current version" value={`v${currentV}`} />
          <MiniMeta label="Due" value={a.due} />
          <MiniMeta label="Priority" value={a.priority} />
        </div>

        <div className="flex items-center justify-end pt-1">
          <Button size="sm" asChild className="gap-1">
            <Link to="/tasks/$id" params={{ id: a.id }}>Open task <ArrowRight className="h-3.5 w-3.5" /></Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function WaitingCard({ a }: { a: Assignment }) {
  const project = projectById(a.project);
  const currentV = a.versions.length;
  return (
    <Card className="card-elevated hover:shadow-md transition-shadow">
      <CardContent className="p-4 space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground mb-1">
              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: project.color }} />
              {project.name}
              <span>·</span>
              <span>{a.assetType}</span>
            </div>
            <div className="font-medium leading-snug">{a.title}</div>
          </div>
          <Badge className={`${statusTone[a.status].chip} border-0 text-[10px]`}>{a.status}</Badge>
        </div>
        <div className="rounded-md bg-secondary/60 border border-border/50 p-2.5 text-xs text-muted-foreground flex items-start gap-2">
          <Hourglass className="h-3.5 w-3.5 mt-0.5 shrink-0 text-amber" />
          <span>
            <span className="text-foreground font-medium">No action needed.</span>{" "}
            Waiting for an administrator to review v{currentV}. You'll be notified with either approval or revision notes.
          </span>
        </div>
        <div className="flex items-center justify-between pt-1">
          <span className="text-[11px] text-muted-foreground">v{currentV} · submitted</span>
          <Button size="sm" variant="outline" asChild className="gap-1">
            <Link to="/tasks/$id" params={{ id: a.id }}>View submission <ArrowRight className="h-3.5 w-3.5" /></Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function MiniMeta({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded bg-background/60 border border-border/50 px-2 py-1.5">
      <div className="text-[9px] uppercase tracking-wide text-muted-foreground">{label}</div>
      <div className="font-medium truncate">{value}</div>
    </div>
  );
}
