import { Copy, Eye, MessageSquare, MoreHorizontal, Pencil, Send } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

import { PremiumBadge } from "@/components/ui/PremiumBadge";
import { PremiumCard } from "@/components/ui/PremiumCard";
import { PremiumDropdownMenu } from "@/components/ui/PremiumDropdownMenu";

export interface AssignmentCardEntry {
  id: string;
  title: string;
  classId: string;
  className: string;
  section: string;
  subject: string;
  dueDate: string;
  submissionsReceived: number;
  totalStudents: number;
  status: "Active" | "Closed" | "Draft";
  kind: "Homework" | "Assignment";
  maxMarks?: number;
}

/** One homework/assignment card — same shape for both, since teachers treat them as one workflow. */
export function AssignmentCard({ entry, index }: { entry: AssignmentCardEntry; index: number }) {
  const navigate = useNavigate();
  const pending = entry.totalStudents - entry.submissionsReceived;
  const pct = entry.totalStudents ? Math.round((entry.submissionsReceived / entry.totalStudents) * 100) : 0;

  return (
    <PremiumCard hoverable className="t-row-in flex flex-col gap-3 p-4" style={{ "--row-index": index } as React.CSSProperties}>
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <button type="button" className="truncate text-left text-[13.5px] font-medium text-foreground hover:underline" onClick={() => navigate(`/teacher/assignments/${entry.id}`)}>
            {entry.title}
          </button>
          <p className="text-[11.5px] text-muted-foreground">{entry.className}-{entry.section} · {entry.subject}{entry.maxMarks ? ` · /${entry.maxMarks}` : ""}</p>
        </div>
        <div className="flex shrink-0 items-center gap-1.5">
          <PremiumBadge label={entry.kind} tone="purple" />
          <PremiumBadge label={entry.status} tone={entry.status === "Active" ? "success" : entry.status === "Draft" ? "neutral" : "info"} />
        </div>
      </div>

      <div>
        <div className="mb-1 flex items-center justify-between text-[11.5px]">
          <span className="text-muted-foreground">Submitted {entry.submissionsReceived}/{entry.totalStudents}</span>
          <span className="text-muted-foreground">Due {entry.dueDate}</span>
        </div>
        <div className="h-1.5 overflow-hidden rounded-full bg-muted/60">
          <div className="h-full rounded-full bg-primary transition-all duration-500" style={{ width: `${pct}%` }} />
        </div>
      </div>

      <div className="flex items-center justify-between border-t border-border/60 pt-3">
        <span className="text-[11.5px] text-amber-600 dark:text-amber-400">{pending > 0 ? `${pending} pending` : "All submitted"}</span>
        <PremiumDropdownMenu
          align="end"
          trigger={<button type="button" aria-label="Assignment actions" className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:bg-accent/70 hover:text-foreground"><MoreHorizontal className="h-4 w-4" /></button>}
          items={[
            { label: "View", icon: Eye, onClick: () => navigate(`/teacher/assignments/${entry.id}`) },
            { label: "Review submissions", icon: Send, onClick: () => navigate(`/teacher/assignments/${entry.id}`) },
            { label: "Send reminder", icon: MessageSquare, onClick: () => toast.info(`Reminder sent for "${entry.title}"`) },
            { label: "Edit", icon: Pencil, onClick: () => toast.info("Editing — coming soon") },
            { label: "Duplicate", icon: Copy, onClick: () => toast.success(`Duplicated "${entry.title}"`) },
          ]}
        />
      </div>
    </PremiumCard>
  );
}
