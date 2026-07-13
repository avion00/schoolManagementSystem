import { useState } from "react";
import { NotebookPen, Plus } from "lucide-react";
import { toast } from "sonner";

import { Reveal } from "@/components/motion";
import { LessonPlanCalendar } from "@/components/teacher/LessonPlanCalendar";
import { ProgressChartCard } from "@/components/teacher/ProgressChartCard";
import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { PremiumCard } from "@/components/ui/PremiumCard";
import { PremiumEmptyState } from "@/components/ui/PremiumEmptyState";
import { PremiumSelect } from "@/components/ui/PremiumSelect";
import {
  assignedClasses,
  lessonPlans as SEED_LESSON_PLANS,
  subjects,
  type LessonPlan,
} from "@/data/teacherDashboardData";

export function TeacherLessonPlans() {
  const [rows, setRows] = useState<LessonPlan[]>(SEED_LESSON_PLANS);
  const [open, setOpen] = useState(false);
  const [classId, setClassId] = useState(assignedClasses[0].id);
  const [week, setWeek] = useState("");
  const [topic, setTopic] = useState("");

  function createPlan() {
    const cls = assignedClasses.find((c) => c.id === classId)!;
    const plan: LessonPlan = {
      id: `lp-${Date.now()}`,
      classId: cls.id,
      className: cls.className,
      section: cls.section,
      subject: cls.subject,
      week: week || "This week",
      topic: topic || "Untitled topic",
      objectives: [],
      materials: [],
      homework: "",
      status: "Draft",
      principalReview: "Pending",
    };
    setRows((r) => [plan, ...r]);
    setOpen(false);
    setWeek("");
    setTopic("");
    toast.success("Lesson plan saved as draft");
  }

  function markCompleted(id: string) {
    setRows((r) => r.map((p) => (p.id === id ? { ...p, status: "Reviewed" } : p)));
    toast.success("Lesson marked completed");
  }

  function duplicateLastWeek(plan: LessonPlan) {
    setRows((r) => [{ ...plan, id: `lp-${Date.now()}`, week: "This week", status: "Draft", principalReview: "Pending" }, ...r]);
    toast.success(`Duplicated "${plan.topic}" for this week`);
  }

  function submitForReview(id: string) {
    setRows((r) => r.map((p) => (p.id === id ? { ...p, status: "Submitted" } : p)));
    toast.success("Submitted for principal review");
  }

  return (
    <div className="space-y-4">
      <Reveal className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-semibold tracking-tight text-foreground">Lesson Plans</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">Weekly lesson plans for your assigned classes.</p>
        </div>
        <Button size="sm" className="gap-1.5" onClick={() => setOpen(true)}>
          <Plus className="h-4 w-4" /> Add lesson
        </Button>
      </Reveal>

      <Reveal delay={40}>
        <ProgressChartCard
          title="Syllabus Progress"
          icon={NotebookPen}
          rows={subjects.map((s) => ({ label: s.name, value: Math.round((s.completedTopics / s.totalTopics) * 100), sublabel: `${s.completedTopics}/${s.totalTopics} topics` }))}
        />
      </Reveal>

      {rows.length === 0 ? (
        <PremiumCard><PremiumEmptyState icon={NotebookPen} title="No lesson plans yet" /></PremiumCard>
      ) : (
        <Reveal delay={80}>
          <LessonPlanCalendar
            plans={rows}
            onMarkCompleted={markCompleted}
            onDuplicate={duplicateLastWeek}
            onSubmitForReview={submitForReview}
          />
        </Reveal>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New lesson plan</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <FormField label="Class">
              <PremiumSelect value={classId} onChange={setClassId} options={assignedClasses.map((c) => ({ value: c.id, label: `${c.className} · ${c.section} — ${c.subject}` }))} />
            </FormField>
            <FormField label="Week">
              <Input value={week} onChange={(e) => setWeek(e.target.value)} placeholder="e.g. Jul 21 – Jul 25" />
            </FormField>
            <FormField label="Topic" required>
              <Input value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="e.g. Trigonometric Ratios" />
            </FormField>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={createPlan} disabled={!topic}>Save as draft</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
