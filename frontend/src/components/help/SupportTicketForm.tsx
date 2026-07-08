import { useEffect, useRef, useState, type ReactNode } from "react";
import { Paperclip, RefreshCw, Send } from "lucide-react";
import { toast } from "sonner";

import { SuccessCheck } from "@/components/motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  TICKET_MODULE_OPTIONS,
  TICKET_PRIORITY_OPTIONS,
  TICKET_ROLE_OPTIONS,
  type SupportTicketData,
  type TicketPriority,
} from "@/data/helpData";
import { cn } from "@/lib/utils";

type Errors = Partial<Record<keyof SupportTicketData, string>>;

function emptyForm(): SupportTicketData {
  return {
    fullName: "", email: "", role: "", module: "", priority: "Normal",
    subject: "", description: "", attachmentName: undefined,
  };
}

const PRIORITY_COLORS: Record<TicketPriority, string> = {
  Low:    "border-slate-300 data-[sel=true]:bg-slate-500 data-[sel=true]:text-white",
  Normal: "border-blue-300  data-[sel=true]:bg-blue-500  data-[sel=true]:text-white",
  High:   "border-amber-400 data-[sel=true]:bg-amber-500 data-[sel=true]:text-white",
  Urgent: "border-rose-400  data-[sel=true]:bg-rose-500  data-[sel=true]:text-white",
};

/** Field wrapper: label, error text, and a shake replay tied to each submit attempt. */
function Field({
  id, label, required, error, attempt, children,
}: {
  id: string; label: string; required?: boolean; error?: string; attempt: number; children: ReactNode;
}) {
  const [shake, setShake] = useState(false);
  const mounted = useRef(false);

  useEffect(() => {
    if (!mounted.current) { mounted.current = true; return; }
    if (error) {
      setShake(true);
      const t = setTimeout(() => setShake(false), 450);
      return () => clearTimeout(t);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [attempt]);

  return (
    <div className={cn("flex flex-col gap-1.5", shake && "t-shake")} data-field={id}>
      <label htmlFor={id} className="text-[12px] font-medium text-foreground">
        {label}{required && <span className="ml-0.5 text-rose-500">*</span>}
      </label>
      {children}
      {error && <p className="text-[11px] text-rose-500">{error}</p>}
    </div>
  );
}

const inputClass = (hasError?: boolean) =>
  cn(
    "h-9 w-full rounded-lg border border-input bg-background px-3 text-[12px] text-foreground shadow-sm",
    "focus:outline-none focus:ring-1 focus:ring-ring",
    hasError && "border-rose-400",
  );

export function SupportTicketForm() {
  const [form, setForm] = useState<SupportTicketData>(emptyForm());
  const [errors, setErrors] = useState<Errors>({});
  const [attempt, setAttempt] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [justSubmitted, setJustSubmitted] = useState(false);

  function set<K extends keyof SupportTicketData>(key: K, value: SupportTicketData[K]) {
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((e) => ({ ...e, [key]: undefined }));
  }

  function validate(): boolean {
    const e: Errors = {};
    if (!form.fullName.trim()) e.fullName = "Full name is required.";
    if (!form.email.trim()) e.email = "Email address is required.";
    else if (!/^\S+@\S+\.\S+$/.test(form.email)) e.email = "Enter a valid email address.";
    if (!form.role) e.role = "Please select your role.";
    if (!form.module) e.module = "Please select the related module.";
    if (!form.priority) e.priority = "Please select a priority.";
    if (!form.subject.trim()) e.subject = "Subject is required.";
    if (!form.description.trim()) e.description = "Description is required.";
    setErrors(e);
    setAttempt((n) => n + 1);
    const firstKey = Object.keys(e)[0];
    if (firstKey) {
      document.querySelector(`[data-field="${firstKey}"]`)?.scrollIntoView({ behavior: "smooth", block: "center" });
    }
    return Object.keys(e).length === 0;
  }

  function handleReset() {
    setForm(emptyForm());
    setErrors({});
    setJustSubmitted(false);
  }

  async function handleSubmit() {
    if (!validate()) return;
    setSubmitting(true);
    await new Promise((res) => setTimeout(res, 600));
    setSubmitting(false);
    // eslint-disable-next-line no-console
    console.log("Support ticket submitted:", form);
    setForm(emptyForm());
    setErrors({});
    setJustSubmitted(true);
    toast.success("Support request submitted successfully.");
  }

  return (
    <Card id="support-ticket-form" className="scroll-mt-6 rounded-2xl border-border/60 shadow-sm">
      <CardHeader>
        <CardTitle className="text-base font-semibold">Submit a Support Request</CardTitle>
        <CardDescription>
          Tell us what's happening — our team typically responds within the hours listed below.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        {justSubmitted && (
          <div className="flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 dark:border-emerald-900/50 dark:bg-emerald-950/30">
            <SuccessCheck size={28} />
            <p className="text-[12.5px] font-medium text-emerald-700 dark:text-emerald-400">
              Support request submitted successfully. Our team will reach out shortly.
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field id="fullName" label="Full Name" required error={errors.fullName} attempt={attempt}>
            <input id="fullName" value={form.fullName} onChange={(e) => set("fullName", e.target.value)}
              placeholder="e.g. Aarav Sharma" className={inputClass(!!errors.fullName)} />
          </Field>

          <Field id="email" label="Email Address" required error={errors.email} attempt={attempt}>
            <input id="email" type="email" value={form.email} onChange={(e) => set("email", e.target.value)}
              placeholder="you@school.edu" className={inputClass(!!errors.email)} />
          </Field>

          <Field id="role" label="Role" required error={errors.role} attempt={attempt}>
            <select id="role" value={form.role} onChange={(e) => set("role", e.target.value as SupportTicketData["role"])}
              className={inputClass(!!errors.role)}>
              <option value="">Select role</option>
              {TICKET_ROLE_OPTIONS.map((r) => <option key={r} value={r}>{r}</option>)}
            </select>
          </Field>

          <Field id="module" label="Module" required error={errors.module} attempt={attempt}>
            <select id="module" value={form.module} onChange={(e) => set("module", e.target.value as SupportTicketData["module"])}
              className={inputClass(!!errors.module)}>
              <option value="">Select module</option>
              {TICKET_MODULE_OPTIONS.map((m) => <option key={m} value={m}>{m}</option>)}
            </select>
          </Field>

          <div className="sm:col-span-2">
            <Field id="priority" label="Priority" required error={errors.priority} attempt={attempt}>
              <div className="flex flex-wrap gap-2">
                {TICKET_PRIORITY_OPTIONS.map((p) => (
                  <button
                    key={p}
                    type="button"
                    data-sel={String(form.priority === p)}
                    onClick={() => set("priority", p)}
                    className={cn(
                      "h-8 rounded-lg border px-3 text-[12px] font-medium transition-colors",
                      PRIORITY_COLORS[p],
                      form.priority !== p && "bg-background text-muted-foreground hover:bg-muted",
                    )}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </Field>
          </div>

          <div className="sm:col-span-2">
            <Field id="subject" label="Subject" required error={errors.subject} attempt={attempt}>
              <input id="subject" value={form.subject} onChange={(e) => set("subject", e.target.value)}
                placeholder="Brief summary of your issue or request" className={inputClass(!!errors.subject)} />
            </Field>
          </div>

          <div className="sm:col-span-2">
            <Field id="description" label="Description" required error={errors.description} attempt={attempt}>
              <textarea
                id="description"
                rows={5}
                value={form.description}
                onChange={(e) => set("description", e.target.value)}
                placeholder="Describe the issue or request in detail…"
                className={cn(
                  "w-full resize-y rounded-lg border border-input bg-background px-3 py-2 text-[12px] leading-relaxed text-foreground shadow-sm",
                  "focus:outline-none focus:ring-1 focus:ring-ring",
                  errors.description && "border-rose-400",
                )}
              />
            </Field>
          </div>

          <div className="sm:col-span-2">
            <Field id="attachment" label="Attachment (optional)" attempt={attempt}>
              <label
                htmlFor="attachment"
                className="flex h-9 cursor-pointer items-center gap-2 rounded-lg border border-dashed border-input bg-background px-3 text-[12px] text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
              >
                <Paperclip className="h-3.5 w-3.5 shrink-0" />
                {form.attachmentName ?? "Choose a file to attach…"}
              </label>
              <input
                id="attachment"
                type="file"
                className="hidden"
                onChange={(e) => set("attachmentName", e.target.files?.[0]?.name)}
              />
            </Field>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-end gap-2 border-t border-border/40 pt-4">
          <Button variant="outline" size="sm" className="h-9 gap-1.5 text-[12px]" onClick={handleReset} disabled={submitting}>
            <RefreshCw className="h-3.5 w-3.5" />
            Reset
          </Button>
          <Button size="sm" className="h-9 gap-1.5 text-[12px]" onClick={handleSubmit} disabled={submitting}>
            <Send className="h-3.5 w-3.5" />
            {submitting ? "Submitting…" : "Submit Request"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
