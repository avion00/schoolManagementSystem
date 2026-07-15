import { Paperclip } from "lucide-react";
import { useEffect, useState } from "react";

import { SuccessCheck } from "@/components/motion";
import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { PremiumSelect } from "@/components/ui/PremiumSelect";
import { assignedClasses, assignedStudents } from "@/data/teacherDashboardData";
import {
  createHelpRequest, HELP_PRIORITIES, HELP_REQUEST_TYPES, SEND_TO_OPTIONS,
  type HelpPriority, type HelpRequestType, type SendToOption,
} from "@/data/teacherHelpData";

export function CreateHelpRequestModal({
  open,
  onOpenChange,
  defaultCategory,
  defaultSendTo,
  defaultTitle,
  onCreated,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultCategory?: HelpRequestType;
  defaultSendTo?: SendToOption;
  defaultTitle?: string;
  onCreated: () => void;
}) {
  const [category, setCategory] = useState<HelpRequestType>(defaultCategory ?? "Other");
  const [priority, setPriority] = useState<HelpPriority>("Normal");
  const [sendTo, setSendTo] = useState<SendToOption>(defaultSendTo ?? "Admin Office");
  const [relatedClass, setRelatedClass] = useState("");
  const [relatedStudent, setRelatedStudent] = useState("");
  const [title, setTitle] = useState(defaultTitle ?? "");
  const [description, setDescription] = useState("");
  const [attachmentName, setAttachmentName] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    if (!open) return;
    setCategory(defaultCategory ?? "Other");
    setSendTo(defaultSendTo ?? "Admin Office");
    setTitle(defaultTitle ?? "");
    setPriority("Normal");
    setRelatedClass("");
    setRelatedStudent("");
    setDescription("");
    setAttachmentName(null);
    setShowSuccess(false);
  }, [open, defaultCategory, defaultSendTo, defaultTitle]);

  function handleSubmit() {
    if (!description.trim()) return;
    createHelpRequest({
      category, priority, sendTo,
      title: title.trim() || category,
      description: description.trim(),
      relatedClass: relatedClass || null,
      relatedStudent: relatedStudent || null,
    });
    setShowSuccess(true);
    onCreated();
    window.setTimeout(() => onOpenChange(false), 900);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        {showSuccess ? (
          <div className="flex flex-col items-center gap-1 py-6">
            <SuccessCheck label="Request submitted" />
            <p className="text-[12.5px] text-muted-foreground">You can track it under My Requests.</p>
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>Create help request</DialogTitle>
              <DialogDescription>Tell us what's going on — we'll route it to the right team.</DialogDescription>
            </DialogHeader>

            <div className="max-h-[65vh] space-y-4 overflow-y-auto pr-1">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1.5 block text-[12px] font-medium text-foreground">Request type</label>
                  <PremiumSelect value={category} onChange={(v) => setCategory(v as HelpRequestType)} options={HELP_REQUEST_TYPES.map((t) => ({ value: t, label: t }))} />
                </div>
                <div>
                  <label className="mb-1.5 block text-[12px] font-medium text-foreground">Priority</label>
                  <PremiumSelect value={priority} onChange={(v) => setPriority(v as HelpPriority)} options={HELP_PRIORITIES.map((p) => ({ value: p, label: p }))} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1.5 block text-[12px] font-medium text-foreground">Related class</label>
                  <PremiumSelect
                    value={relatedClass}
                    onChange={setRelatedClass}
                    placeholder="None"
                    options={assignedClasses.map((c) => ({ value: `${c.className}-${c.section}`, label: `${c.className}-${c.section}` }))}
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-[12px] font-medium text-foreground">Related student (optional)</label>
                  <PremiumSelect
                    value={relatedStudent}
                    onChange={setRelatedStudent}
                    placeholder="None"
                    options={assignedStudents.map((s) => ({ value: s.name, label: `${s.name} (${s.className}-${s.section})` }))}
                  />
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-[12px] font-medium text-foreground">Subject / title</label>
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Short summary of the issue"
                  className="h-9 w-full rounded-xl border border-input bg-background px-3 text-[13px] text-foreground placeholder:text-muted-foreground/70 focus:outline-none focus:ring-1 focus:ring-ring"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-[12px] font-medium text-foreground">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  placeholder="Describe the problem…"
                  className="w-full resize-none rounded-xl border border-input bg-background px-3 py-2 text-[13px] text-foreground placeholder:text-muted-foreground/70 focus:outline-none focus:ring-1 focus:ring-ring"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-[12px] font-medium text-foreground">Attachment</label>
                <label className="flex h-9 w-full cursor-pointer items-center gap-2 rounded-xl border border-dashed border-input px-3 text-[12.5px] text-muted-foreground hover:bg-accent/40">
                  <Paperclip className="h-3.5 w-3.5 shrink-0" />
                  {attachmentName ?? "Attach a file (optional)"}
                  <input type="file" className="hidden" onChange={(e) => setAttachmentName(e.target.files?.[0]?.name ?? null)} />
                </label>
              </div>

              <div>
                <label className="mb-1.5 block text-[12px] font-medium text-foreground">Send to</label>
                <PremiumSelect value={sendTo} onChange={(v) => setSendTo(v as SendToOption)} options={SEND_TO_OPTIONS.map((s) => ({ value: s, label: s }))} />
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
              <Button onClick={handleSubmit} disabled={!description.trim()}>Submit</Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
