import { useMemo, useState } from "react";
import { ClipboardList, Plus } from "lucide-react";
import { useSearchParams } from "react-router-dom";
import { toast } from "sonner";

import { Reveal } from "@/components/motion";
import { AssignmentCard, type AssignmentCardEntry } from "@/components/teacher/AssignmentCard";
import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { PremiumCard } from "@/components/ui/PremiumCard";
import { PremiumEmptyState } from "@/components/ui/PremiumEmptyState";
import { PremiumSelect } from "@/components/ui/PremiumSelect";
import { PremiumTabs } from "@/components/ui/PremiumTabs";
import { Switch } from "@/components/ui/switch";
import { assignedClasses, assignments, homeworkList } from "@/data/teacherDashboardData";

type Tab = "active" | "due-today" | "pending-review" | "completed" | "drafts";
const TODAY = "2026-07-13";
const TABS: { value: Tab; label: string }[] = [
  { value: "active", label: "Active" },
  { value: "due-today", label: "Due Today" },
  { value: "pending-review", label: "Pending Review" },
  { value: "completed", label: "Completed" },
  { value: "drafts", label: "Drafts" },
];

const SEED: AssignmentCardEntry[] = [
  ...homeworkList.map((h) => ({ ...h, kind: "Homework" as const })),
  ...assignments.map((a) => ({ ...a, kind: "Assignment" as const, maxMarks: a.maxMarks })),
];

function filterFor(tab: Tab, rows: AssignmentCardEntry[]): AssignmentCardEntry[] {
  switch (tab) {
    case "active": return rows.filter((r) => r.status === "Active");
    case "due-today": return rows.filter((r) => r.dueDate === TODAY);
    case "pending-review": return rows.filter((r) => r.submissionsReceived > 0 && r.submissionsReceived < r.totalStudents);
    case "completed": return rows.filter((r) => r.status === "Closed");
    case "drafts": return rows.filter((r) => r.status === "Draft");
  }
}

export function TeacherAssignments() {
  const [searchParams] = useSearchParams();
  const presetClass = searchParams.get("class");
  const [rows, setRows] = useState<AssignmentCardEntry[]>(SEED);
  const [tab, setTab] = useState<Tab>("active");
  const [open, setOpen] = useState(false);

  const [title, setTitle] = useState("");
  const [classId, setClassId] = useState(presetClass ?? assignedClasses[0].id);
  const [instructions, setInstructions] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [maxMarks, setMaxMarks] = useState("");
  const [notifyStudents, setNotifyStudents] = useState(true);
  const [notifyParents, setNotifyParents] = useState(false);

  const scoped = useMemo(() => (presetClass ? rows.filter((r) => r.classId === presetClass) : rows), [rows, presetClass]);
  const filtered = useMemo(() => filterFor(tab, scoped), [tab, scoped]);

  function resetForm() {
    setTitle("");
    setInstructions("");
    setDueDate("");
    setMaxMarks("");
  }

  function createEntry(status: "Active" | "Draft") {
    const cls = assignedClasses.find((c) => c.id === classId)!;
    const entry: AssignmentCardEntry = {
      id: `asg-${Date.now()}`,
      title: title || "Untitled assignment",
      classId: cls.id,
      className: cls.className,
      section: cls.section,
      subject: cls.subject,
      dueDate: dueDate || "—",
      submissionsReceived: 0,
      totalStudents: cls.students,
      status,
      kind: "Assignment",
      maxMarks: maxMarks ? Number(maxMarks) : undefined,
    };
    setRows((r) => [entry, ...r]);
    setOpen(false);
    resetForm();
    if (status === "Draft") {
      toast.success("Saved as draft");
    } else {
      toast.success(`Assignment created${notifyStudents ? " — students notified" : ""}${notifyParents ? " — parents notified" : ""}`);
    }
  }

  return (
    <div className="space-y-4">
      <Reveal className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-semibold tracking-tight text-foreground">Homework &amp; Assignments</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">One place for daily homework and formal assignments.</p>
        </div>
        <Button size="sm" className="gap-1.5" onClick={() => setOpen(true)}>
          <Plus className="h-4 w-4" /> Create Assignment
        </Button>
      </Reveal>

      <Reveal delay={60}>
        <PremiumTabs value={tab} onValueChange={(v) => setTab(v as Tab)} options={TABS} />
      </Reveal>

      {filtered.length === 0 ? (
        <PremiumCard><PremiumEmptyState icon={ClipboardList} title="Nothing in this view" action={<Button size="sm" onClick={() => setOpen(true)}>Create assignment</Button>} /></PremiumCard>
      ) : (
        <Reveal delay={100} className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((entry, i) => <AssignmentCard key={entry.id} entry={entry} index={i} />)}
        </Reveal>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create assignment</DialogTitle>
            <DialogDescription>Works for both quick homework and formal, gradable assignments.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <FormField label="Title" required>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Algebra Worksheet — Linear Equations" />
            </FormField>
            <div className="grid grid-cols-2 gap-4">
              <FormField label="Class">
                <PremiumSelect value={classId} onChange={setClassId} options={assignedClasses.map((c) => ({ value: c.id, label: `${c.className} · ${c.section} — ${c.subject}` }))} />
              </FormField>
              <FormField label="Marks (optional)">
                <Input type="number" value={maxMarks} onChange={(e) => setMaxMarks(e.target.value)} placeholder="e.g. 20" />
              </FormField>
            </div>
            <FormField label="Instructions">
              <textarea
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                rows={3}
                className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="What should students do?"
              />
            </FormField>
            <FormField label="Due date">
              <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className="h-10 w-full rounded-xl border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
            </FormField>
            <FormField label="Attachments">
              <div className="rounded-xl border border-dashed border-border/60 p-5 text-center text-[12px] text-muted-foreground">
                Drop a file here or click to browse (demo — files aren't actually stored)
              </div>
            </FormField>
            <div className="flex items-center justify-between rounded-xl border border-border/50 p-3">
              <p className="text-[13px] font-medium text-foreground">Notify students</p>
              <Switch checked={notifyStudents} onCheckedChange={setNotifyStudents} aria-label="Notify students" />
            </div>
            <div className="flex items-center justify-between rounded-xl border border-border/50 p-3">
              <p className="text-[13px] font-medium text-foreground">Notify parents</p>
              <Switch checked={notifyParents} onCheckedChange={setNotifyParents} aria-label="Notify parents" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => createEntry("Draft")} disabled={!title}>Save as draft</Button>
            <Button onClick={() => createEntry("Active")} disabled={!title}>Create assignment</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
