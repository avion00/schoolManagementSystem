import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Info, Users, MessageSquare, Paperclip, Settings2,
  Bold, Italic, Underline, List, ListOrdered, Link2, Eraser,
  Send, FileText, Eye, RotateCcw, ArrowLeft, Calendar,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormSection } from "@/components/students/forms/FormSection";
import { RecipientSelector } from "./RecipientSelector";
import { MessageAttachmentUploader } from "./MessageAttachmentUploader";
import { MessagePreviewModal } from "./MessagePreviewModal";
import {
  MESSAGE_TYPE_OPTIONS, MESSAGE_PRIORITY_OPTIONS, SEND_METHOD_OPTIONS,
} from "@/data/messagesData";
import type { MessageAttachment, MessagePriority, MessageType, SendMethod } from "@/data/messagesData";

interface FormState {
  subject:         string;
  type:            MessageType | "";
  priority:        MessagePriority | "";
  sendMethod:      SendMethod | "";
  recipientType:   string;
  selectedClasses: string[];
  selectedSections:string[];
  selectedPeople:  string[];
  body:            string;
  attachments:     MessageAttachment[];
  sendNow:         boolean;
  scheduleDate:    string;
  scheduleTime:    string;
  requireAck:      boolean;
  copyAdmin:       boolean;
}

interface Errors {
  subject?:      string;
  type?:         string;
  priority?:     string;
  sendMethod?:   string;
  recipientType?:string;
  recipients?:   string;
  body?:         string;
  scheduleDate?: string;
  scheduleTime?: string;
}

const EMPTY: FormState = {
  subject: "", type: "", priority: "Normal", sendMethod: "In-app",
  recipientType: "", selectedClasses: [], selectedSections: [], selectedPeople: [],
  body: "", attachments: [], sendNow: true,
  scheduleDate: "", scheduleTime: "", requireAck: false, copyAdmin: false,
};

function countErrors(errors: Errors, keys: (keyof Errors)[]): number {
  return keys.filter((k) => !!errors[k]).length;
}

export function MessageComposeForm() {
  const navigate   = useNavigate();
  const [form, setForm]       = useState<FormState>(EMPTY);
  const [errors, setErrors]   = useState<Errors>({});
  const [sending, setSending] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [sent, setSent]       = useState(false);
  const [shake, setShake]     = useState(false);

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((e) => ({ ...e, [key]: undefined }));
  }

  function validate(): Errors {
    const e: Errors = {};
    if (!form.subject.trim())    e.subject      = "Subject is required";
    if (!form.type)              e.type         = "Message type is required";
    if (!form.priority)          e.priority     = "Priority is required";
    if (!form.sendMethod)        e.sendMethod   = "Send method is required";
    if (!form.recipientType)     e.recipientType= "Recipient type is required";
    if (!form.body.trim())       e.body         = "Message body is required";
    if (!form.sendNow) {
      if (!form.scheduleDate)    e.scheduleDate = "Schedule date is required";
      if (!form.scheduleTime)    e.scheduleTime = "Schedule time is required";
    }
    return e;
  }

  function scrollToFirst(errs: Errors) {
    const order: (keyof Errors)[] = ["subject","type","priority","sendMethod","recipientType","body","scheduleDate"];
    const first = order.find((k) => !!errs[k]);
    if (first) {
      document.getElementById(`field-${first}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }

  async function handleSend(asDraft = false) {
    if (!asDraft) {
      const errs = validate();
      if (Object.keys(errs).length) {
        setErrors(errs);
        setShake(true);
        setTimeout(() => setShake(false), 600);
        scrollToFirst(errs);
        return;
      }
    }
    setSending(true);
    await new Promise((r) => setTimeout(r, 700));
    console.log("Message payload:", { ...form, status: asDraft ? "draft" : (form.sendNow ? "sent" : "scheduled") });
    setSending(false);
    setSent(true);
  }

  if (sent) {
    return (
      <Card className="mx-auto max-w-md rounded-2xl p-10 text-center shadow-sm">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-950/50">
          <Send className="h-8 w-8 text-emerald-600" />
        </div>
        <h2 className="text-[18px] font-bold text-foreground">Message Sent Successfully</h2>
        <p className="mt-2 text-[13px] text-muted-foreground">
          Your message has been sent to the selected recipients.
        </p>
        <div className="mt-6 flex flex-col gap-2">
          <Button onClick={() => navigate("/messages/sent")} className="w-full gap-2">
            <Send className="h-4 w-4" /> View Sent Messages
          </Button>
          <Button variant="outline" onClick={() => { setForm(EMPTY); setErrors({}); setSent(false); }} className="w-full gap-2">
            <FileText className="h-4 w-4" /> Compose Another
          </Button>
        </div>
      </Card>
    );
  }

  const infoCount = countErrors(errors, ["subject","type","priority","sendMethod"]);
  const recpCount = countErrors(errors, ["recipientType","recipients"]);
  const bodyCount = countErrors(errors, ["body"]);
  const optsCount = countErrors(errors, ["scheduleDate","scheduleTime"]);

  return (
    <>
      <div className={shake ? "animate-[shake_0.4s_ease-in-out]" : ""}>
        {/* Back button */}
        <Button variant="ghost" size="sm" className="mb-4 gap-1.5 text-[13px]"
          onClick={() => navigate("/messages")}>
          <ArrowLeft className="h-4 w-4" /> Back to Messages
        </Button>

        <div className="space-y-4">
          {/* ── A. Message Information ────────────────────────────── */}
          <FormSection icon={Info} title="Message Information"
            subtitle="Subject, type, priority, and send method"
            errorCount={infoCount}>
            <div className="grid gap-4 sm:grid-cols-2">
              {/* Subject */}
              <div className="sm:col-span-2" id="field-subject">
                <label className="mb-1.5 block text-[12px] font-medium text-foreground">
                  Subject / Title<span className="ml-0.5 text-rose-500">*</span>
                </label>
                <Input
                  value={form.subject}
                  onChange={(e) => set("subject", e.target.value)}
                  placeholder="e.g. Final Exam Routine Published"
                  className={`h-9 text-[13px] ${errors.subject ? "border-rose-500 focus-visible:ring-rose-300" : ""}`}
                />
                {errors.subject && <p className="mt-1 text-[11px] text-rose-500">{errors.subject}</p>}
              </div>

              {/* Type */}
              <div id="field-type">
                <label className="mb-1.5 block text-[12px] font-medium text-foreground">
                  Message Type<span className="ml-0.5 text-rose-500">*</span>
                </label>
                <select
                  value={form.type}
                  onChange={(e) => set("type", e.target.value as MessageType)}
                  className={`h-9 w-full rounded-lg border bg-background px-3 text-[13px] text-foreground focus:outline-none focus:ring-2 focus:ring-ring
                    ${errors.type ? "border-rose-500" : "border-input"}`}
                >
                  <option value="">Select type…</option>
                  {MESSAGE_TYPE_OPTIONS.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
                {errors.type && <p className="mt-1 text-[11px] text-rose-500">{errors.type}</p>}
              </div>

              {/* Priority */}
              <div id="field-priority">
                <label className="mb-1.5 block text-[12px] font-medium text-foreground">
                  Priority<span className="ml-0.5 text-rose-500">*</span>
                </label>
                <div className="flex gap-2">
                  {MESSAGE_PRIORITY_OPTIONS.map((p) => {
                    const DOT: Record<string,string> = { Low:"bg-slate-400", Normal:"bg-blue-500", High:"bg-amber-500", Urgent:"bg-rose-500" };
                    return (
                      <button key={p} type="button" onClick={() => set("priority", p)}
                        className={`flex-1 h-9 rounded-lg border text-[12px] font-medium transition-colors flex items-center justify-center gap-1.5
                          ${form.priority === p
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-border bg-background text-muted-foreground hover:bg-muted"}`}>
                        <span className={`h-2 w-2 rounded-full ${DOT[p]}`} />
                        {p}
                      </button>
                    );
                  })}
                </div>
                {errors.priority && <p className="mt-1 text-[11px] text-rose-500">{errors.priority}</p>}
              </div>

              {/* Send Method */}
              <div className="sm:col-span-2" id="field-sendMethod">
                <label className="mb-1.5 block text-[12px] font-medium text-foreground">
                  Send Method<span className="ml-0.5 text-rose-500">*</span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {SEND_METHOD_OPTIONS.map((m) => (
                    <button key={m} type="button" onClick={() => set("sendMethod", m as SendMethod)}
                      className={`h-8 rounded-lg border px-4 text-[12px] font-medium transition-colors
                        ${form.sendMethod === m
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border bg-background text-muted-foreground hover:bg-muted"}`}>
                      {m}
                    </button>
                  ))}
                </div>
                {errors.sendMethod && <p className="mt-1 text-[11px] text-rose-500">{errors.sendMethod}</p>}
              </div>
            </div>
          </FormSection>

          {/* ── B. Recipients ─────────────────────────────────────── */}
          <FormSection icon={Users} title="Recipients"
            subtitle="Who should receive this message"
            errorCount={recpCount}>
            <RecipientSelector
              recipientType={form.recipientType}
              selectedClasses={form.selectedClasses}
              selectedSections={form.selectedSections}
              selectedPeople={form.selectedPeople}
              onTypeChange={(v) => set("recipientType", v)}
              onClassesChange={(v) => set("selectedClasses", v)}
              onSectionsChange={(v) => set("selectedSections", v)}
              onPeopleChange={(v) => set("selectedPeople", v)}
              typeError={errors.recipientType}
              peopleError={errors.recipients}
            />
          </FormSection>

          {/* ── C. Message Body ───────────────────────────────────── */}
          <FormSection icon={MessageSquare} title="Message Body"
            subtitle="Write your message content"
            errorCount={bodyCount}>
            {/* Formatting toolbar */}
            <div className="mb-2 flex flex-wrap gap-1 rounded-lg border border-border bg-muted/30 p-1.5">
              {[Bold, Italic, Underline, List, ListOrdered, Link2, Eraser].map((Icon, i) => (
                <button key={i} type="button"
                  className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:bg-background hover:text-foreground transition-colors"
                  title={["Bold","Italic","Underline","Bullet List","Numbered List","Link","Clear"][i]}>
                  <Icon className="h-3.5 w-3.5" />
                </button>
              ))}
            </div>
            <div id="field-body">
              <textarea
                value={form.body}
                onChange={(e) => set("body", e.target.value)}
                placeholder="Type your message here…"
                rows={10}
                className={`w-full resize-y rounded-xl border bg-background px-4 py-3 text-[13px] text-foreground leading-relaxed placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring
                  ${errors.body ? "border-rose-500 focus:ring-rose-300" : "border-input"}`}
              />
              {errors.body && <p className="mt-1 text-[11px] text-rose-500">{errors.body}</p>}
              <p className="mt-1 text-right text-[11px] text-muted-foreground">{form.body.length} characters</p>
            </div>
          </FormSection>

          {/* ── D. Attachments ────────────────────────────────────── */}
          <FormSection icon={Paperclip} title="Attachments"
            subtitle="Attach PDFs, images, or documents"
            defaultOpen={false}>
            <MessageAttachmentUploader
              attachments={form.attachments}
              onChange={(a) => set("attachments", a)}
            />
          </FormSection>

          {/* ── E. Sending Options ────────────────────────────────── */}
          <FormSection icon={Settings2} title="Sending Options"
            subtitle="Schedule, acknowledgement, and copy settings"
            errorCount={optsCount}
            defaultOpen={false}>
            <div className="space-y-4">
              {/* Send now vs schedule */}
              <div className="flex gap-3">
                {[{ val: true, label: "Send Now" }, { val: false, label: "Schedule for Later" }].map(({ val, label }) => (
                  <button key={String(val)} type="button" onClick={() => set("sendNow", val)}
                    className={`flex-1 h-9 rounded-lg border text-[12px] font-medium transition-colors
                      ${form.sendNow === val
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border bg-background text-muted-foreground hover:bg-muted"}`}>
                    {label}
                  </button>
                ))}
              </div>

              {/* Schedule inputs */}
              {!form.sendNow && (
                <div className="grid grid-cols-2 gap-3">
                  <div id="field-scheduleDate">
                    <label className="mb-1.5 block text-[12px] font-medium text-foreground">
                      <Calendar className="inline mr-1 h-3.5 w-3.5" />
                      Schedule Date<span className="ml-0.5 text-rose-500">*</span>
                    </label>
                    <Input type="date" value={form.scheduleDate}
                      onChange={(e) => set("scheduleDate", e.target.value)}
                      className={`h-9 text-[13px] ${errors.scheduleDate ? "border-rose-500" : ""}`} />
                    {errors.scheduleDate && <p className="mt-1 text-[11px] text-rose-500">{errors.scheduleDate}</p>}
                  </div>
                  <div id="field-scheduleTime">
                    <label className="mb-1.5 block text-[12px] font-medium text-foreground">
                      Schedule Time<span className="ml-0.5 text-rose-500">*</span>
                    </label>
                    <Input type="time" value={form.scheduleTime}
                      onChange={(e) => set("scheduleTime", e.target.value)}
                      className={`h-9 text-[13px] ${errors.scheduleTime ? "border-rose-500" : ""}`} />
                    {errors.scheduleTime && <p className="mt-1 text-[11px] text-rose-500">{errors.scheduleTime}</p>}
                  </div>
                </div>
              )}

              {/* Toggles */}
              {[
                { key: "requireAck" as const, label: "Require recipient acknowledgement" },
                { key: "copyAdmin"  as const, label: "Send a copy to admin"              },
              ].map(({ key, label }) => (
                <label key={key} className="flex cursor-pointer items-center gap-3">
                  <button type="button" onClick={() => set(key, !form[key])}
                    className={`relative inline-flex h-5 w-9 shrink-0 rounded-full border-2 border-transparent transition-colors
                      ${form[key] ? "bg-primary" : "bg-muted"}`}>
                    <span className={`pointer-events-none inline-block h-4 w-4 rounded-full bg-white shadow ring-0 transition-transform
                      ${form[key] ? "translate-x-4" : "translate-x-0"}`} />
                  </button>
                  <span className="text-[12px] font-medium text-foreground">{label}</span>
                </label>
              ))}
            </div>
          </FormSection>

          {/* ── Action buttons ────────────────────────────────────── */}
          <div className="flex flex-wrap gap-3">
            <Button onClick={() => handleSend(false)} disabled={sending} className="gap-2">
              <Send className="h-4 w-4" />
              {sending ? "Sending…" : "Send Message"}
            </Button>
            <Button variant="outline" onClick={() => handleSend(true)} disabled={sending} className="gap-2">
              <FileText className="h-4 w-4" />
              Save Draft
            </Button>
            <Button variant="outline" onClick={() => setShowPreview(true)} className="gap-2">
              <Eye className="h-4 w-4" />
              Preview
            </Button>
            <Button variant="ghost" onClick={() => { setForm(EMPTY); setErrors({}); }} className="gap-2">
              <RotateCcw className="h-4 w-4" />
              Reset
            </Button>
          </div>
        </div>
      </div>

      {showPreview && (
        <MessagePreviewModal
          data={{
            subject:       form.subject,
            type:          form.type || "General",
            priority:      (form.priority as MessagePriority) || "Normal",
            recipientType: form.recipientType,
            recipients:    [...form.selectedClasses, ...form.selectedSections, ...form.selectedPeople],
            sendMethod:    form.sendMethod || "In-app",
            body:          form.body,
            attachments:   form.attachments,
          }}
          onClose={() => setShowPreview(false)}
          onSend={() => { setShowPreview(false); handleSend(false); }}
        />
      )}

      <style>{`
        @keyframes shake {
          0%,100%{transform:translateX(0)}
          20%{transform:translateX(-6px)}
          40%{transform:translateX(6px)}
          60%{transform:translateX(-4px)}
          80%{transform:translateX(4px)}
        }
      `}</style>
    </>
  );
}

