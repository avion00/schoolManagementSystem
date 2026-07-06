import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  FileText, AlignLeft, Users, Calendar, Paperclip, StickyNote,
  Save, Send, Clock, X, RefreshCw,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input }  from "@/components/ui/input";
import { FormSection } from "@/components/students/forms/FormSection";
import { NoticeAudienceSelector }   from "@/components/notices/forms/NoticeAudienceSelector";
import { NoticeAttachmentUploader } from "@/components/notices/forms/NoticeAttachmentUploader";
import {
  NOTICES, NOTICE_CATEGORY_OPTIONS, NOTICE_PRIORITY_OPTIONS, NOTICE_STATUS_OPTIONS,
} from "@/data/noticesData";
import type { NoticeCategory, NoticePriority, NoticeStatus, NoticeAttachment } from "@/data/noticesData";
import { cn } from "@/lib/utils";

// ── Form state ────────────────────────────────────────────────────────────────
interface FormData {
  title:               string;
  category:            NoticeCategory | "";
  priority:            NoticePriority | "";
  status:              NoticeStatus | "";
  summary:             string;
  body:                string;
  importantInstructions: string;
  externalLink:        string;
  audience:            string;
  targetClasses:       string[];
  targetSections:      string[];
  sendToAll:           boolean;
  publishDate:         string;
  publishTime:         string;
  expiryDate:          string;
  pinned:              boolean;
  sendNotification:    boolean;
  sendEmail:           boolean;
  sendSms:             boolean;
  internalNotes:       string;
  approvalRemarks:     string;
}

type Errors = Partial<Record<keyof FormData | "attachments", string>>;

function defaultForm(): FormData {
  return {
    title: "", category: "", priority: "Normal", status: "Draft",
    summary: "", body: "", importantInstructions: "", externalLink: "",
    audience: "All", targetClasses: [], targetSections: [], sendToAll: true,
    publishDate: "", publishTime: "", expiryDate: "",
    pinned: false, sendNotification: false, sendEmail: false, sendSms: false,
    internalNotes: "", approvalRemarks: "",
  };
}

function Field({ id, label, required, error, children }: {
  id: string; label: string; required?: boolean; error?: string; children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5" data-field={id}>
      <label htmlFor={id} className="text-[12px] font-medium text-foreground">
        {label}{required && <span className="ml-0.5 text-rose-500">*</span>}
      </label>
      {children}
      {error && <p className="text-[11px] text-rose-500">{error}</p>}
    </div>
  );
}

function Toggle({ label, value, onChange }: { label: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center gap-3">
      <button type="button" onClick={() => onChange(!value)}
        className={cn("relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors",
          value ? "bg-primary" : "bg-muted")}>
        <span className={cn("pointer-events-none inline-block h-4 w-4 rounded-full bg-white shadow ring-0 transition-transform",
          value ? "translate-x-4" : "translate-x-0")} />
      </button>
      <span className="text-[12px] text-foreground">{label}</span>
    </div>
  );
}

// ── Component ─────────────────────────────────────────────────────────────────
export function NoticeForm({ mode }: { mode: "create" | "edit" }) {
  const navigate = useNavigate();
  const { id }   = useParams<{ id: string }>();
  const numId    = Number(id ?? 0);
  const existing = mode === "edit" ? NOTICES.find((n) => n.id === numId) : undefined;

  const [form, setForm] = useState<FormData>(() => {
    if (existing) {
      return {
        title:               existing.title,
        category:            existing.category,
        priority:            existing.priority,
        status:              existing.status,
        summary:             existing.summary,
        body:                existing.body,
        importantInstructions: existing.importantInstructions ?? "",
        externalLink:        existing.externalLink ?? "",
        audience:            existing.audience,
        targetClasses:       existing.targetClasses,
        targetSections:      existing.targetSections,
        sendToAll:           true,
        publishDate:         existing.publishDate,
        publishTime:         existing.publishTime,
        expiryDate:          existing.expiryDate ?? "",
        pinned:              existing.pinned,
        sendNotification:    existing.sendNotification,
        sendEmail:           existing.sendEmail,
        sendSms:             existing.sendSms,
        internalNotes:       existing.internalNotes ?? "",
        approvalRemarks:     existing.approvalRemarks ?? "",
      };
    }
    return defaultForm();
  });

  const [attachments, setAttachments] = useState<NoticeAttachment[]>(existing?.attachments ?? []);
  const [errors,      setErrors]      = useState<Errors>({});
  const [saving,      setSaving]      = useState<"publish" | "draft" | "schedule" | null>(null);

  function set<K extends keyof FormData>(key: K, value: FormData[K]) {
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((e) => ({ ...e, [key]: undefined }));
  }

  function validate(statusOverride?: NoticeStatus): boolean {
    const e: Errors = {};
    const st = statusOverride ?? (form.status as NoticeStatus);
    if (!form.title.trim())    e.title    = "Notice title is required.";
    if (!form.category)        e.category = "Category is required.";
    if (!form.priority)        e.priority = "Priority is required.";
    if (!form.audience)        e.audience = "Target audience is required.";
    if (!form.body.trim())     e.body     = "Notice body is required.";
    if ((st === "Published" || st === "Scheduled") && !form.publishDate) {
      e.publishDate = "Publish date is required for published/scheduled notices.";
    }
    setErrors(e);
    const firstKey = Object.keys(e)[0];
    if (firstKey) {
      document.querySelector(`[data-field="${firstKey}"]`)?.scrollIntoView({ behavior: "smooth", block: "center" });
    }
    return Object.keys(e).length === 0;
  }

  async function handleSave(statusOverride?: NoticeStatus) {
    const st = statusOverride ?? (form.status as NoticeStatus);
    if (!validate(st)) return;
    const saveType = statusOverride === "Published" ? "publish" : statusOverride === "Scheduled" ? "schedule" : "draft";
    setSaving(saveType);
    await new Promise((res) => setTimeout(res, 700));
    setSaving(null);
    console.log("Notice data:", { ...form, status: st, attachments });
    const msg = st === "Published"  ? "Notice published successfully!" :
                st === "Scheduled"  ? "Notice scheduled successfully!" :
                                      "Draft saved!";
    toast.success(msg);
    navigate("/notices");
  }

  const noticeId = existing?.noticeId ?? `NOT-${new Date().getFullYear()}-${String(NOTICES.length + 1).padStart(4, "0")}`;

  return (
    <div className="mx-auto max-w-3xl space-y-6 px-4 py-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">
            {mode === "create" ? "Create New Notice" : "Edit Notice"}
          </h1>
          <p className="text-[12px] text-muted-foreground mt-0.5">
            {mode === "create" ? `Notice ID: ${noticeId} (auto-generated)` : `Editing: ${existing?.noticeId}`}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="h-8 gap-1.5 text-[12px]"
            onClick={() => navigate("/notices")}>
            <X className="h-3.5 w-3.5" />Back
          </Button>
          <Button variant="outline" size="sm" className="h-8 gap-1.5 text-[12px]"
            onClick={() => { setForm(defaultForm()); setAttachments([]); setErrors({}); }}>
            <RefreshCw className="h-3.5 w-3.5" />Reset
          </Button>
        </div>
      </div>

      {/* ── Section A: Basic Info ─────────────────────────────────────────── */}
      <FormSection icon={FileText} title="Basic Notice Information"
        subtitle="Title, category, priority, and status" defaultOpen>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field id="title" label="Notice Title" required error={errors.title}>
            <Input id="title" value={form.title} onChange={(e) => set("title", e.target.value)}
              placeholder="e.g. Final Exam Routine Published" className="h-9 text-[12px]" />
          </Field>

          <Field id="category" label="Category" required error={errors.category}>
            <select id="category" value={form.category}
              onChange={(e) => set("category", e.target.value as NoticeCategory)}
              className="h-9 rounded-lg border border-input bg-background px-3 text-[12px] text-foreground focus:outline-none focus:ring-1 focus:ring-ring">
              <option value="">Select category</option>
              {NOTICE_CATEGORY_OPTIONS.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </Field>

          <Field id="priority" label="Priority" required error={errors.priority}>
            <div className="flex gap-2 flex-wrap">
              {NOTICE_PRIORITY_OPTIONS.map((p) => {
                const colors: Record<string, string> = {
                  Low:    "border-slate-300 data-[sel=true]:bg-slate-500 data-[sel=true]:text-white",
                  Normal: "border-blue-300  data-[sel=true]:bg-blue-500  data-[sel=true]:text-white",
                  High:   "border-amber-400 data-[sel=true]:bg-amber-500 data-[sel=true]:text-white",
                  Urgent: "border-rose-400  data-[sel=true]:bg-rose-500  data-[sel=true]:text-white",
                };
                return (
                  <button key={p} type="button"
                    data-sel={String(form.priority === p)}
                    onClick={() => set("priority", p)}
                    className={cn("h-8 rounded-lg border px-3 text-[12px] font-medium transition-colors", colors[p],
                      form.priority !== p && "bg-background text-muted-foreground hover:bg-muted")}>
                    {p}
                  </button>
                );
              })}
            </div>
          </Field>

          <Field id="status" label="Status" required error={errors.status}>
            <div className="flex gap-2 flex-wrap">
              {NOTICE_STATUS_OPTIONS.map((s) => {
                const colors: Record<string, string> = {
                  Draft:     "border-slate-300 data-[sel=true]:bg-slate-500 data-[sel=true]:text-white",
                  Scheduled: "border-violet-300 data-[sel=true]:bg-violet-500 data-[sel=true]:text-white",
                  Published: "border-emerald-400 data-[sel=true]:bg-emerald-500 data-[sel=true]:text-white",
                  Archived:  "border-slate-300 data-[sel=true]:bg-slate-400 data-[sel=true]:text-white",
                };
                return (
                  <button key={s} type="button"
                    data-sel={String(form.status === s)}
                    onClick={() => set("status", s)}
                    className={cn("h-8 rounded-lg border px-3 text-[12px] font-medium transition-colors", colors[s],
                      form.status !== s && "bg-background text-muted-foreground hover:bg-muted")}>
                    {s}
                  </button>
                );
              })}
            </div>
          </Field>

          <div className="sm:col-span-2">
            <Field id="summary" label="Short Summary">
              <Input id="summary" value={form.summary} onChange={(e) => set("summary", e.target.value)}
                placeholder="Brief one-line summary of the notice…" className="h-9 text-[12px]" />
            </Field>
          </div>
        </div>
      </FormSection>

      {/* ── Section B: Notice Content ─────────────────────────────────────── */}
      <FormSection icon={AlignLeft} title="Notice Content"
        subtitle="Full notice body, instructions, and links">
        <div className="space-y-4">
          <Field id="body" label="Notice Body" required error={errors.body}>
            <textarea
              id="body"
              value={form.body}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => set("body", e.target.value)}
              rows={8}
              placeholder="Write the full notice content here…"
              className={cn(
                "w-full rounded-lg border border-input bg-background px-3 py-2 text-[12px] text-foreground shadow-sm focus:outline-none focus:ring-1 focus:ring-ring resize-y leading-relaxed",
                errors.body && "border-rose-400",
              )}
            />
            {errors.body && <p className="text-[11px] text-rose-500">{errors.body}</p>}
          </Field>

          <Field id="importantInstructions" label="Important Instructions (optional)">
            <textarea
              id="importantInstructions"
              value={form.importantInstructions}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => set("importantInstructions", e.target.value)}
              rows={3}
              placeholder="Any special instructions or warnings…"
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-[12px] text-foreground shadow-sm focus:outline-none focus:ring-1 focus:ring-ring resize-y"
            />
          </Field>

          <Field id="externalLink" label="External Link (optional)">
            <Input id="externalLink" value={form.externalLink}
              onChange={(e) => set("externalLink", e.target.value)}
              placeholder="https://…" className="h-9 text-[12px]" />
          </Field>
        </div>
      </FormSection>

      {/* ── Section C: Target Audience ────────────────────────────────────── */}
      <FormSection icon={Users} title="Target Audience"
        subtitle="Who should receive this notice">
        <NoticeAudienceSelector
          audience={form.audience}
          targetClasses={form.targetClasses}
          targetSections={form.targetSections}
          sendToAll={form.sendToAll}
          onAudienceChange={(v)        => set("audience",        v)}
          onTargetClassesChange={(v)   => set("targetClasses",   v)}
          onTargetSectionsChange={(v)  => set("targetSections",  v)}
          onSendToAllChange={(v)       => set("sendToAll",       v)}
          audienceError={errors.audience}
        />
      </FormSection>

      {/* ── Section D: Publishing Settings ───────────────────────────────── */}
      <FormSection icon={Calendar} title="Publishing Settings"
        subtitle="Schedule, notifications, and visibility options">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Field id="publishDate" label="Publish Date" error={errors.publishDate}
            required={form.status === "Published" || form.status === "Scheduled"}>
            <Input id="publishDate" type="date" value={form.publishDate}
              onChange={(e) => set("publishDate", e.target.value)} className="h-9 text-[12px]" />
          </Field>
          <Field id="publishTime" label="Publish Time">
            <Input id="publishTime" type="time" value={form.publishTime}
              onChange={(e) => set("publishTime", e.target.value)} className="h-9 text-[12px]" />
          </Field>
          <Field id="expiryDate" label="Expiry Date">
            <Input id="expiryDate" type="date" value={form.expiryDate}
              onChange={(e) => set("expiryDate", e.target.value)} className="h-9 text-[12px]" />
          </Field>
        </div>

        <div className="mt-4 space-y-3">
          <Toggle label="Pin notice to top" value={form.pinned} onChange={(v) => set("pinned", v)} />
          <Toggle label="Send in-app notification" value={form.sendNotification} onChange={(v) => set("sendNotification", v)} />
          <Toggle label="Send email notification" value={form.sendEmail} onChange={(v) => set("sendEmail", v)} />
          <Toggle label="Send SMS notification (coming soon)" value={form.sendSms} onChange={(v) => set("sendSms", v)} />
        </div>
      </FormSection>

      {/* ── Section E: Attachments ────────────────────────────────────────── */}
      <FormSection icon={Paperclip} title="Attachments"
        subtitle="Upload documents, images, or files">
        <NoticeAttachmentUploader attachments={attachments} onChange={setAttachments} />
      </FormSection>

      {/* ── Section F: Admin Notes ────────────────────────────────────────── */}
      <FormSection icon={StickyNote} title="Admin Notes"
        subtitle="Internal notes and approval remarks (not visible to recipients)">
        <div className="space-y-4">
          <Field id="internalNotes" label="Internal Notes">
            <textarea
              id="internalNotes"
              value={form.internalNotes}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => set("internalNotes", e.target.value)}
              rows={3}
              placeholder="Notes for internal team only…"
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-[12px] text-foreground shadow-sm focus:outline-none focus:ring-1 focus:ring-ring resize-y"
            />
          </Field>
          <Field id="approvalRemarks" label="Approval Remarks">
            <textarea
              id="approvalRemarks"
              value={form.approvalRemarks}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => set("approvalRemarks", e.target.value)}
              rows={2}
              placeholder="Remarks by approving authority…"
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-[12px] text-foreground shadow-sm focus:outline-none focus:ring-1 focus:ring-ring resize-y"
            />
          </Field>
        </div>
      </FormSection>

      {/* Action bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border/40 pt-5">
        <Button variant="outline" size="sm" className="h-9 gap-1.5 text-[12px]"
          onClick={() => navigate("/notices")}>
          <X className="h-3.5 w-3.5" />Back to Notices
        </Button>

        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" className="h-9 gap-1.5 text-[12px]"
            disabled={!!saving} onClick={() => handleSave("Draft")}>
            <Save className="h-3.5 w-3.5" />
            {saving === "draft" ? "Saving…" : "Save Draft"}
          </Button>
          <Button variant="outline" size="sm" className="h-9 gap-1.5 text-[12px] border-violet-300 text-violet-700 hover:bg-violet-50"
            disabled={!!saving} onClick={() => handleSave("Scheduled")}>
            <Clock className="h-3.5 w-3.5" />
            {saving === "schedule" ? "Scheduling…" : "Schedule Notice"}
          </Button>
          <Button size="sm" className="h-9 gap-1.5 text-[12px]"
            disabled={!!saving} onClick={() => handleSave("Published")}>
            <Send className="h-3.5 w-3.5" />
            {saving === "publish" ? "Publishing…" : "Publish Notice"}
          </Button>
        </div>
      </div>
    </div>
  );
}
