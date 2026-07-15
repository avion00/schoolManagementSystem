import { Pencil } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Reveal, SlidingTabs } from "@/components/motion";
import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { PremiumCard } from "@/components/ui/PremiumCard";
import {
  achievements, certificates, createStudentHelpTicket, studentProfile,
} from "@/data/studentDashboardData";

const TABS = [
  { value: "personal", label: "Personal Info" },
  { value: "guardian", label: "Guardian Info" },
  { value: "academic", label: "Academic Info" },
  { value: "documents", label: "Documents" },
  { value: "activity", label: "Activity" },
];

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-0.5 text-[13.5px] text-foreground">{value}</p>
    </div>
  );
}

export function StudentProfile() {
  const [tab, setTab] = useState("personal");
  const [correctionOpen, setCorrectionOpen] = useState(false);
  const [note, setNote] = useState("");

  function submitCorrection() {
    if (!note.trim()) return;
    createStudentHelpTicket({ category: "Other", title: "Profile correction request", description: note.trim(), sentTo: "Admin Office" });
    toast.success("Correction request sent to Admin Office.");
    setCorrectionOpen(false);
    setNote("");
  }

  return (
    <div className="space-y-4">
      <Reveal>
        <PremiumCard className="flex flex-wrap items-center justify-between gap-3 p-5">
          <div className="flex items-center gap-4">
            <span className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-xl font-semibold text-primary">
              {studentProfile.name.split(" ").map((n) => n[0]).join("")}
            </span>
            <div>
              <p className="text-[16px] font-semibold text-foreground">{studentProfile.name}</p>
              <p className="text-[12.5px] text-muted-foreground">{studentProfile.className} {studentProfile.section} · Roll {studentProfile.roll} · {studentProfile.admissionNo}</p>
            </div>
          </div>
          <Button variant="outline" size="sm" className="h-8 gap-1.5 text-[12px]" onClick={() => setCorrectionOpen(true)}>
            <Pencil className="h-3.5 w-3.5" /> Request correction
          </Button>
        </PremiumCard>
      </Reveal>

      <Reveal delay={40} className="-mx-1 overflow-x-auto px-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <SlidingTabs value={tab} onValueChange={setTab} options={TABS} className="w-max" />
      </Reveal>

      <Reveal delay={80}>
        {tab === "personal" && (
          <PremiumCard className="grid gap-4 p-5 sm:grid-cols-2 lg:grid-cols-3">
            <Field label="Full name" value={studentProfile.name} />
            <Field label="Date of birth" value={studentProfile.dob} />
            <Field label="Blood group" value={studentProfile.bloodGroup} />
            <Field label="Email" value={studentProfile.email} />
            <Field label="Phone" value={studentProfile.phone} />
            <Field label="Address" value={studentProfile.address} />
            <Field label="House" value={studentProfile.house} />
            <Field label="Emergency contact" value={studentProfile.emergencyContact} />
          </PremiumCard>
        )}
        {tab === "guardian" && (
          <PremiumCard className="grid gap-4 p-5 sm:grid-cols-2 lg:grid-cols-3">
            <Field label="Guardian name" value={studentProfile.guardian} />
            <Field label="Guardian phone" value={studentProfile.guardianPhone} />
            <Field label="Guardian email" value={studentProfile.guardianEmail} />
          </PremiumCard>
        )}
        {tab === "academic" && (
          <PremiumCard className="grid gap-4 p-5 sm:grid-cols-2 lg:grid-cols-3">
            <Field label="Admission no" value={studentProfile.admissionNo} />
            <Field label="Registration no" value={studentProfile.registrationNo} />
            <Field label="Class / Section" value={`${studentProfile.className} ${studentProfile.section}`} />
            <Field label="Roll no" value={studentProfile.roll} />
            <Field label="Academic year" value={studentProfile.academicYear} />
            <Field label="Student type" value={studentProfile.studentType} />
            <Field label="Join date" value={studentProfile.joinDate} />
            <Field label="Status" value={studentProfile.status} />
          </PremiumCard>
        )}
        {tab === "documents" && (
          <PremiumCard className="p-5">
            <p className="mb-3 text-[12px] font-semibold uppercase tracking-wide text-muted-foreground">Certificates</p>
            <div className="space-y-2">
              {certificates.map((c) => (
                <div key={c.id} className="flex items-center justify-between rounded-xl border border-border/60 px-3 py-2 text-[12.5px]">
                  <span className="text-foreground">{c.title}</span>
                  <span className="text-muted-foreground">Issued {c.issuedOn}</span>
                </div>
              ))}
            </div>
          </PremiumCard>
        )}
        {tab === "activity" && (
          <PremiumCard className="p-5">
            <p className="mb-3 text-[12px] font-semibold uppercase tracking-wide text-muted-foreground">Achievements</p>
            <div className="space-y-2">
              {achievements.map((a) => (
                <div key={a.id} className="flex items-center justify-between rounded-xl border border-border/60 px-3 py-2 text-[12.5px]">
                  <span className="text-foreground">{a.title}</span>
                  <span className="text-muted-foreground">{a.category} · {a.date}</span>
                </div>
              ))}
            </div>
          </PremiumCard>
        )}
      </Reveal>

      <Dialog open={correctionOpen} onOpenChange={setCorrectionOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Request a correction</DialogTitle>
            <DialogDescription>Tell the admin office what needs to be fixed on your profile.</DialogDescription>
          </DialogHeader>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={4}
            placeholder="e.g. My blood group is listed incorrectly…"
            className="w-full resize-none rounded-xl border border-input bg-background px-3 py-2 text-[13px] text-foreground placeholder:text-muted-foreground/70 focus:outline-none focus:ring-1 focus:ring-ring"
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setCorrectionOpen(false)}>Cancel</Button>
            <Button onClick={submitCorrection} disabled={!note.trim()}>Send request</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
