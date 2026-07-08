import { useEffect, useRef, useState, type ReactNode } from "react";
import { Paperclip, Send } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  ASSIGNEE_DIRECTORY, CATEGORY_OPTIONS, MODULE_OPTIONS, PRIORITY_OPTIONS, ROLE_OPTIONS,
  type NewTicketFormData, type TicketCategory, type TicketPriority, type TicketRequesterRole,
} from "@/data/helpDeskData";
import { cn } from "@/lib/utils";

export type { NewTicketFormData };

function emptyForm(): NewTicketFormData {
  return {
    requesterRole: "", requesterName: "", relatedRecord: "", category: "", module: "Dashboard",
    subject: "", description: "", priority: "Normal", assignTo: "", dueDate: "",
    attachmentName: undefined, notifyRequester: true,
  };
}

type Errors = Partial<Record<keyof NewTicketFormData, string>>;

const inputClass = (hasError?: boolean) => cn(
  "h-9 w-full rounded-lg border border-input bg-background px-3 text-[12px] text-foreground shadow-sm focus:outline-none focus:ring-1 focus:ring-ring",
  hasError && "border-rose-400",
);

function Field({ id, label, required, error, attempt, children }: {
  id: string; label: string; required?: boolean; error?: string; attempt: number; children: ReactNode;
}) {
  const [shake, setShake] = useState(false);
  const mounted = useRef(false);
  useEffect(() => {
    if (!mounted.current) { mounted.current = true; return; }
    if (error) { setShake(true); const t = setTimeout(() => setShake(false), 450); return () => clearTimeout(t); }
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

export function CreateTicketForm({
  onCreate,
  onCancel,
  submitLabel = "Create Ticket",
}: {
  onCreate: (data: NewTicketFormData) => void;
  onCancel?: () => void;
  submitLabel?: string;
}) {
  const [form, setForm] = useState<NewTicketFormData>(emptyForm());
  const [errors, setErrors] = useState<Errors>({});
  const [attempt, setAttempt] = useState(0);

  function set<K extends keyof NewTicketFormData>(key: K, value: NewTicketFormData[K]) {
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((e) => ({ ...e, [key]: undefined }));
  }

  function handleSubmit() {
    const e: Errors = {};
    if (!form.requesterRole) e.requesterRole = "Requester type is required.";
    if (!form.requesterName.trim()) e.requesterName = "Requester name is required.";
    if (!form.category) e.category = "Category is required.";
    if (!form.subject.trim()) e.subject = "Subject is required.";
    if (!form.description.trim()) e.description = "Description is required.";
    if (!form.priority) e.priority = "Priority is required.";
    setErrors(e);
    setAttempt((n) => n + 1);
    const firstKey = Object.keys(e)[0];
    if (firstKey) {
      document.querySelector(`[data-field="${firstKey}"]`)?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    onCreate(form);
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field id="requesterRole" label="Requester Type" required error={errors.requesterRole} attempt={attempt}>
          <select id="requesterRole" value={form.requesterRole} onChange={(e) => set("requesterRole", e.target.value as TicketRequesterRole)} className={inputClass(!!errors.requesterRole)}>
            <option value="">Select requester type</option>
            {ROLE_OPTIONS.map((r) => <option key={r} value={r}>{r}</option>)}
          </select>
        </Field>
        <Field id="requesterName" label="Requester Name" required error={errors.requesterName} attempt={attempt}>
          <input id="requesterName" value={form.requesterName} onChange={(e) => set("requesterName", e.target.value)}
            placeholder="e.g. Aarav Khan" className={inputClass(!!errors.requesterName)} />
        </Field>

        <div className="sm:col-span-2">
          <Field id="relatedRecord" label="Related Student / Teacher / Parent / Staff (optional)" attempt={attempt}>
            <input id="relatedRecord" value={form.relatedRecord} onChange={(e) => set("relatedRecord", e.target.value)}
              placeholder="e.g. Grade 8-A, or a linked profile name" className={inputClass()} />
          </Field>
        </div>

        <Field id="category" label="Category" required error={errors.category} attempt={attempt}>
          <select id="category" value={form.category} onChange={(e) => set("category", e.target.value as TicketCategory)} className={inputClass(!!errors.category)}>
            <option value="">Select category</option>
            {CATEGORY_OPTIONS.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </Field>
        <Field id="module" label="Module" attempt={attempt}>
          <select id="module" value={form.module} onChange={(e) => set("module", e.target.value)} className={inputClass()}>
            {MODULE_OPTIONS.map((m) => <option key={m} value={m}>{m}</option>)}
          </select>
        </Field>

        <div className="sm:col-span-2">
          <Field id="subject" label="Subject" required error={errors.subject} attempt={attempt}>
            <input id="subject" value={form.subject} onChange={(e) => set("subject", e.target.value)}
              placeholder="Brief summary of the issue" className={inputClass(!!errors.subject)} />
          </Field>
        </div>

        <div className="sm:col-span-2">
          <Field id="description" label="Description" required error={errors.description} attempt={attempt}>
            <textarea id="description" rows={4} value={form.description} onChange={(e) => set("description", e.target.value)}
              placeholder="Describe the issue in detail…"
              className={cn("w-full resize-y rounded-lg border border-input bg-background px-3 py-2 text-[12px] leading-relaxed text-foreground shadow-sm focus:outline-none focus:ring-1 focus:ring-ring", errors.description && "border-rose-400")} />
          </Field>
        </div>

        <Field id="priority" label="Priority" required error={errors.priority} attempt={attempt}>
          <select id="priority" value={form.priority} onChange={(e) => set("priority", e.target.value as TicketPriority)} className={inputClass(!!errors.priority)}>
            {PRIORITY_OPTIONS.map((p) => <option key={p} value={p}>{p}</option>)}
          </select>
        </Field>
        <Field id="assignTo" label="Assign To (optional)" attempt={attempt}>
          <select id="assignTo" value={form.assignTo} onChange={(e) => set("assignTo", e.target.value)} className={inputClass()}>
            <option value="">Unassigned</option>
            {ASSIGNEE_DIRECTORY.map((a) => <option key={a.id} value={a.name}>{a.name} — {a.department}</option>)}
          </select>
        </Field>

        <Field id="dueDate" label="Due Date (optional)" attempt={attempt}>
          <input id="dueDate" type="date" value={form.dueDate} onChange={(e) => set("dueDate", e.target.value)} className={inputClass()} />
        </Field>
        <Field id="attachment" label="Attachment (optional)" attempt={attempt}>
          <label htmlFor="attachment" className="flex h-9 cursor-pointer items-center gap-2 rounded-lg border border-dashed border-input bg-background px-3 text-[12px] text-muted-foreground hover:border-primary/40 hover:text-foreground">
            <Paperclip className="h-3.5 w-3.5 shrink-0" /> {form.attachmentName ?? "Choose a file…"}
          </label>
          <input id="attachment" type="file" className="hidden" onChange={(e) => set("attachmentName", e.target.files?.[0]?.name)} />
        </Field>
      </div>

      <label className="flex items-center gap-2 text-[12px] text-muted-foreground">
        <input type="checkbox" checked={form.notifyRequester} onChange={(e) => set("notifyRequester", e.target.checked)} className="h-3.5 w-3.5 rounded border-input" />
        Notify requester once created
      </label>

      <div className="flex justify-end gap-2 border-t border-border/40 pt-4">
        {onCancel && <Button variant="outline" size="sm" className="h-9 text-[12px]" onClick={onCancel}>Cancel</Button>}
        <Button size="sm" className="h-9 gap-1.5 text-[12px]" onClick={handleSubmit}>
          <Send className="h-3.5 w-3.5" /> {submitLabel}
        </Button>
      </div>
    </div>
  );
}

export function CreateTicketModal({
  open, onOpenChange, onCreate, onOpenFullPage,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreate: (data: NewTicketFormData) => void;
  onOpenFullPage?: () => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between gap-3">
            <div>
              <DialogTitle>New Support Ticket</DialogTitle>
              <DialogDescription>Manually log a support request on behalf of a user.</DialogDescription>
            </div>
            {onOpenFullPage && (
              <Button variant="ghost" size="sm" className="h-7 shrink-0 text-[11.5px]" onClick={onOpenFullPage}>
                Open full page
              </Button>
            )}
          </div>
        </DialogHeader>
        <CreateTicketForm
          submitLabel="Create Ticket"
          onCancel={() => onOpenChange(false)}
          onCreate={(data) => { onCreate(data); onOpenChange(false); }}
        />
      </DialogContent>
    </Dialog>
  );
}
