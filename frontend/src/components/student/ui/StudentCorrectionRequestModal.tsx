import { useState } from "react";

import { SuccessCheck } from "@/components/motion";
import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PremiumSelect } from "@/components/ui/PremiumSelect";

const SECTIONS = ["Personal Info", "Guardian Info", "Academic Info", "Documents", "Other"];
const FIELDS_BY_SECTION: Record<string, string[]> = {
  "Personal Info": ["Full Name", "Date of Birth", "Blood Group", "Phone", "Address"],
  "Guardian Info": ["Guardian Name", "Guardian Phone", "Guardian Email"],
  "Academic Info": ["Class / Section", "Roll No", "House"],
  "Documents": ["Birth Certificate", "Guardian ID", "Medical Record"],
  "Other": ["Other"],
};

export interface CorrectionRequestPayload {
  section: string;
  field: string;
  currentValue: string;
  correctValue: string;
  reason: string;
}

/** Premium "request a correction" modal — section/field selects, current vs. correct value, reason, and a success-check confirmation. */
export function StudentCorrectionRequestModal({
  open,
  onOpenChange,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (payload: CorrectionRequestPayload) => void;
}) {
  const [section, setSection] = useState(SECTIONS[0]);
  const [field, setField] = useState(FIELDS_BY_SECTION[SECTIONS[0]][0]);
  const [currentValue, setCurrentValue] = useState("");
  const [correctValue, setCorrectValue] = useState("");
  const [reason, setReason] = useState("");
  const [submitted, setSubmitted] = useState(false);

  function reset() {
    setSection(SECTIONS[0]);
    setField(FIELDS_BY_SECTION[SECTIONS[0]][0]);
    setCurrentValue("");
    setCorrectValue("");
    setReason("");
    setSubmitted(false);
  }

  function handleOpenChange(next: boolean) {
    if (!next) reset();
    onOpenChange(next);
  }

  function handleSubmit() {
    onSubmit({ section, field, currentValue, correctValue, reason });
    setSubmitted(true);
    window.setTimeout(() => handleOpenChange(false), 1300);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        {submitted ? (
          <div className="flex flex-col items-center gap-3 py-6">
            <SuccessCheck label="Request submitted" />
            <p className="text-center text-[13px] text-muted-foreground">
              Correction request submitted for admin review.
            </p>
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>Request Profile Correction</DialogTitle>
              <DialogDescription>Tell the admin office what needs to be fixed — they'll review and update it.</DialogDescription>
            </DialogHeader>

            <div className="space-y-3.5">
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label>Section</Label>
                  <PremiumSelect
                    value={section}
                    onChange={(v) => { setSection(v); setField(FIELDS_BY_SECTION[v][0]); }}
                    options={SECTIONS.map((s) => ({ value: s, label: s }))}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Field</Label>
                  <PremiumSelect
                    value={field}
                    onChange={setField}
                    options={FIELDS_BY_SECTION[section].map((f) => ({ value: f, label: f }))}
                  />
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label>Current value</Label>
                  <Input value={currentValue} onChange={(e) => setCurrentValue(e.target.value)} placeholder="What's shown now" />
                </div>
                <div className="space-y-1.5">
                  <Label>Correct value</Label>
                  <Input value={correctValue} onChange={(e) => setCorrectValue(e.target.value)} placeholder="What it should be" />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label>Reason / note</Label>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  rows={3}
                  placeholder="e.g. My blood group is listed incorrectly…"
                  className="w-full resize-none rounded-xl border border-input bg-background px-3 py-2 text-[13px] text-foreground placeholder:text-muted-foreground/70 focus:outline-none focus:ring-1 focus:ring-ring"
                />
              </div>

              <div className="space-y-1.5">
                <Label>Attachment (optional)</Label>
                <button
                  type="button"
                  className="w-full rounded-xl border border-dashed border-border/70 px-3 py-3 text-center text-[12.5px] text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
                >
                  Click to attach a supporting file
                </button>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => handleOpenChange(false)}>Cancel</Button>
              <Button onClick={handleSubmit} disabled={!reason.trim()}>Submit Request</Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
