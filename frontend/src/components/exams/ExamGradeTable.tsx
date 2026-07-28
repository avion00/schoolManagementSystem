import { useNavigate } from "react-router-dom";
import { Award } from "lucide-react";
import { toast } from "sonner";

import { PremiumBadge } from "@/components/ui/PremiumBadge";
import { PremiumDataTable, type PremiumDataTableColumn } from "@/components/ui/PremiumDataTable";
import { RowActionMenu } from "@/components/ui/RowActionMenu";
import { GradeBadge } from "@/components/exams/GradeBadge";
import type { GradeScale } from "@/data/examsData";
import { cn } from "@/lib/utils";

const COLOR_BAR: Record<string, string> = {
  emerald: "bg-emerald-500",
  green:   "bg-green-500",
  teal:    "bg-teal-500",
  blue:    "bg-blue-500",
  cyan:    "bg-cyan-500",
  amber:   "bg-amber-500",
  rose:    "bg-rose-500",
};

export function ExamGradeTable({ grades }: { grades: GradeScale[] }) {
  const navigate = useNavigate();

  const columns: PremiumDataTableColumn<GradeScale>[] = [
    { key: "gradeName", header: "Grade", width: "w-[100px]", render: (g) => <GradeBadge grade={g.gradeName} /> },
    { key: "gradePoint", header: "Grade Point", width: "w-[120px]", render: (g) => <span className="font-bold text-foreground">{g.gradePoint.toFixed(2)}</span> },
    {
      key: "range", header: "% Range", width: "w-[140px]", render: (g) => (
        <span className="text-foreground">
          <span className="font-medium">{g.percentFrom}</span>
          <span className="text-muted-foreground"> – </span>
          <span className="font-medium">{g.percentUpto}</span>
          <span className="text-muted-foreground">%</span>
        </span>
      ),
    },
    {
      key: "colorLabel", header: "Color", width: "w-[130px]", render: (g) => (
        <div className="flex items-center gap-2">
          <div className={cn("h-3 w-8 rounded-full", COLOR_BAR[g.colorLabel] ?? "bg-muted")} />
          <span className="capitalize text-muted-foreground">{g.colorLabel}</span>
        </div>
      ),
    },
    {
      key: "resultStatus", header: "Result", width: "w-[100px]", render: (g) => (
        <PremiumBadge label={g.resultStatus} tone={g.resultStatus === "Pass" ? "success" : "danger"} />
      ),
    },
    { key: "comment", header: "Comment", render: (g) => <span className="text-muted-foreground">{g.comment}</span> },
    {
      key: "status", header: "Status", width: "w-[100px]", render: (g) => (
        <PremiumBadge label={g.status.charAt(0).toUpperCase() + g.status.slice(1)} tone={g.status === "active" ? "success" : "neutral"} />
      ),
    },
  ];

  return (
    <PremiumDataTable
      columns={columns}
      rows={grades}
      rowKey={(g) => g.id}
      emptyIcon={Award}
      emptyTitle="No grade scales found"
      emptyDescription="No grade levels have been configured yet."
      rowActions={(g) => (
        <RowActionMenu
          entityLabel="grade"
          onEdit={() => navigate(`/exams/grades/${g.id}/edit`)}
          onDelete={() => toast.error(`Delete grade ${g.gradeName}? (static — no action taken)`, { duration: 2000 })}
        />
      )}
    />
  );
}
