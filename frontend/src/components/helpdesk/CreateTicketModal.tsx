import { useEffect, useRef, useState, type ReactNode } from "react";
import { Paperclip, Send } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { PremiumSelect } from "@/components/ui/PremiumSelect";
import { CATEGORY_VALUE, PRIORITY_VALUE, SOURCE_VALUE, useAgents, useCreateTicket, useTicketActions } from "@/api/helpdesk";
import { uploadFile } from "@/api/files";
import { errorMessage } from "@/api/http";
import {
  CATEGORY_OPTIONS, MODULE_OPTIONS, PRIORITY_OPTIONS, SOURCE_OPTIONS,
  type TicketCategory, type TicketPriority, type TicketSource,
} from "@/api/types/helpdesk";
import type { ChatUser } from "@/api/types/messages";
import { messagesService } from "@/lib/messagesService";
import { useAuth } from "@/lib/auth";
import { cn } from "@/lib/utils";

interface FormData {
  requesterId: string;     // "" = myself
  source: TicketSource;
  category: TicketCategory | "";
  module: string;
  subject: string;
  description: string;
  priority: TicketPriority;
  assignTo: string;        // agent id
  file?: File;
}

function emptyForm(): FormData {
  return {
    requesterId: "", source: "Web Portal", category: "", module: "Dashboard", subject: "", description: "",
    priority: "Normal", assignTo: "",
  };
}

type Errors = Partial<Record<keyof FormData, string>>;

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

/** Logs a ticket — for yourself, or (help desk staff) on behalf of someone who called or walked in. */
export function CreateTicketForm({
  onCreated,
  onCancel,
  submitLabel = "Create Ticket",
}: {
  onCreated: (ticketId: string) => void;
  onCancel?: () => void;
  submitLabel?: string;
}) {
  const { hasPermission } = useAuth();
  const isAgent = hasPermission("helpdesk.manage");
  const agents = useAgents(isAgent).data ?? [];
  const create = useCreateTicket();
  const { assign } = useTicketActions();
  const [form, setForm] = useState<FormData>(emptyForm());
  const [errors, setErrors] = useState<Errors>({});
  const [attempt, setAttempt] = useState(0);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [people, setPeople] = useState<ChatUser[]>([]);

  useEffect(() => {
    if (!isAgent || search.trim().length < 2) { setPeople([]); return; }
    const t = setTimeout(() => { messagesService.searchContacts(search.trim()).then(setPeople).catch(() => setPeople([])); }, 250);
    return () => clearTimeout(t);
  }, [search, isAgent]);

  function set<K extends keyof FormData>(key: K, value: FormData[K]) {
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((e) => ({ ...e, [key]: undefined }));
  }

  async function handleSubmit() {
    const e: Errors = {};
    if (!form.category) e.category = "Category is required.";
    if (!form.subject.trim()) e.subject = "Subject is required.";
    if (!form.description.trim()) e.description = "Description is required.";
    setErrors(e);
    setAttempt((n) => n + 1);
    const firstKey = Object.keys(e)[0];
    if (firstKey) {
      document.querySelector(`[data-field="${firstKey}"]`)?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    setSaving(true);
    try {
      const attachment = form.file ? await uploadFile(form.file) : null;
      const ticket = await create.mutateAsync({
        category: CATEGORY_VALUE[form.category as TicketCategory], module: form.module, subject: form.subject.trim(),
        description: form.description.trim(), priority: PRIORITY_VALUE[form.priority],
        source: isAgent ? SOURCE_VALUE[form.source] : undefined,
        attachment_ids: attachment ? [attachment.id] : [],
        ...(isAgent && form.requesterId ? { requester: form.requesterId } : {}),
      } as Parameters<typeof create.mutateAsync>[0]);
      if (form.assignTo) await assign.mutateAsync({ id: ticket.id, user: form.assignTo });
      toast.success(`${ticket.code} created.`);
      onCreated(ticket.id);
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  const chosen = people.find((p) => p.id === form.requesterId);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {isAgent && (<>
          <div className="sm:col-span-2">
            <Field id="requesterId" label="Requester" attempt={attempt}>
              <input value={search} onChange={(e) => { setSearch(e.target.value); set("requesterId", ""); }}
                placeholder="Search by name or email — leave empty to log it as yourself" className={inputClass()} />
              {people.length > 0 && !form.requesterId && (
                <div className="max-h-40 overflow-y-auto rounded-lg border border-border/60 p-1">
                  {people.map((p) => (
                    <button key={p.id} type="button" onClick={() => { set("requesterId", p.id); setSearch(`${p.name} (${p.role})`); }}
                      className="flex w-full justify-between rounded-md px-2 py-1.5 text-left text-[12px] hover:bg-muted">
                      <span>{p.name}</span><span className="text-muted-foreground">{p.role}</span>
                    </button>
                  ))}
                </div>
              )}
              {chosen && <p className="text-[11px] text-muted-foreground">Logging on behalf of {chosen.name}.</p>}
            </Field>
          </div>
          <Field id="source" label="Received Via" attempt={attempt}>
            <PremiumSelect value={form.source} onChange={(v) => set("source", v as TicketSource)}
              options={SOURCE_OPTIONS.map((o) => ({ value: o, label: o }))} />
          </Field>
          <Field id="assignTo" label="Assign To (optional)" attempt={attempt}>
            <PremiumSelect value={form.assignTo} onChange={(v) => set("assignTo", v)} placeholder="Unassigned"
              options={[{ value: "", label: "Unassigned" }, ...agents.map((a) => ({ value: a.id, label: a.name }))]} />
          </Field>
        </>)}

        <Field id="category" label="Category" required error={errors.category} attempt={attempt}>
          <PremiumSelect
            value={form.category}
            onChange={(v) => set("category", v as TicketCategory)}
            placeholder="Select category"
            options={CATEGORY_OPTIONS.map((c) => ({ value: c, label: c }))}
          />
        </Field>
        <Field id="module" label="Module" attempt={attempt}>
          <PremiumSelect
            value={form.module}
            onChange={(v) => set("module", v)}
            options={MODULE_OPTIONS.map((m) => ({ value: m, label: m }))}
          />
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

        <Field id="priority" label="Priority" attempt={attempt}>
          <PremiumSelect
            value={form.priority}
            onChange={(v) => set("priority", v as TicketPriority)}
            options={PRIORITY_OPTIONS.map((p) => ({ value: p, label: p }))}
          />
        </Field>
        <Field id="attachment" label="Attachment (optional)" attempt={attempt}>
          <label htmlFor="attachment" className="flex h-9 cursor-pointer items-center gap-2 rounded-lg border border-dashed border-input bg-background px-3 text-[12px] text-muted-foreground hover:border-primary/40 hover:text-foreground">
            <Paperclip className="h-3.5 w-3.5 shrink-0" /> {form.file?.name ?? "Choose a file…"}
          </label>
          <input id="attachment" type="file" className="hidden" onChange={(e) => set("file", e.target.files?.[0])} />
        </Field>
      </div>

      <p className="text-[11px] text-muted-foreground">The requester is notified about replies and status changes in their notifications.</p>

      <div className="flex justify-end gap-2 border-t border-border/40 pt-4">
        {onCancel && <Button variant="outline" size="sm" className="h-9 text-[12px]" onClick={onCancel}>Cancel</Button>}
        <Button size="sm" className="h-9 gap-1.5 text-[12px]" disabled={saving} onClick={handleSubmit}>
          <Send className="h-3.5 w-3.5" /> {saving ? "Creating…" : submitLabel}
        </Button>
      </div>
    </div>
  );
}

export function CreateTicketModal({
  open, onOpenChange, onCreated, onOpenFullPage,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: (ticketId: string) => void;
  onOpenFullPage?: () => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between gap-3">
            <div>
              <DialogTitle>New Support Ticket</DialogTitle>
              <DialogDescription>Log a support request, for yourself or on behalf of someone who called or came in.</DialogDescription>
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
          onCreated={(id) => { onCreated(id); onOpenChange(false); }}
        />
      </DialogContent>
    </Dialog>
  );
}
