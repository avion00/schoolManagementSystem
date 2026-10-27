/** Teacher portal pages: own classes, students, timetable, LMS and pay, from /me/teacher/ and /lms/. */
import { useState } from "react";
import { BookOpen, CalendarCheck, ClipboardList, Layers, MessageSquare, Plus, Send, Trash2, Upload, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { KPITrendCard } from "@/components/ui/KPITrendCard";
import { METRIC_TONES } from "@/components/ui/MetricCard";
import { PremiumCard } from "@/components/ui/PremiumCard";
import { PremiumEmptyState } from "@/components/ui/PremiumEmptyState";
import { PremiumSkeleton } from "@/components/ui/PremiumSkeleton";
import { FileChip, Loaded, NoticesReader, PortalHeader, TodayPeriods, WeekGrid } from "@/components/portal/PortalViews";
import { PortalAccount } from "@/components/portal/PortalAccount";
import { PortalHelp } from "@/components/portal/PortalHelp";
import { useMoney } from "@/api/billing";
import { uploadFile, type StoredFile } from "@/api/files";
import { errorMessage } from "@/api/http";
import {
  useAssignmentActions, useLessonPlanActions, useLessonPlans, useMaterialActions, useMaterials, useSubmissions,
  useTeacherAssignments, type TeacherAssignment,
} from "@/api/lms";
import {
  useClassStudents, useMyClasses, useMyPayslips, useMyStaffAttendanceSummary, useTeacherTimetable, useTeacherToday,
  type TeacherClass,
} from "@/api/portal";
import { messagesService } from "@/lib/messagesService";
import { openChat } from "@/lib/openChat";
import { cn } from "@/lib/utils";

const fail = (e: unknown) => toast.error(errorMessage(e));
const inputCls = "h-9 w-full rounded-lg border border-input bg-background px-3 text-[12.5px] focus:outline-none focus:ring-1 focus:ring-ring";
const classLabel = (c: TeacherClass) => [c.class_level_name, c.section_name, c.subject_name].filter(Boolean).join(" · ");

/** Opens a chat with a guardian, found by their email among people this teacher may message. */
function messageGuardian(email: string, onOpen: (id: string) => void) {
  if (!email) { toast.error("This guardian has no email on file, so they don't have a portal account."); return; }
  messagesService.searchContacts(email)
    .then((rows) => {
      const g = rows.find((r) => r.email.toLowerCase() === email.toLowerCase());
      if (!g) { toast.error("This guardian doesn't have a portal account yet."); return; }
      openChat({ otherUserId: g.id }, onOpen);
    })
    .catch(fail);
}

export function TeacherDashboardPage() {
  const classes = useMyClasses();
  const today = useTeacherToday();
  const navigate = useNavigate();
  const list = classes.data ?? [];
  const unmarked = list.filter((c) => c.is_class_teacher && !c.attendance_complete_today).length;
  return (
    <div className="space-y-5">
      <PortalHeader title="Dashboard" description="Your classes and today's teaching." />
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <KPITrendCard label="My Classes" value={String(list.length)} icon={Layers} iconCls={METRIC_TONES.blue} />
        <KPITrendCard label="Students" value={String(list.reduce((n, c) => n + c.students, 0))} icon={Users} iconCls={METRIC_TONES.purple} />
        <KPITrendCard label="Registers Pending Today" value={String(unmarked)} icon={CalendarCheck} iconCls={unmarked ? METRIC_TONES.red : METRIC_TONES.green} />
        <KPITrendCard label="Marks Pending" value={String(list.reduce((n, c) => n + (c.pending_marks ?? 0), 0))} icon={ClipboardList} iconCls={METRIC_TONES.amber} />
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <PremiumCard className="p-5">
          <p className="mb-3 text-[14px] font-semibold">Today</p>
          <Loaded query={today}>{(t) => <TodayPeriods periods={t.periods} showSection />}</Loaded>
        </PremiumCard>
        <PremiumCard className="p-5">
          <p className="mb-3 text-[14px] font-semibold">My Classes</p>
          {classes.isLoading && <PremiumSkeleton className="h-32 w-full rounded-xl" />}
          {classes.isSuccess && list.length === 0 && <p className="py-6 text-center text-[12px] text-muted-foreground">No classes assigned yet.</p>}
          <div className="space-y-2">
            {list.map((c) => (
              <button key={c.assignment} onClick={() => navigate(`/teacher/classes?open=${c.assignment}`)}
                className="flex w-full items-center justify-between gap-2 rounded-lg border border-border/60 p-2.5 text-left text-[12.5px] hover:bg-muted/40">
                <span className="truncate font-medium">{classLabel(c)}{c.is_class_teacher ? " (class teacher)" : ""}</span>
                <span className="shrink-0 text-muted-foreground">{c.students} students{c.attendance_rate_30d != null ? ` · ${c.attendance_rate_30d}%` : ""}</span>
              </button>
            ))}
          </div>
        </PremiumCard>
      </div>
    </div>
  );
}

export function TeacherTodayPage() {
  const q = useTeacherToday();
  return (<div className="space-y-5"><PortalHeader title="Today" description={q.data ? `${q.data.day} · ${q.data.date}` : undefined} /><Loaded query={q}>{(t) => <TodayPeriods periods={t.periods} showSection />}</Loaded></div>);
}

export function TeacherTimetablePage() {
  const q = useTeacherTimetable();
  return (<div className="space-y-5"><PortalHeader title="My Timetable" /><Loaded query={q}>{(w) => <WeekGrid week={w} showSection />}</Loaded></div>);
}

function ClassStudents({ assignment }: { assignment: string }) {
  const q = useClassStudents(assignment);
  const navigate = useNavigate();
  return (
    <Loaded query={q} empty={(d) => (d.length === 0 ? "No active students in this class" : false)}>
      {(rows) => (
        <div className="overflow-x-auto">
          <table className="w-full text-[12.5px]">
            <thead className="text-[11px] text-muted-foreground"><tr>
              <th className="py-2 text-left">Roll</th><th className="text-left">Student</th><th className="text-right">Attendance</th>
              <th className="text-left pl-4">Guardian</th><th />
            </tr></thead>
            <tbody>
              {rows.map((s) => (
                <tr key={s.id} className="border-t border-border/40">
                  <td className="py-2 text-muted-foreground">{s.roll_number || "—"}</td>
                  <td className="font-medium">{s.name}<span className="block text-[11px] font-normal text-muted-foreground">{s.admission_number}</span></td>
                  <td className={cn("text-right tabular-nums", s.attendance_pct != null && s.attendance_pct < 75 && "text-rose-600")}>{s.attendance_pct == null ? "—" : `${s.attendance_pct}%`}</td>
                  <td className="pl-4 text-muted-foreground">{s.guardian_name || "—"}{s.guardian_phone ? ` · ${s.guardian_phone}` : ""}</td>
                  <td className="text-right">
                    {s.guardian_email && (
                      <Button size="sm" variant="ghost" className="h-7 gap-1 text-[11.5px]"
                        onClick={() => messageGuardian(s.guardian_email, (id) => navigate(`/teacher/messages/${id}`))}>
                        <MessageSquare className="h-3.5 w-3.5" /> Message
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Loaded>
  );
}

export function TeacherClassesPage({ title = "My Classes", description = "Your classes and their students." }: { title?: string; description?: string }) {
  const q = useMyClasses();
  const initial = new URLSearchParams(window.location.search).get("open");
  const [open, setOpen] = useState<string | null>(initial);
  return (
    <div className="space-y-5">
      <PortalHeader title={title} description={description} />
      <Loaded query={q} empty={(d) => (d.length === 0 ? "No classes are assigned to you yet" : false)}>
        {(list) => (
          <div className="space-y-2">
            {list.map((c) => (
              <PremiumCard key={c.assignment} className="p-4">
                <button type="button" className="flex w-full flex-wrap items-center gap-3 text-left" onClick={() => setOpen(open === c.assignment ? null : c.assignment)}>
                  <BookOpen className="h-4 w-4 shrink-0 text-primary" />
                  <span className="min-w-0 flex-1 truncate text-[13px] font-semibold">{classLabel(c)}</span>
                  {c.is_class_teacher && <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-medium text-primary">Class teacher</span>}
                  <span className="text-[12px] text-muted-foreground">{c.students} students · 30-day attendance {c.attendance_rate_30d == null ? "—" : `${c.attendance_rate_30d}%`}</span>
                </button>
                {open === c.assignment && <div className="mt-3"><ClassStudents assignment={c.assignment} /></div>}
              </PremiumCard>
            ))}
          </div>
        )}
      </Loaded>
    </div>
  );
}

export const TeacherParentsPage = () => (
  <TeacherClassesPage title="Parent Communication" description="Open a class to see guardians and message those with a portal account." />
);

// ── assignments ──────────────────────────────────────────────────────────────

function AssignmentForm({ onDone }: { onDone: () => void }) {
  const classes = useMyClasses().data ?? [];
  const { save } = useAssignmentActions();
  const [f, setF] = useState({ cls: "", kind: "homework", title: "", instructions: "", due: "", max: "", allowLate: false });
  const [files, setFiles] = useState<StoredFile[]>([]);
  function submit() {
    const c = classes.find((x) => x.assignment === f.cls);
    if (!c || !c.subject || !f.title.trim() || !f.due) { toast.error("Pick a class, enter a title and set a due date."); return; }
    save.mutate({ body: {
      class_level: c.class_level, section: c.section, subject: c.subject, kind: f.kind, title: f.title.trim(),
      instructions: f.instructions, due_at: new Date(f.due).toISOString(), max_marks: f.max || null, allow_late: f.allowLate,
      attachment_ids: files.map((x) => x.id),
    } }, { onSuccess: () => { toast.success("Saved as a draft. Publish it when ready."); onDone(); }, onError: fail });
  }
  return (
    <div className="space-y-3">
      <select value={f.cls} onChange={(e) => setF({ ...f, cls: e.target.value })} className={inputCls}>
        <option value="">Choose class & subject</option>
        {classes.filter((c) => c.subject).map((c) => <option key={c.assignment} value={c.assignment}>{classLabel(c)}</option>)}
      </select>
      <div className="grid grid-cols-2 gap-2">
        <select value={f.kind} onChange={(e) => setF({ ...f, kind: e.target.value })} className={inputCls}>
          <option value="homework">Homework</option><option value="assignment">Assignment</option><option value="project">Project</option>
        </select>
        <input type="number" min={0} value={f.max} onChange={(e) => setF({ ...f, max: e.target.value })} placeholder="Max marks (optional)" className={inputCls} />
      </div>
      <input value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} placeholder="Title" className={inputCls} />
      <textarea value={f.instructions} onChange={(e) => setF({ ...f, instructions: e.target.value })} rows={4} placeholder="Instructions"
        className="w-full rounded-lg border border-input bg-background px-3 py-2 text-[12.5px]" />
      <div className="grid grid-cols-2 gap-2">
        <input type="datetime-local" value={f.due} onChange={(e) => setF({ ...f, due: e.target.value })} className={inputCls} />
        <label className="flex items-center gap-2 text-[12px] text-muted-foreground">
          <input type="checkbox" checked={f.allowLate} onChange={(e) => setF({ ...f, allowLate: e.target.checked })} /> Accept late work
        </label>
      </div>
      <label className="inline-flex cursor-pointer items-center gap-1.5 text-[12px] text-muted-foreground">
        <Upload className="h-3.5 w-3.5" /> Attach file
        <input type="file" className="hidden" onChange={(e) => {
          const file = e.target.files?.[0]; e.target.value = "";
          if (file) uploadFile(file).then((sf) => setFiles((x) => [...x, sf])).catch(fail);
        }} />
      </label>
      <div className="flex flex-wrap gap-1.5">{files.map((x) => <FileChip key={x.id} file={x} />)}</div>
      <Button className="w-full" disabled={save.isPending} onClick={submit}>{save.isPending ? "Saving…" : "Save Draft"}</Button>
    </div>
  );
}

function Submissions({ a }: { a: TeacherAssignment }) {
  const q = useSubmissions(a.id);
  const { grade } = useAssignmentActions();
  return (
    <Loaded query={q}>
      {(d) => (
        <div className="space-y-2">
          <p className="text-[12px] text-muted-foreground">{d.submitted} of {d.total} submitted</p>
          {d.rows.map((r) => (
            <div key={r.student} className="rounded-lg border border-border/60 p-2.5 text-[12.5px]">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-medium">{r.roll_number ? `${r.roll_number}. ` : ""}{r.name}</span>
                <span className="rounded-full bg-muted px-2 py-0.5 text-[11px] capitalize">{r.status}</span>
                {r.submission?.marks != null && <span className="ml-auto font-semibold">{r.submission.marks}{a.max_marks ? ` / ${a.max_marks}` : ""}</span>}
              </div>
              {r.submission && (<>
                {r.submission.text_answer && <p className="mt-1 whitespace-pre-line text-muted-foreground">{r.submission.text_answer}</p>}
                <div className="mt-1 flex flex-wrap gap-1.5">{r.submission.attachments.map((x) => <FileChip key={x.id} file={x} />)}</div>
                <Button size="sm" variant="outline" className="mt-2 h-7 text-[11.5px]" onClick={() => {
                  const marks = a.max_marks ? window.prompt(`Marks out of ${a.max_marks}:`, r.submission?.marks ?? "") : "";
                  if (marks === null) return;
                  const feedback = window.prompt("Feedback (optional):", r.submission?.feedback ?? "") ?? "";
                  grade.mutate({ id: a.id, submission: r.submission!.id, marks: marks ?? "", feedback }, { onSuccess: () => toast.success("Graded."), onError: fail });
                }}>Grade</Button>
              </>)}
            </div>
          ))}
        </div>
      )}
    </Loaded>
  );
}

export function TeacherAssignmentsPage() {
  const q = useTeacherAssignments();
  const { publish, close, remove } = useAssignmentActions();
  const [creating, setCreating] = useState(false);
  const [open, setOpen] = useState<string | null>(null);
  return (
    <div className="space-y-5">
      <PortalHeader title="Homework & Assignments" description="Set work, publish it to the class and grade submissions."
        actions={<Button size="sm" className="h-9 gap-1.5" onClick={() => setCreating(true)}><Plus className="h-4 w-4" /> New</Button>} />
      <Loaded query={q} empty={(d) => (d.length === 0 ? "No assignments yet" : false)}>
        {(rows) => (
          <div className="space-y-2">
            {rows.map((a) => (
              <PremiumCard key={a.id} className="p-4">
                <div className="flex flex-wrap items-center gap-3">
                  <button type="button" className="min-w-0 flex-1 text-left" onClick={() => setOpen(open === a.id ? null : a.id)}>
                    <p className="truncate text-[13px] font-semibold">{a.title}</p>
                    <p className="text-[11.5px] text-muted-foreground">{[a.class_level_name, a.section_name, a.subject_name].filter(Boolean).join(" · ")}{a.due_at ? ` · due ${new Date(a.due_at).toLocaleString()}` : ""} · {a.submissions_count} submitted</p>
                  </button>
                  <span className="rounded-full bg-muted px-2.5 py-0.5 text-[11px] font-medium capitalize">{a.status}</span>
                  {a.status === "draft" && (<>
                    <Button size="sm" className="h-7 gap-1 text-[11.5px]" onClick={() => publish.mutate(a.id, { onSuccess: () => toast.success("Published to the class."), onError: fail })}><Send className="h-3.5 w-3.5" /> Publish</Button>
                    <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-rose-600" onClick={() => window.confirm("Delete this draft?") && remove.mutate(a.id, { onError: fail })}><Trash2 className="h-3.5 w-3.5" /></Button>
                  </>)}
                  {a.status === "published" && <Button size="sm" variant="outline" className="h-7 text-[11.5px]" onClick={() => window.confirm("Close it? No more submissions will be accepted.") && close.mutate(a.id, { onError: fail })}>Close</Button>}
                </div>
                {open === a.id && (
                  <div className="mt-3 space-y-2 text-[12.5px]">
                    {a.instructions && <p className="whitespace-pre-line">{a.instructions}</p>}
                    <div className="flex flex-wrap gap-1.5">{a.attachments.map((x) => <FileChip key={x.id} file={x} />)}</div>
                    {a.status !== "draft" && <Submissions a={a} />}
                  </div>
                )}
              </PremiumCard>
            ))}
          </div>
        )}
      </Loaded>
      <Dialog open={creating} onOpenChange={setCreating}>
        <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto">
          <DialogHeader><DialogTitle>New Homework / Assignment</DialogTitle><DialogDescription>Saved as a draft until you publish it.</DialogDescription></DialogHeader>
          <AssignmentForm onDone={() => setCreating(false)} />
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ── materials ────────────────────────────────────────────────────────────────

export function TeacherMaterialsPage() {
  const q = useMaterials();
  const classes = useMyClasses().data ?? [];
  const { save, remove } = useMaterialActions();
  const [f, setF] = useState({ cls: "", title: "", description: "", url: "" });
  const [file, setFile] = useState<StoredFile | null>(null);
  function add() {
    const c = classes.find((x) => x.assignment === f.cls);
    if (!c || !c.subject || !f.title.trim() || (!file && !f.url.trim())) { toast.error("Choose a class, add a title, and attach a file or link."); return; }
    const type = file ? (file.kind === "image" ? "image" : file.kind === "video" ? "video" : file.kind === "pdf" ? "pdf" : "doc") : "link";
    save.mutate({ class_level: c.class_level, section: c.section, subject: c.subject, title: f.title.trim(), description: f.description, type,
      file_id: file?.id ?? null, url: f.url.trim(), is_shared: true },
    { onSuccess: () => { toast.success("Shared with the class."); setF({ cls: "", title: "", description: "", url: "" }); setFile(null); }, onError: fail });
  }
  return (
    <div className="space-y-5">
      <PortalHeader title="Learning Materials" description="Share notes, slides and links with your classes." />
      <PremiumCard className="space-y-2 p-4">
        <div className="grid gap-2 md:grid-cols-2">
          <select value={f.cls} onChange={(e) => setF({ ...f, cls: e.target.value })} className={inputCls}>
            <option value="">Choose class & subject</option>
            {classes.filter((c) => c.subject).map((c) => <option key={c.assignment} value={c.assignment}>{classLabel(c)}</option>)}
          </select>
          <input value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} placeholder="Title" className={inputCls} />
          <input value={f.description} onChange={(e) => setF({ ...f, description: e.target.value })} placeholder="Description (optional)" className={inputCls} />
          <input value={f.url} onChange={(e) => setF({ ...f, url: e.target.value })} placeholder="Link (optional)" className={inputCls} />
        </div>
        <div className="flex items-center gap-3">
          <label className="inline-flex cursor-pointer items-center gap-1.5 text-[12px] text-muted-foreground">
            <Upload className="h-3.5 w-3.5" /> {file ? file.original_name : "Attach file"}
            <input type="file" className="hidden" onChange={(e) => { const x = e.target.files?.[0]; e.target.value = ""; if (x) uploadFile(x).then(setFile).catch(fail); }} />
          </label>
          <Button size="sm" className="ml-auto h-8" disabled={save.isPending} onClick={add}>Share</Button>
        </div>
      </PremiumCard>
      <Loaded query={q} empty={(d) => (d.length === 0 ? "Nothing shared yet" : false)}>
        {(rows) => (
          <div className="space-y-2">
            {rows.map((m) => (
              <PremiumCard key={m.id} className="flex flex-wrap items-center gap-3 p-3">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13px] font-semibold">{m.title}</p>
                  <p className="text-[11.5px] text-muted-foreground">{[m.class_level_name, m.section_name, m.subject_name].filter(Boolean).join(" · ")}</p>
                </div>
                {m.file && <FileChip file={m.file} />}
                {m.url && <a href={m.url} target="_blank" rel="noreferrer" className="text-[12px] text-primary hover:underline">Link</a>}
                <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-rose-600" onClick={() => window.confirm("Remove this material?") && remove.mutate(m.id, { onError: fail })}><Trash2 className="h-3.5 w-3.5" /></Button>
              </PremiumCard>
            ))}
          </div>
        )}
      </Loaded>
    </div>
  );
}

// ── lesson plans ─────────────────────────────────────────────────────────────

export function TeacherLessonPlansPage() {
  const q = useLessonPlans();
  const classes = useMyClasses().data ?? [];
  const { save, submit, remove } = useLessonPlanActions();
  const [f, setF] = useState({ cls: "", week: "", topic: "", objectives: "", homework: "" });
  function add() {
    const c = classes.find((x) => x.assignment === f.cls);
    if (!c || !c.subject || !f.week || !f.topic.trim()) { toast.error("Choose a class, the week and a topic."); return; }
    save.mutate({ body: { class_level: c.class_level, section: c.section, subject: c.subject, week_start: f.week, topic: f.topic.trim(),
      objectives: f.objectives.split("\n").map((x) => x.trim()).filter(Boolean), materials: [], homework: f.homework } },
    { onSuccess: () => { toast.success("Draft saved."); setF({ cls: "", week: "", topic: "", objectives: "", homework: "" }); }, onError: fail });
  }
  return (
    <div className="space-y-5">
      <PortalHeader title="Lesson Plans" description="Plan each week and submit plans for review." />
      <PremiumCard className="space-y-2 p-4">
        <div className="grid gap-2 md:grid-cols-3">
          <select value={f.cls} onChange={(e) => setF({ ...f, cls: e.target.value })} className={inputCls}>
            <option value="">Choose class & subject</option>
            {classes.filter((c) => c.subject).map((c) => <option key={c.assignment} value={c.assignment}>{classLabel(c)}</option>)}
          </select>
          <input type="date" value={f.week} onChange={(e) => setF({ ...f, week: e.target.value })} className={inputCls} title="Week starting" />
          <input value={f.topic} onChange={(e) => setF({ ...f, topic: e.target.value })} placeholder="Topic" className={inputCls} />
        </div>
        <textarea value={f.objectives} onChange={(e) => setF({ ...f, objectives: e.target.value })} rows={3} placeholder="Objectives (one per line)"
          className="w-full rounded-lg border border-input bg-background px-3 py-2 text-[12.5px]" />
        <input value={f.homework} onChange={(e) => setF({ ...f, homework: e.target.value })} placeholder="Homework (optional)" className={inputCls} />
        <Button size="sm" className="h-8" disabled={save.isPending} onClick={add}>Save Draft</Button>
      </PremiumCard>
      <Loaded query={q} empty={(d) => (d.length === 0 ? "No lesson plans yet" : false)}>
        {(rows) => (
          <div className="space-y-2">
            {[...rows].sort((a, b) => b.week_start.localeCompare(a.week_start)).map((p) => (
              <PremiumCard key={p.id} className="p-4">
                <div className="flex flex-wrap items-center gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[13px] font-semibold">{p.topic}</p>
                    <p className="text-[11.5px] text-muted-foreground">Week of {p.week_start} · {p.class_level_name} · {p.subject_name}</p>
                  </div>
                  <span className="rounded-full bg-muted px-2.5 py-0.5 text-[11px] font-medium capitalize">{p.status.replace("_", " ")}</span>
                  {(p.status === "draft" || p.status === "changes_requested") && (
                    <Button size="sm" className="h-7 text-[11.5px]" onClick={() => submit.mutate(p.id, { onSuccess: () => toast.success("Submitted for review."), onError: fail })}>Submit</Button>
                  )}
                  {p.status === "draft" && <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-rose-600" onClick={() => window.confirm("Delete this draft?") && remove.mutate(p.id, { onError: fail })}><Trash2 className="h-3.5 w-3.5" /></Button>}
                </div>
                {p.objectives.length > 0 && <ul className="mt-2 list-disc pl-5 text-[12px] text-muted-foreground">{p.objectives.map((o, i) => <li key={i}>{o}</li>)}</ul>}
                {p.review_note && <p className="mt-2 rounded-lg bg-amber-50 p-2 text-[12px] text-amber-800 dark:bg-amber-950/30 dark:text-amber-300">Reviewer: {p.review_note}</p>}
              </PremiumCard>
            ))}
          </div>
        )}
      </Loaded>
    </div>
  );
}

export const TeacherNoticesPage = () => (<div className="space-y-5"><PortalHeader title="Notices" /><NoticesReader /></div>);
export const TeacherHelpPage = PortalHelp;

function PayAndAttendance() {
  const slips = useMyPayslips();
  const att = useMyStaffAttendanceSummary();
  const money = useMoney();
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <PremiumCard className="p-5">
        <p className="mb-3 text-[14px] font-semibold">My Payslips</p>
        <Loaded query={slips} empty={(d) => (d.length === 0 ? "No payslips yet" : false)}>
          {(rows) => (
            <div className="space-y-1.5 text-[12.5px]">
              {rows.map((p) => (
                <div key={String(p.id)} className="flex justify-between rounded-lg border border-border/60 p-2.5">
                  <span>{String(p.month)}</span><span className="font-semibold">{money(Number(p.net))}</span>
                </div>
              ))}
            </div>
          )}
        </Loaded>
      </PremiumCard>
      <PremiumCard className="p-5">
        <p className="mb-3 text-[14px] font-semibold">My Attendance</p>
        <Loaded query={att}>
          {(s) => (
            <div className="grid grid-cols-3 gap-2 text-center text-[12px]">
              {(["present", "absent", "late", "leave", "half_day", "total"] as const).map((k) => (
                <div key={k} className="rounded-lg border border-border/60 p-2"><p className="text-lg font-bold">{s[k] ?? 0}</p><p className="capitalize text-muted-foreground">{k.replace("_", " ")}</p></div>
              ))}
            </div>
          )}
        </Loaded>
      </PremiumCard>
    </div>
  );
}

export const TeacherAccountPage = () => <PortalAccount extra={<PayAndAttendance />} />;

export function NoPortalAccess() {
  return <PremiumEmptyState title="Nothing here" description="This page isn't available for your account." />;
}
