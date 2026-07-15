import { Paperclip } from "lucide-react";

import { PremiumBadge, type PremiumBadgeTone } from "@/components/ui/PremiumBadge";
import { PremiumCard } from "@/components/ui/PremiumCard";
import { Button } from "@/components/ui/button";
import { findSubmission, type HomeworkAssignment } from "@/data/studentDashboardData";

const STATUS_TONE: Record<HomeworkAssignment["status"], PremiumBadgeTone> = {
  "To Do": "info", Submitted: "purple", Graded: "success", Missing: "danger",
};

export function StudentAssignmentCard({ assignment, onView }: { assignment: HomeworkAssignment; onView: () => void }) {
  const submission = findSubmission(assignment.id);

  return (
    <PremiumCard className="p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-1.5">
            <PremiumBadge label={assignment.status} tone={STATUS_TONE[assignment.status]} />
            <span className="text-[11px] text-muted-foreground">{assignment.subject}</span>
          </div>
          <button type="button" onClick={onView} className="mt-1 block truncate text-left text-[13.5px] font-medium text-foreground hover:underline">
            {assignment.title}
          </button>
          <p className="mt-0.5 truncate text-[11.5px] text-muted-foreground">{assignment.teacher} · {assignment.className}</p>
        </div>
        <div className="shrink-0 text-right text-[11.5px] text-muted-foreground">
          <p>Due {assignment.dueDate}</p>
          <p>{assignment.marks} marks</p>
        </div>
      </div>

      {assignment.attachments.length > 0 && (
        <p className="mt-2 flex items-center gap-1 text-[11px] text-muted-foreground">
          <Paperclip className="h-3 w-3" /> {assignment.attachments.length} attachment{assignment.attachments.length > 1 ? "s" : ""}
        </p>
      )}

      {submission?.grade != null && (
        <p className="mt-2 rounded-lg bg-emerald-50 px-2.5 py-1.5 text-[12px] text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300">
          Grade: {submission.grade}/{assignment.marks} — {submission.feedback}
        </p>
      )}

      <div className="mt-3 flex flex-wrap gap-2 border-t border-border/60 pt-3">
        <Button size="sm" variant="outline" className="h-8 text-[12px]" onClick={onView}>View</Button>
        {(assignment.status === "To Do" || assignment.status === "Missing") && (
          <Button size="sm" className="h-8 text-[12px]" onClick={onView}>Submit</Button>
        )}
        {assignment.status === "Submitted" && (
          <Button size="sm" variant="outline" className="h-8 text-[12px]" onClick={onView}>Resubmit</Button>
        )}
      </div>
    </PremiumCard>
  );
}
