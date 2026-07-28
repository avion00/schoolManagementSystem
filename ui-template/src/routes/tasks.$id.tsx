import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { PageHeader } from "@/components/hermes/AppShell";
import { assignments, statusTone, type Assignment, type AssignmentStatus, type AssignmentVersion } from "@/lib/hermes-assignments";
import { projectById } from "@/lib/hermes-data";
import { useAuth } from "@/components/hermes/AuthProvider";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import {
  ArrowLeft, Upload, Play, Clock, User, MessageSquare, History, ExternalLink,
  CheckCircle2, Lock, RefreshCw, FileVideo, AlertTriangle, Save,
} from "lucide-react";

export const Route = createFileRoute("/tasks/$id")({
  head: () => ({ meta: [{ title: "Task — Hermes" }] }),
  component: TaskDetail,
});

type DraftFile = { name: string; kind: "image" | "video"; url: string };

function TaskDetail() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const initial = assignments.find((x) => x.id === id);
  const [a, setA] = useState(initial);
  const [tab, setTab] = useState<"recipe" | "notes" | "versions" | "history">("recipe");
  const [note, setNote] = useState("");
  const [draft, setDraft] = useState<DraftFile | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  if (!a) {
    return (
      <div>
        <div className="mb-4"><Button variant="ghost" size="sm" asChild><Link to="/my-work"><ArrowLeft className="h-4 w-4 mr-1" />Back</Link></Button></div>
        <div className="text-sm text-muted-foreground">Task not found.</div>
      </div>
    );
  }

  const project = projectById(a.project);
  const tone = statusTone[a.status];
  const isMine = user?.id === a.assigneeId;
  const canUpload = isMine && (a.status === "Assigned" || a.status === "In Production" || a.status === "Revision Requested");

  const onFilePicked = (f: File | null) => {
    if (!f) return;
    const kind: DraftFile["kind"] = f.type.startsWith("video") ? "video" : "image";
    const url = URL.createObjectURL(f);
    setDraft({ name: f.name, kind, url });
  };

  const clearDraft = () => {
    if (draft) URL.revokeObjectURL(draft.url);
    setDraft(null);
    if (fileRef.current) fileRef.current.value = "";
  };

  const setStatus = (s: AssignmentStatus, action: string, detail?: string, extra?: Partial<Assignment>) => {
    setA({
      ...a,
      ...extra,
      status: s,
      audit: [{ at: "Just now", who: user?.name ?? "You", action, detail }, ...a.audit],
    });
  };

  const startWork = () => setStatus("In Production", "Started production");

  const saveDraft = () => {
    toast.success("Draft saved locally", { description: "Prototype — nothing is sent to the admin until you submit." });
  };

  const submit = () => {
    const v = a.versions.length + 1;
    const wasRevision = a.status === "Revision Requested";
    const newVersion: AssignmentVersion = {
      v,
      uploadedAt: "Just now",
      note: note || undefined,
      thumbnail: draft?.url ?? a.recipe.thumbnail ?? "https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?w=600&q=80",
    };
    setA({
      ...a,
      versions: [...a.versions, newVersion],
      status: wasRevision ? "Resubmitted" : "Submitted for Review",
      audit: [
        { at: "Just now", who: user?.name ?? "You", action: wasRevision ? "Resubmitted" : "Submitted for review", detail: `v${v}${note ? ` — ${note}` : ""}` },
        { at: "Just now", who: user?.name ?? "You", action: `Uploaded v${v}` },
        ...a.audit,
      ],
    });
    setNote("");
    // Keep draft cleared but leave the URL alive so the version thumbnail still resolves.
    setDraft(null);
    if (fileRef.current) fileRef.current.value = "";
    setConfirmOpen(false);
    toast.success(`v${v} submitted for review`, { description: "The admin will approve or send back with notes." });
  };

  return (
    <>
      <div className="mb-4">
        <Button variant="ghost" size="sm" onClick={() => navigate({ to: "/my-work" })} className="gap-1">
          <ArrowLeft className="h-4 w-4" /> Back to my work
        </Button>
      </div>
      <PageHeader
        title={a.title}
        subtitle={<>
          <span className="inline-flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: project.color }} />{project.name}</span>
          {" · "}{a.assetType}{" · Due "}{a.due}{" · Priority "}{a.priority}
        </> as any}
        actions={<Badge className={`${tone.chip} border-0`}>{a.status}</Badge>}
      />

      <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] gap-6">
        <div className="space-y-4">
          <Card className="card-elevated">
            <CardContent className="p-0">
              <div className="flex border-b">
                {(["recipe","notes","versions","history"] as const).map((t) => (
                  <button key={t} onClick={() => setTab(t)}
                    className={`px-4 py-2.5 text-sm font-medium border-b-2 -mb-px capitalize ${tab === t ? "border-ember text-ember" : "border-transparent text-muted-foreground hover:text-foreground"}`}>
                    {t === "recipe" ? "Production recipe" : t === "notes" ? "Admin comments" : t === "versions" ? "Versions" : "History"}
                    {t === "notes" && a.adminComments.length > 0 && <span className="ml-1.5 text-[10px] bg-secondary rounded-full px-1.5">{a.adminComments.length}</span>}
                    {t === "versions" && <span className="ml-1.5 text-[10px] bg-secondary rounded-full px-1.5">{a.versions.length}</span>}
                  </button>
                ))}
              </div>

              <div className="p-5 text-sm">
                {tab === "recipe" && (
                  <div className="space-y-3">
                    {a.status === "Revision Requested" && a.revisionInstructions && (
                      <div className="rounded-md border border-amber/50 bg-amber/10 p-3">
                        <div className="flex items-center justify-between mb-1">
                          <div className="text-xs font-semibold text-amber-foreground uppercase tracking-wide inline-flex items-center gap-1.5">
                            <AlertTriangle className="h-3.5 w-3.5 text-amber" /> Revision instructions
                          </div>
                          <div className="text-[11px] text-muted-foreground">
                            {a.revisionRequestedBy ?? "Admin"} · {a.revisionRequestedAt ?? "Recently"}
                          </div>
                        </div>
                        <div className="whitespace-pre-line text-sm">{a.revisionInstructions}</div>
                      </div>
                    )}
                    {a.objective && <Row k="Objective" v={a.objective} />}
                    <Row k="Script beats" v={a.recipe.script} pre />
                    <Row k="Shot list" v={<ul className="list-disc pl-5 space-y-0.5">{a.recipe.shots.map((s,i) => <li key={i}>{s}</li>)}</ul>} />
                    <Row k="Presenter" v={a.recipe.presenter} />
                    <Row k="Wardrobe" v={a.recipe.wardrobe} />
                    <Row k="Location & background" v={a.recipe.location} />
                    <Row k="Props" v={a.recipe.props} />
                    <Row k="Camera framing / movement" v={a.recipe.camera} />
                    {a.lengthPacing && <Row k="Length & pacing" v={a.lengthPacing} />}
                    <Row k="On-screen text / subtitles" v={a.recipe.onScreenText} />
                    <Row k="Caption" v={a.recipe.caption} />
                    <Row k="CTA" v={a.recipe.cta} />
                    <Row k="Hashtags" v={a.recipe.hashtags} />
                    <Row k="Thumbnail brief" v={a.recipe.thumbnail} />
                    <Row k="Deadline · Priority" v={`${a.due} · ${a.priority}`} />
                    {a.inspirationLinks.length > 0 && (
                      <Row k="Inspiration" v={
                        <div className="space-y-1">
                          {a.inspirationLinks.map((l,i) => (
                            <a key={i} href={l.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-primary hover:underline">
                              <ExternalLink className="h-3 w-3" /> {l.label}
                            </a>
                          ))}
                        </div>
                      } />
                    )}
                  </div>
                )}

                {tab === "notes" && (
                  <div className="space-y-2">
                    {a.adminComments.length === 0 && <div className="text-xs text-muted-foreground">No comments yet.</div>}
                    {a.adminComments.map((c, i) => (
                      <div key={i} className="rounded-md bg-secondary p-3">
                        <div className="text-xs font-medium mb-0.5"><MessageSquare className="h-3 w-3 inline mr-1" />{c.by} · {c.at}</div>
                        <div>{c.text}</div>
                      </div>
                    ))}
                  </div>
                )}

                {tab === "versions" && (
                  <div className="space-y-3">
                    {a.versions.length === 0 && <div className="text-xs text-muted-foreground">No versions uploaded yet.</div>}
                    {[...a.versions].reverse().map((v, i) => (
                      <div key={v.v} className="flex gap-3 pb-3 border-b last:border-0">
                        <div className="w-24 aspect-[9/16] rounded-md overflow-hidden bg-navy relative shrink-0">
                          <img src={v.thumbnail} alt="" className="h-full w-full object-cover" />
                          <div className="absolute inset-0 grid place-items-center bg-black/20"><Play className="h-4 w-4 text-white" fill="currentColor" /></div>
                          <div className="absolute top-1 left-1"><Lock className="h-3 w-3 text-white/90" /></div>
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant={i === 0 ? "default" : "secondary"} className="text-[10px]">v{v.v}{i === 0 ? " · current" : ""}</Badge>
                            <span className="text-xs text-muted-foreground">{v.uploadedAt}</span>
                            <span className="text-[10px] text-muted-foreground inline-flex items-center gap-1"><Lock className="h-3 w-3" /> locked</span>
                          </div>
                          {v.note && <div className="text-xs">{v.note}</div>}
                        </div>
                      </div>
                    ))}
                    <p className="text-[11px] text-muted-foreground">Submitted versions are locked. Uploading a new file creates the next version (v{a.versions.length + 1}).</p>
                  </div>
                )}

                {tab === "history" && (
                  <div className="space-y-3">
                    {a.audit.map((e, i) => (
                      <div key={i} className="flex gap-3">
                        <div className="mt-1 h-2 w-2 rounded-full bg-ember shrink-0" />
                        <div className="min-w-0 flex-1 pb-3 border-b last:border-0">
                          <div className="text-xs text-muted-foreground"><History className="h-3 w-3 inline mr-1" />{e.at} · {e.who}</div>
                          <div>{e.action}{e.detail ? <span className="text-muted-foreground"> — {e.detail}</span> : null}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Card className="card-elevated">
            <CardHeader><CardTitle className="text-base">Status</CardTitle></CardHeader>
            <CardContent className="text-sm space-y-3">
              <div className="text-xs text-muted-foreground">{tone.label}</div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <InfoRow icon={User} label="Assignee" value={a.assigneeName} />
                <InfoRow icon={Clock} label="Due" value={a.due} />
              </div>
              {a.approvedBy && <InfoRow icon={CheckCircle2} label="Approved" value={`${a.approvedBy} · ${a.approvedAt}`} />}
              {a.scheduledFor && <InfoRow icon={Clock} label="Scheduled" value={`${a.scheduledFor} · ${a.platform}`} />}
            </CardContent>
          </Card>

          {isMine && a.status === "Assigned" && (
            <Card className="card-elevated">
              <CardHeader><CardTitle className="text-base">Next action</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground">Ready to start? This marks the task as in production.</p>
                <Button className="w-full gap-2" onClick={startWork}><Play className="h-4 w-4" /> Start production</Button>
              </CardContent>
            </Card>
          )}

          {canUpload && a.status !== "Assigned" && (
            <Card className="card-elevated">
              <CardHeader>
                <CardTitle className="text-base">Upload v{a.versions.length + 1}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*,video/*"
                  className="hidden"
                  onChange={(e) => onFilePicked(e.target.files?.[0] ?? null)}
                />

                {!draft ? (
                  <button
                    type="button"
                    onClick={() => fileRef.current?.click()}
                    className="w-full rounded-md border-2 border-dashed border-border hover:border-ember/60 hover:bg-ember/5 transition-colors py-8 text-center"
                  >
                    <Upload className="h-6 w-6 mx-auto text-muted-foreground mb-2" />
                    <div className="text-sm font-medium">Upload image or video</div>
                    <div className="text-[11px] text-muted-foreground mt-1">Prototype — file stays local in your browser</div>
                  </button>
                ) : (
                  <div className="space-y-2">
                    <div className="rounded-md overflow-hidden bg-navy aspect-[9/16] max-h-80 mx-auto relative">
                      {draft.kind === "image" ? (
                        <img src={draft.url} alt={draft.name} className="w-full h-full object-cover" />
                      ) : (
                        <video src={draft.url} controls className="w-full h-full object-cover bg-black" />
                      )}
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="inline-flex items-center gap-1.5 text-muted-foreground truncate">
                        <FileVideo className="h-3.5 w-3.5" /> {draft.name}
                      </span>
                      <div className="flex gap-1">
                        <Button size="sm" variant="ghost" onClick={() => fileRef.current?.click()} className="gap-1 h-7"><RefreshCw className="h-3 w-3" /> Replace</Button>
                        <Button size="sm" variant="ghost" onClick={clearDraft} className="h-7 text-rose hover:text-rose">Remove</Button>
                      </div>
                    </div>
                  </div>
                )}

                <div className="space-y-1.5">
                  <label className="text-xs font-medium">Note for the administrator (optional)</label>
                  <Textarea placeholder="What changed in this version? Anything to look at first?" rows={3} value={note} onChange={(e) => setNote(e.target.value)} />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <Button variant="outline" className="gap-1.5" onClick={saveDraft}>
                    <Save className="h-4 w-4" /> Save draft
                  </Button>
                  <Button className="gap-1.5" onClick={() => setConfirmOpen(true)} disabled={!draft}>
                    <Upload className="h-4 w-4" /> Submit for review
                  </Button>
                </div>
                {!draft && <p className="text-[11px] text-muted-foreground">Upload a file to enable submission.</p>}
              </CardContent>
            </Card>
          )}

          {(a.status === "Submitted for Review" || a.status === "Resubmitted") && (
            <Card className="card-elevated border-amber/40 bg-amber/5">
              <CardContent className="p-4 text-sm">
                <div className="font-medium inline-flex items-center gap-1.5"><Lock className="h-3.5 w-3.5 text-amber" /> Submitted — no action needed</div>
                <div className="text-xs text-muted-foreground mt-1">
                  v{a.versions.length} is locked and waiting for an administrator. You'll see their decision — approval or revision notes — here.
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Submit v{a.versions.length + 1} for review?</AlertDialogTitle>
            <AlertDialogDescription>
              Once submitted, this version is locked. If the administrator requests changes, uploading a new file will create v{a.versions.length + 2}.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Not yet</AlertDialogCancel>
            <AlertDialogAction onClick={submit}>Submit for review</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

function Row({ k, v, pre }: { k: string; v: any; pre?: boolean }) {
  return (
    <div className="grid grid-cols-[150px_1fr] gap-3">
      <div className="text-[11px] uppercase tracking-wide text-muted-foreground pt-0.5">{k}</div>
      <div className={pre ? "whitespace-pre-line" : ""}>{v}</div>
    </div>
  );
}

function InfoRow({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-wide text-muted-foreground"><Icon className="h-3 w-3 inline mr-1" />{label}</div>
      <div className="font-medium">{value}</div>
    </div>
  );
}
