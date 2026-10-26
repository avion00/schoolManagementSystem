import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  FileText, AlignLeft, Users, Calendar, Paperclip, StickyNote,
  Save, Send, Clock, X,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input }  from "@/components/ui/input";
import { FormSection } from "@/components/ui/form-section";
import { PremiumSelect } from "@/components/ui/PremiumSelect";
import { NoticeAudienceSelector }   from "@/components/notices/forms/NoticeAudienceSelector";
import { NoticeAttachmentUploader } from "@/components/notices/forms/NoticeAttachmentUploader";
import { PremiumEmptyState } from "@/components/ui/PremiumEmptyState";
import { PremiumSkeleton } from "@/components/ui/PremiumSkeleton";
import { NOTICE_CATEGORY_OPTIONS, NOTICE_PRIORITY_OPTIONS } from "@/api/types/notices";
import type { AudienceType, NoticeCategory, NoticePriority, NoticeStatus, NoticeAttachment } from "@/api/types/notices";
import { AUDIENCE_VALUE, mapNotice, useNoticeRecord, usePublishNotice, useSaveNotice } from "@/api/notices";
import { errorMessage } from "@/api/http";
import { cn } from "@/lib/utils";

// ── Form state ────────────────────────────────────────────────────────────────
interface FormData {
  title:               string;
  category:            NoticeCategory | "";
  priority:            NoticePriority | "";
  summary:             string;
  body:                string;
  importantInstructions: string;
  externalLink:        string;
  audience:            string;
  targetClasses:       string[];
  targetSections:      string[];
  publishDate:         string;
  publishTime:         string;
  expiryDate:          string;
  pinned:              boolean;
  sendNotification:    boolean;
  sendEmail:           boolean;
  sendSms:             boolean;
  internalNotes:       string;
  requiresAcknowledgement: boolean;
}

type Errors = Partial<Record<keyof FormData | "attachments", string>>;

function defaultForm(): FormData {
  return {
    title: "", category: "", priority: "Normal",
    summary: "", body: "", importantInstructions: "", externalLink: "",
    audience: "All", targetClasses: [], targetSections: [],
    publishDate: "", publishTime: "", expiryDate: "",
    pinned: false, sendNotification: true, sendEmail: false, sendSms: false,
    internalNotes: "", requiresAcknowledgement: false,
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
  const record   = useNoticeRecord(mode === "edit" ? id : undefined);
  const save     = useSaveNotice();
  const publish  = usePublishNotice();
  const existing = record.data ? mapNotice(record.data) : undefined;

  const [form, setForm] = useState<FormData>(defaultForm);
  const [loaded, setLoaded] = useState(mode === "create");
  const [attachments, setAttachments] = useState<NoticeAttachment[]>([]);
  const [errors,      setErrors]      = useState<Errors>({});
  const [saving,      setSaving]      = useState<"publish" | "draft" | "schedule" | null>(null);

  useEffect(() => {
    if (!existing || loaded) return;
    const at = existing.publishAt ? new Date(existing.publishAt) : null;
    const pad = (n: number) => String(n).padStart(2, "0");
    setForm({
      title: existing.title, category: existing.category, priority: existing.priority,
      summary: existing.summary, body: existing.body, importantInstructions: existing.importantInstructions ?? "",
      externalLink: existing.externalLink ?? "", audience: existing.audience,
      targetClasses: existing.targetClassIds, targetSections: existing.targetSectionIds,
      publishDate: at ? `${at.getFullYear()}-${pad(at.getMonth() + 1)}-${pad(at.getDate())}` : "",
      publishTime: at ? `${pad(at.getHours())}:${pad(at.getMinutes())}` : "",
      expiryDate: existing.expiryDate ?? "", pinned: existing.pinned, sendNotification: existing.sendNotification,
      sendEmail: existing.sendEmail, sendSms: false, internalNotes: existing.internalNotes ?? "",
      requiresAcknowledgement: existing.requiresAcknowledgement,
    });
    setAttachments(existing.attachments);
    setLoaded(true);
  }, [existing, loaded]);

  function set<K extends keyof FormData>(key: K, value: FormData[K]) {
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((e) => ({ ...e, [key]: undefined }));
  }

  function validate(st: NoticeStatus): boolean {
    const e: Errors = {};
    if (!form.title.trim())    e.title    = "Notice title is required.";
    if (!form.category)        e.category = "Category is required.";
    if (!form.priority)        e.priority = "Priority is required.";
    if (!form.audience)        e.audience = "Target audience is required.";
    if (!form.body.trim())     e.body     = "Notice body is required.";
    if (st === "Scheduled") {
      if (!form.publishDate) e.publishDate = "Pick the date to publish on.";
      else if (publishAtIso() && new Date(publishAtIso()!) <= new Date()) e.publishDate = "A scheduled notice needs a future date and time.";
    }
    if (form.expiryDate && form.publishDate && form.expiryDate < form.publishDate) e.expiryDate = "Expiry is before the publish date.";
    if (form.externalLink && !/^https?:\/\//.test(form.externalLink)) e.externalLink = "Links must start with http:// or https://";
    setErrors(e);
    const firstKey = Object.keys(e)[0];
    if (firstKey) {
      document.querySelector(`[data-field="${firstKey}"]`)?.scrollIntoView({ behavior: "smooth", block: "center" });
    }
    return Object.keys(e).length === 0;
  }

  function publishAtIso(): string | null {
    if (!form.publishDate) return null;
    return new Date(`${form.publishDate}T${form.publishTime || "08:00"}`).toISOString();
  }

  /** Draft: save only. Published: save, then publish now. Scheduled: save with a future time, then publish (the server schedules it). */
  async function handleSave(target: NoticeStatus) {
    if (!validate(target)) return;
    setSaving(target === "Published" ? "publish" : target === "Scheduled" ? "schedule" : "draft");
    try {
      const body = {
        title: form.title.trim(), category: (form.category as string).toLowerCase(),
        priority: (form.priority as string).toLowerCase(), audience: AUDIENCE_VALUE[form.audience as AudienceType],
        target_class_levels: form.audience === "Staff" ? [] : form.targetClasses,
        target_sections: form.audience === "Staff" ? [] : form.targetSections,
        summary: form.summary.trim(), body: form.body.trim(), instructions: form.importantInstructions.trim(),
        external_link: form.externalLink.trim(),
        publish_at: target === "Published" ? null : publishAtIso(),
        expires_on: form.expiryDate || null, pinned: form.pinned,
        requires_acknowledgement: form.requiresAcknowledgement, send_notification: form.sendNotification,
        send_email: form.sendEmail, send_sms: false, internal_notes: form.internalNotes.trim(),
        attachment_ids: attachments.map((a) => a.id),
      };
      const saved = await save.mutateAsync({ id: mode === "edit" ? id : undefined, body });
      const alreadyLive = existing && existing.status !== "Draft";
      if (target !== "Draft" && !alreadyLive) {
        const r = await publish.mutateAsync(saved.id);
        toast.success(r.status === "scheduled" ? "Notice scheduled." : `Notice published${r.notified ? ` and ${r.notified} people notified` : ""}.`);
      } else {
        toast.success(alreadyLive ? "Notice updated." : "Draft saved.");
      }
      navigate(`/notices/${saved.id}`);
    } catch (e) {
      toast.error(errorMessage(e));
    } finally {
      setSaving(null);
    }
  }

  if (mode === "edit" && record.isError) return <PremiumEmptyState title="Couldn't load this notice" description={errorMessage(record.error)} />;
  if (!loaded) return <PremiumSkeleton className="mx-auto h-96 max-w-3xl rounded-2xl" />;
  if (existing?.status === "Archived") {
    return <PremiumEmptyState title="Archived notices can't be edited" description="Duplicate it from the notice board to reuse the content." />;
  }
  const live = !!existing && existing.status !== "Draft";

  return (
    <div className="mx-auto max-w-3xl space-y-6 px-4 py-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">
            {mode === "create" ? "Create New Notice" : "Edit Notice"}
          </h1>
          <p className="text-[12px] text-muted-foreground mt-0.5">
            {mode === "create" ? "The notice number is assigned when you save." : `Editing ${existing?.noticeId} · ${existing?.status}`}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="h-8 gap-1.5 text-[12px]"
            onClick={() => navigate("/notices")}>
            <X className="h-3.5 w-3.5" />Back
          </Button>
        </div>
      </div>

      {/* ── Section A: Basic Info ─────────────────────────────────────────── */}
      <FormSection icon={FileText} title="Basic Notice Information"
        subtitle="Title, category and priority" defaultOpen>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field id="title" label="Notice Title" required error={errors.title}>
            <Input id="title" value={form.title} onChange={(e) => set("title", e.target.value)}
              placeholder="e.g. Final Exam Routine Published" className="h-9 text-[12px]" />
          </Field>

          <Field id="category" label="Category" required error={errors.category}>
            <PremiumSelect
              value={form.category}
              onChange={(v) => set("category", v as NoticeCategory)}
              placeholder="Select category"
              options={NOTICE_CATEGORY_OPTIONS.map((c) => ({ value: c, label: c }))}
            />
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

          <Field id="externalLink" label="External Link (optional)" error={errors.externalLink}>
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
          onAudienceChange={(v)        => set("audience",        v)}
          onTargetClassesChange={(v)   => set("targetClasses",   v)}
          onTargetSectionsChange={(v)  => set("targetSections",  v)}
          audienceError={errors.audience}
        />
      </FormSection>

      {/* ── Section D: Publishing Settings ───────────────────────────────── */}
      <FormSection icon={Calendar} title="Publishing Settings"
        subtitle="Schedule, notifications, and visibility options">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Field id="publishDate" label="Schedule Date (for Schedule)" error={errors.publishDate}>
            <Input id="publishDate" type="date" value={form.publishDate}
              onChange={(e) => set("publishDate", e.target.value)} className="h-9 text-[12px]" />
          </Field>
          <Field id="publishTime" label="Schedule Time">
            <Input id="publishTime" type="time" value={form.publishTime}
              onChange={(e) => set("publishTime", e.target.value)} className="h-9 text-[12px]" />
          </Field>
          <Field id="expiryDate" label="Expiry Date" error={errors.expiryDate}>
            <Input id="expiryDate" type="date" value={form.expiryDate}
              onChange={(e) => set("expiryDate", e.target.value)} className="h-9 text-[12px]" />
          </Field>
        </div>

        <div className="mt-4 space-y-3">
          <Toggle label="Pin notice to top" value={form.pinned} onChange={(v) => set("pinned", v)} />
          <Toggle label="Ask readers to acknowledge" value={form.requiresAcknowledgement} onChange={(v) => set("requiresAcknowledgement", v)} />
          <Toggle label="Send in-app notification when published" value={form.sendNotification} onChange={(v) => set("sendNotification", v)} />
          <Toggle label="Also email readers who have an email address" value={form.sendEmail} onChange={(v) => set("sendEmail", v)} />
          <p className="text-[11px] text-muted-foreground">Notifications go out once, when the notice is published.</p>
        </div>
      </FormSection>

      {/* ── Section E: Attachments ────────────────────────────────────────── */}
      <FormSection icon={Paperclip} title="Attachments"
        subtitle="Upload documents, images, or files">
        <NoticeAttachmentUploader attachments={attachments} onChange={setAttachments} />
      </FormSection>

      {/* ── Section F: Admin Notes ────────────────────────────────────────── */}
      <FormSection icon={StickyNote} title="Admin Notes"
        subtitle="Internal notes (not visible to readers)">
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
        </div>
      </FormSection>

      {/* Action bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border/40 pt-5">
        <Button variant="outline" size="sm" className="h-9 gap-1.5 text-[12px]"
          onClick={() => navigate("/notices")}>
          <X className="h-3.5 w-3.5" />Back to Notices
        </Button>

        <div className="flex flex-wrap gap-2">
          {live ? (
            <Button size="sm" className="h-9 gap-1.5 text-[12px]" disabled={!!saving} onClick={() => handleSave("Draft")}>
              <Save className="h-3.5 w-3.5" />
              {saving ? "Saving…" : "Save Changes"}
            </Button>
          ) : (<>
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
            {saving === "publish" ? "Publishing…" : "Publish Now"}
          </Button>
          </>)}
        </div>
      </div>
    </div>
  );
}
