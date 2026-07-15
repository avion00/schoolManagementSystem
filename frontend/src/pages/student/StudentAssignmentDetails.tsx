import { ArrowLeft, Paperclip } from "lucide-react";
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { SuccessCheck } from "@/components/motion";
import { Button } from "@/components/ui/button";
import { PremiumBadge, type PremiumBadgeTone } from "@/components/ui/PremiumBadge";
import { PremiumCard } from "@/components/ui/PremiumCard";
import {
  findAssignment, findSubmission, submitAssignment, type AssignmentStatus,
} from "@/data/studentDashboardData";

const STATUS_TONE: Record<AssignmentStatus, PremiumBadgeTone> = {
  "To Do": "info", Submitted: "purple", Graded: "success", Missing: "danger",
};

export function StudentAssignmentDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [, setTick] = useState(0);
  const [textAnswer, setTextAnswer] = useState("");
  const [fileName, setFileName] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const assignment = id ? findAssignment(id) : undefined;
  const submission = id ? findSubmission(id) : undefined;

  if (!assignment) {
    return (
      <PremiumCard className="flex flex-col items-center gap-2 p-10 text-center">
        <p className="text-[13.5px] font-medium text-foreground">Assignment not found</p>
        <Button variant="outline" onClick={() => navigate("/student/assignments")}>Back to Assignments</Button>
      </PremiumCard>
    );
  }

  function handleSubmit() {
    if (!textAnswer.trim() && !fileName) return;
    submitAssignment(assignment!.id, { textAnswer: textAnswer.trim() || undefined, fileName: fileName ?? undefined });
    setSubmitted(true);
    setTick((n) => n + 1);
    window.setTimeout(() => navigate("/student/assignments"), 1100);
  }

  return (
    <div className="space-y-4">
      <Button variant="ghost" size="sm" className="h-8 gap-1.5 px-2 text-[12.5px]" onClick={() => navigate("/student/assignments")}>
        <ArrowLeft className="h-3.5 w-3.5" /> Back to Assignments
      </Button>

      <PremiumCard className="p-5">
        <div className="flex flex-wrap items-center gap-1.5">
          <PremiumBadge label={assignment.status} tone={STATUS_TONE[assignment.status]} />
          <PremiumBadge label={`${assignment.marks} marks`} tone="neutral" />
        </div>
        <h1 className="mt-1.5 text-[16px] font-semibold text-foreground">{assignment.title}</h1>
        <p className="mt-1 text-[13px] text-muted-foreground">{assignment.subject} · {assignment.teacher} · {assignment.className}</p>
        <p className="mt-2 text-[13px] text-foreground">{assignment.instructions}</p>

        <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1 border-t border-border/60 pt-3 text-[12px] text-muted-foreground">
          <span>Due: <span className="text-foreground">{assignment.dueDate}</span></span>
          <span>Marks: <span className="text-foreground">{assignment.marks}</span></span>
        </div>

        {assignment.attachments.length > 0 && (
          <div className="mt-3 space-y-1.5 border-t border-border/60 pt-3">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Attached files</p>
            {assignment.attachments.map((a) => (
              <p key={a.id} className="flex items-center gap-1.5 text-[12.5px] text-foreground"><Paperclip className="h-3.5 w-3.5 text-muted-foreground" /> {a.name}</p>
            ))}
          </div>
        )}
      </PremiumCard>

      {submission?.grade != null ? (
        <PremiumCard className="p-5">
          <p className="text-[13px] font-semibold text-foreground">Teacher feedback</p>
          <p className="mt-2 text-[24px] font-semibold text-emerald-600 dark:text-emerald-400">{submission.grade}/{assignment.marks}</p>
          <p className="mt-1 text-[13px] text-muted-foreground">{submission.feedback}</p>
        </PremiumCard>
      ) : (
        <PremiumCard className="p-5">
          {submitted ? (
            <div className="flex flex-col items-center gap-1 py-6">
              <SuccessCheck label="Submitted" />
              <p className="text-[12.5px] text-muted-foreground">Moving to your Submitted tab…</p>
            </div>
          ) : (
            <>
              <p className="mb-3 text-[13px] font-semibold text-foreground">{assignment.status === "Submitted" ? "Resubmit your work" : "Submit your work"}</p>
              <textarea
                value={textAnswer}
                onChange={(e) => setTextAnswer(e.target.value)}
                rows={5}
                placeholder="Type your answer here…"
                className="w-full resize-none rounded-xl border border-input bg-background px-3 py-2.5 text-[13px] text-foreground placeholder:text-muted-foreground/70 focus:outline-none focus:ring-1 focus:ring-ring"
              />
              <label className="mt-3 flex h-9 w-full cursor-pointer items-center gap-2 rounded-xl border border-dashed border-input px-3 text-[12.5px] text-muted-foreground hover:bg-accent/40">
                <Paperclip className="h-3.5 w-3.5 shrink-0" />
                {fileName ?? "Attach a file (optional)"}
                <input type="file" className="hidden" onChange={(e) => setFileName(e.target.files?.[0]?.name ?? null)} />
              </label>
              <Button className="mt-3 w-full" onClick={handleSubmit} disabled={!textAnswer.trim() && !fileName}>
                {assignment.status === "Submitted" ? "Resubmit" : "Submit"}
              </Button>
            </>
          )}
        </PremiumCard>
      )}
    </div>
  );
}
