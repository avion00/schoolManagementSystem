/**
 * Building blocks shared by the student, parent and teacher portals. Each takes
 * data already loaded from the portal API (or loads its own), and renders an
 * honest empty state when there's nothing yet.
 */
import { useState, type ReactNode } from "react";
import { BookOpen, CheckCircle2, Download, FileText, Link2, Paperclip, Send } from "lucide-react";
import { toast } from "sonner";

import { Reveal } from "@/components/motion";
import { Button } from "@/components/ui/button";
import { PremiumCard } from "@/components/ui/PremiumCard";
import { PremiumEmptyState } from "@/components/ui/PremiumEmptyState";
import { PremiumSkeleton } from "@/components/ui/PremiumSkeleton";
import { downloadFile, uploadFile, type StoredFile } from "@/api/files";
import { errorMessage } from "@/api/http";
import { useMoney } from "@/api/billing";
import { useAcknowledgeNotice, useMyNotices, type MyNotice } from "@/api/notices";
import {
  DAYS, useSubmitAssignment,
  type AttendanceRow, type AttendanceTotals, type ExamResultRow, type FeeTotals, type InvoiceRow, type Period,
  type PortalAssignment, type PortalMaterial, type WeekTimetable,
} from "@/api/portal";
import { cn } from "@/lib/utils";

export function PortalHeader({ title, description, actions }: { title: string; description?: string; actions?: ReactNode }) {
  return (
    <Reveal className="flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="text-2xl font-bold text-foreground">{title}</h1>
        {description && <p className="mt-0.5 text-[13px] text-muted-foreground">{description}</p>}
      </div>
      {actions}
    </Reveal>
  );
}

/** Loading / error / empty wrapper for a query's data. */
export function Loaded<T>({ query, empty, children }: {
  query: { isLoading: boolean; isError: boolean; error: unknown; data: T | undefined };
  empty?: (data: T) => boolean | string;
  children: (data: T) => ReactNode;
}) {
  if (query.isLoading) return <PremiumSkeleton className="h-64 w-full rounded-2xl" />;
  if (query.isError || query.data === undefined) return <PremiumEmptyState title="Couldn't load this" description={errorMessage(query.error)} />;
  const e = empty?.(query.data);
  if (e) return <PremiumEmptyState title={typeof e === "string" ? e : "Nothing here yet"} description="" />;
  return <>{children(query.data)}</>;
}

function download(f: StoredFile) {
  downloadFile(f).catch((e) => toast.error(errorMessage(e)));
}

export function FileChip({ file }: { file: StoredFile }) {
  return (
    <button type="button" onClick={() => download(file)}
      className="inline-flex items-center gap-1 rounded-md border border-border/60 px-2 py-1 text-[11.5px] text-muted-foreground hover:text-foreground">
      <Paperclip className="h-3 w-3" /> {file.original_name}
    </button>
  );
}

const pct = (v: number | null | undefined) => (v === null || v === undefined ? "—" : `${v}%`);
const tone = (v: number | null | undefined) => (v === null || v === undefined ? "text-muted-foreground" : v >= 90 ? "text-emerald-600" : v >= 75 ? "text-amber-600" : "text-rose-600");

// ── timetable ────────────────────────────────────────────────────────────────

export function TodayPeriods({ periods, showSection = false }: { periods: Period[]; showSection?: boolean }) {
  if (periods.length === 0) return <PremiumEmptyState title="No classes today" description="Enjoy the day off." />;
  return (
    <div className="space-y-2">
      {periods.map((p) => (
        <div key={p.id} className={cn("flex items-center gap-3 rounded-xl border p-3",
          p.state === "now" ? "border-primary bg-primary/5" : "border-border/60", p.is_break && "bg-muted/40")}>
          <div className="w-24 shrink-0 text-[12px] font-medium tabular-nums text-muted-foreground">{p.start_time?.slice(0, 5)}–{p.end_time?.slice(0, 5)}</div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[13px] font-semibold text-foreground">{p.is_break ? p.label || "Break" : p.subject}</p>
            {!p.is_break && (
              <p className="truncate text-[11.5px] text-muted-foreground">
                {[showSection ? p.section : p.teacher, p.room].filter(Boolean).join(" · ") || p.label}
              </p>
            )}
          </div>
          {p.state === "now" && <span className="rounded-full bg-primary px-2 py-0.5 text-[10.5px] font-semibold text-primary-foreground">Now</span>}
          {p.state === "next" && <span className="rounded-full bg-muted px-2 py-0.5 text-[10.5px] font-medium">Next</span>}
        </div>
      ))}
    </div>
  );
}

export function WeekGrid({ week, showSection = false }: { week: WeekTimetable; showSection?: boolean }) {
  const days = DAYS.filter((d) => (week[d] ?? []).length > 0);
  if (days.length === 0) return <PremiumEmptyState title="No timetable yet" description="The timetable appears once the school publishes it." />;
  return (
    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
      {days.map((d) => (
        <PremiumCard key={d} className="p-4">
          <p className="mb-2 text-[13px] font-semibold capitalize text-foreground">{d}</p>
          <div className="space-y-1.5">
            {week[d].map((p) => (
              <div key={p.id} className={cn("flex items-center gap-2 text-[12px]", p.is_break && "text-muted-foreground")}>
                <span className="w-24 shrink-0 tabular-nums text-muted-foreground">{p.start_time?.slice(0, 5)}–{p.end_time?.slice(0, 5)}</span>
                <span className="min-w-0 flex-1 truncate font-medium">{p.is_break ? p.label || "Break" : p.subject}</span>
                {!p.is_break && <span className="shrink-0 truncate text-[11px] text-muted-foreground">{showSection ? p.section : p.teacher ?? ""}</span>}
              </div>
            ))}
          </div>
        </PremiumCard>
      ))}
    </div>
  );
}

// ── attendance ───────────────────────────────────────────────────────────────

export function AttendanceView({ summary, rows }: { summary?: AttendanceTotals; rows: AttendanceRow[] }) {
  const by = summary?.by_status ?? rows.reduce<Record<string, number>>((a, r) => ({ ...a, [r.status]: (a[r.status] ?? 0) + 1 }), {});
  const rate = summary?.present_pct ?? null;
  const months = new Map<string, AttendanceRow[]>();
  for (const r of [...rows].sort((a, b) => b.date.localeCompare(a.date))) {
    const k = r.date.slice(0, 7);
    months.set(k, [...(months.get(k) ?? []), r]);
  }
  const COLORS: Record<string, string> = {
    present: "bg-emerald-500", absent: "bg-rose-500", late: "bg-amber-500", half_day: "bg-blue-500", leave: "bg-violet-500", excused: "bg-slate-400",
  };
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
        <PremiumCard className="p-4 text-center"><p className={cn("text-2xl font-bold", tone(rate))}>{pct(rate)}</p><p className="text-[11px] text-muted-foreground">Attendance</p></PremiumCard>
        {(["present", "absent", "late", "leave"] as const).map((k) => (
          <PremiumCard key={k} className="p-4 text-center"><p className="text-2xl font-bold">{by[k] ?? 0}</p><p className="text-[11px] capitalize text-muted-foreground">{k}</p></PremiumCard>
        ))}
      </div>
      {rows.length === 0 && <PremiumEmptyState title="No attendance recorded yet" description="" />}
      {[...months].map(([m, list]) => (
        <PremiumCard key={m} className="p-4">
          <p className="mb-2 text-[13px] font-semibold">{new Date(`${m}-01T00:00`).toLocaleDateString("en", { month: "long", year: "numeric" })}</p>
          <div className="flex flex-wrap gap-1.5">
            {list.map((r) => (
              <div key={r.id} title={`${r.date}: ${r.status.replace("_", " ")}${r.remark ? ` — ${r.remark}` : ""}`}
                className="flex w-10 flex-col items-center gap-0.5">
                <span className={cn("h-3 w-3 rounded-full", COLORS[r.status] ?? "bg-muted")} />
                <span className="text-[10px] text-muted-foreground">{r.date.slice(8)}</span>
              </div>
            ))}
          </div>
        </PremiumCard>
      ))}
    </div>
  );
}

// ── results ──────────────────────────────────────────────────────────────────

export function ResultsView({ results }: { results: ExamResultRow[] }) {
  if (results.length === 0) return <PremiumEmptyState title="No published results yet" description="Results appear here once the school publishes them." />;
  return (
    <div className="space-y-4">
      {results.map((r) => (
        <PremiumCard key={r.exam_id} className="overflow-hidden">
          <div className="flex flex-wrap items-center gap-x-6 gap-y-1 border-b border-border/50 p-4">
            <p className="text-[14px] font-semibold">{r.exam}</p>
            <span className="text-[12px] text-muted-foreground">{pct(r.percentage)} · Grade {r.grade ?? "—"} · GPA {r.gpa ?? "—"}</span>
            {r.rank !== null && <span className="text-[12px] text-muted-foreground">Rank {r.rank}{r.section_rank !== null ? ` (section ${r.section_rank})` : ""}</span>}
            <span className={cn("ml-auto rounded-full px-2.5 py-0.5 text-[11px] font-semibold capitalize",
              r.result === "pass" ? "bg-emerald-100 text-emerald-700" : r.result === "fail" ? "bg-rose-100 text-rose-700" : "bg-muted text-muted-foreground")}>{r.result}</span>
          </div>
          <table className="w-full text-[12.5px]">
            <thead className="bg-muted/40 text-[11px] text-muted-foreground">
              <tr><th className="px-4 py-2 text-left">Subject</th><th className="px-4 py-2 text-right">Marks</th><th className="px-4 py-2 text-right">%</th><th className="px-4 py-2 text-right">Grade</th></tr>
            </thead>
            <tbody>
              {r.subjects.map((s) => (
                <tr key={s.exam_subject} className="border-t border-border/40">
                  <td className="px-4 py-2">{s.subject}</td>
                  <td className="px-4 py-2 text-right tabular-nums">{s.is_absent ? "Absent" : s.marks_obtained === null ? "—" : `${s.marks_obtained} / ${s.full_marks}`}</td>
                  <td className="px-4 py-2 text-right tabular-nums">{pct(s.percentage)}</td>
                  <td className={cn("px-4 py-2 text-right font-semibold", s.result === "fail" && "text-rose-600")}>{s.grade ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </PremiumCard>
      ))}
    </div>
  );
}

// ── fees ─────────────────────────────────────────────────────────────────────

export function FeesView({ data }: { data: { summary: FeeTotals; invoices: InvoiceRow[] } }) {
  const money = useMoney();
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-3">
        <PremiumCard className="p-4"><p className="text-[11px] text-muted-foreground">Billed</p><p className="text-xl font-bold">{money(data.summary.billed)}</p></PremiumCard>
        <PremiumCard className="p-4"><p className="text-[11px] text-muted-foreground">Paid</p><p className="text-xl font-bold text-emerald-600">{money(data.summary.paid)}</p></PremiumCard>
        <PremiumCard className="p-4"><p className="text-[11px] text-muted-foreground">Outstanding</p><p className={cn("text-xl font-bold", data.summary.outstanding > 0 ? "text-rose-600" : "")}>{money(data.summary.outstanding)}</p></PremiumCard>
      </div>
      {data.invoices.length === 0 && <PremiumEmptyState title="No invoices yet" description="" />}
      <div className="space-y-2">
        {data.invoices.map((inv) => (
          <PremiumCard key={inv.id} className="flex flex-wrap items-center gap-3 p-4">
            <div className="min-w-0 flex-1">
              <p className="text-[13px] font-semibold">{inv.billing_period || inv.number}</p>
              <p className="text-[11.5px] text-muted-foreground">{inv.number} · issued {inv.issue_date}{inv.due_date ? ` · due ${inv.due_date}` : ""}</p>
            </div>
            <div className="text-right text-[12px]">
              <p className="font-semibold">{money(Number(inv.net_amount))}</p>
              <p className={cn(Number(inv.balance) > 0 ? "text-rose-600" : "text-emerald-600")}>{Number(inv.balance) > 0 ? `${money(Number(inv.balance))} due` : "Paid"}</p>
            </div>
            <span className="rounded-full bg-muted px-2.5 py-0.5 text-[11px] font-medium capitalize">{inv.status.replace("_", " ")}</span>
          </PremiumCard>
        ))}
      </div>
      <p className="text-[11.5px] text-muted-foreground">Pay at the school accounts office; receipts are issued for every payment.</p>
    </div>
  );
}

// ── assignments & materials ──────────────────────────────────────────────────

const STATUS_TONE: Record<string, string> = {
  pending: "bg-amber-100 text-amber-700", submitted: "bg-blue-100 text-blue-700", late: "bg-orange-100 text-orange-700",
  graded: "bg-emerald-100 text-emerald-700", missing: "bg-rose-100 text-rose-700", closed: "bg-muted text-muted-foreground",
};

function SubmitBox({ a }: { a: PortalAssignment }) {
  const submit = useSubmitAssignment();
  const [text, setText] = useState(a.my_submission?.text_answer ?? "");
  const [files, setFiles] = useState<StoredFile[]>([]);
  const [uploading, setUploading] = useState(false);
  return (
    <div className="mt-3 space-y-2 border-t border-border/40 pt-3">
      <textarea value={text} onChange={(e) => setText(e.target.value)} rows={3} placeholder="Your answer…"
        className="w-full resize-y rounded-lg border border-input bg-background px-3 py-2 text-[12.5px] focus:outline-none focus:ring-1 focus:ring-ring" />
      <div className="flex flex-wrap items-center gap-2">
        <label className="inline-flex cursor-pointer items-center gap-1 rounded-md border border-dashed border-input px-2 py-1 text-[11.5px] text-muted-foreground hover:text-foreground">
          <Paperclip className="h-3 w-3" /> {uploading ? "Uploading…" : "Attach file"}
          <input type="file" className="hidden" onChange={(e) => {
            const f = e.target.files?.[0]; e.target.value = "";
            if (!f) return;
            setUploading(true);
            uploadFile(f).then((sf) => setFiles((x) => [...x, sf])).catch((err) => toast.error(errorMessage(err))).finally(() => setUploading(false));
          }} />
        </label>
        {files.map((f) => <span key={f.id} className="text-[11.5px] text-muted-foreground">{f.original_name}</span>)}
        <Button size="sm" className="ml-auto h-8 gap-1.5 text-[12px]" disabled={submit.isPending || uploading || (!text.trim() && files.length === 0)}
          onClick={() => submit.mutate({ id: a.id, text, attachmentIds: files.map((f) => f.id) }, {
            onSuccess: () => { toast.success("Submitted."); setFiles([]); }, onError: (e) => toast.error(errorMessage(e)),
          })}>
          <Send className="h-3.5 w-3.5" /> {submit.isPending ? "Submitting…" : a.my_submission ? "Resubmit" : "Submit"}
        </Button>
      </div>
    </div>
  );
}

export function AssignmentsView({ rows, canSubmit = false }: { rows: PortalAssignment[]; canSubmit?: boolean }) {
  const [open, setOpen] = useState<string | null>(null);
  if (rows.length === 0) return <PremiumEmptyState title="No homework or assignments" description="New work from teachers appears here." />;
  const sorted = [...rows].sort((a, b) => (a.due_at ?? "9").localeCompare(b.due_at ?? "9"));
  return (
    <div className="space-y-2">
      {sorted.map((a) => {
        const sub = a.my_submission;
        const canSend = canSubmit && a.status === "published" && sub?.status !== "graded" && (a.allow_late || !a.due_at || new Date(a.due_at) > new Date());
        return (
          <PremiumCard key={a.id} className="p-4">
            <button type="button" className="flex w-full flex-wrap items-center gap-3 text-left" onClick={() => setOpen(open === a.id ? null : a.id)}>
              <BookOpen className="h-4 w-4 shrink-0 text-primary" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-[13px] font-semibold">{a.title}</p>
                <p className="text-[11.5px] text-muted-foreground">{a.subject_name} · {a.teacher_name}{a.due_at ? ` · due ${new Date(a.due_at).toLocaleString()}` : ""}</p>
              </div>
              {sub?.marks != null && <span className="text-[12px] font-semibold">{sub.marks}{a.max_marks ? ` / ${a.max_marks}` : ""}</span>}
              <span className={cn("rounded-full px-2.5 py-0.5 text-[11px] font-medium capitalize", STATUS_TONE[a.my_status] ?? "bg-muted")}>{a.my_status}</span>
            </button>
            {open === a.id && (
              <div className="mt-3 space-y-2 text-[12.5px]">
                {a.instructions && <p className="whitespace-pre-line text-foreground">{a.instructions}</p>}
                {a.attachments.length > 0 && <div className="flex flex-wrap gap-1.5">{a.attachments.map((f) => <FileChip key={f.id} file={f} />)}</div>}
                {sub && (
                  <div className="rounded-lg bg-muted/40 p-3">
                    <p className="flex items-center gap-1.5 text-[11.5px] text-muted-foreground"><CheckCircle2 className="h-3.5 w-3.5" /> Submitted {new Date(sub.submitted_at).toLocaleString()}{sub.is_late ? " (late)" : ""}</p>
                    {sub.text_answer && <p className="mt-1 whitespace-pre-line">{sub.text_answer}</p>}
                    {sub.attachments.length > 0 && <div className="mt-1 flex flex-wrap gap-1.5">{sub.attachments.map((f) => <FileChip key={f.id} file={f} />)}</div>}
                    {sub.feedback && <p className="mt-2 text-[12px]"><span className="font-semibold">Feedback:</span> {sub.feedback}</p>}
                  </div>
                )}
                {canSend && <SubmitBox a={a} />}
              </div>
            )}
          </PremiumCard>
        );
      })}
    </div>
  );
}

export function MaterialsView({ rows }: { rows: PortalMaterial[] }) {
  if (rows.length === 0) return <PremiumEmptyState title="No learning materials yet" description="Notes and resources shared by teachers appear here." />;
  return (
    <div className="grid gap-3 md:grid-cols-2">
      {rows.map((m) => (
        <PremiumCard key={m.id} className="flex items-start gap-3 p-4">
          <FileText className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-[13px] font-semibold">{m.title}</p>
            <p className="text-[11.5px] text-muted-foreground">{m.subject_name}{m.teacher_name ? ` · ${m.teacher_name}` : ""} · {new Date(m.created_at).toLocaleDateString()}</p>
            {m.description && <p className="mt-1 line-clamp-2 text-[12px] text-muted-foreground">{m.description}</p>}
            <div className="mt-2 flex gap-2">
              {m.file && <Button size="sm" variant="outline" className="h-7 gap-1 text-[11.5px]" onClick={() => download(m.file!)}><Download className="h-3.5 w-3.5" /> Download</Button>}
              {m.url && <a href={m.url} target="_blank" rel="noreferrer" className="inline-flex h-7 items-center gap-1 rounded-md border px-2 text-[11.5px]"><Link2 className="h-3.5 w-3.5" /> Open link</a>}
            </div>
          </div>
        </PremiumCard>
      ))}
    </div>
  );
}

// ── notices ──────────────────────────────────────────────────────────────────

export function NoticesReader() {
  const query = useMyNotices();
  const ack = useAcknowledgeNotice();
  const [open, setOpen] = useState<string | null>(null);
  return (
    <Loaded query={query} empty={(d) => (d.length === 0 ? "No notices for you right now" : false)}>
      {(notices: MyNotice[]) => (
        <div className="space-y-2">
          {notices.map((n) => (
            <PremiumCard key={n.id} className={cn("p-4", !n.readAt && "border-primary/30")}>
              <button type="button" className="flex w-full flex-wrap items-center gap-3 text-left" onClick={() => setOpen(open === n.id ? null : n.id)}>
                {!n.readAt && <span className="h-2 w-2 shrink-0 rounded-full bg-primary" />}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13px] font-semibold">{n.pinned ? "📌 " : ""}{n.title}</p>
                  <p className="text-[11.5px] text-muted-foreground">{n.category} · {n.publishDate}{n.publishedBy ? ` · ${n.publishedBy}` : ""}</p>
                </div>
                {n.priority === "Urgent" || n.priority === "High"
                  ? <span className="rounded-full bg-rose-100 px-2 py-0.5 text-[11px] font-medium text-rose-700">{n.priority}</span> : null}
              </button>
              {open === n.id && (
                <div className="mt-3 space-y-2 text-[12.5px]">
                  {n.summary && <p className="font-medium">{n.summary}</p>}
                  <p className="whitespace-pre-line">{n.body}</p>
                  {n.importantInstructions && <p className="rounded-lg bg-amber-50 p-2 text-amber-800 dark:bg-amber-950/30 dark:text-amber-300">{n.importantInstructions}</p>}
                  {n.externalLink && <a href={n.externalLink} target="_blank" rel="noreferrer" className="text-primary hover:underline">{n.externalLink}</a>}
                  {n.attachments.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {n.attachments.map((a) => <FileChip key={a.id} file={{ id: a.id, original_name: a.name, download_url: a.downloadUrl } as StoredFile} />)}
                    </div>
                  )}
                  {n.requiresAcknowledgement && (n.acknowledgedAt
                    ? <p className="flex items-center gap-1.5 text-[11.5px] text-emerald-600"><CheckCircle2 className="h-3.5 w-3.5" /> Acknowledged</p>
                    : <Button size="sm" className="h-8 text-[12px]" disabled={ack.isPending}
                        onClick={() => ack.mutate(n.id, { onSuccess: () => toast.success("Acknowledged."), onError: (e) => toast.error(errorMessage(e)) })}>
                        I have read this
                      </Button>)}
                </div>
              )}
            </PremiumCard>
          ))}
        </div>
      )}
    </Loaded>
  );
}

