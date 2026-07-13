import { useNavigate } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { PremiumBadge, type PremiumBadgeTone } from "@/components/ui/PremiumBadge";
import { PremiumDataTable, type PremiumDataTableColumn } from "@/components/ui/PremiumDataTable";
import type { GradebookEntry, MarksStatus } from "@/data/teacherDashboardData";
import { Award } from "lucide-react";

const STATUS_TONE: Record<MarksStatus, PremiumBadgeTone> = {
  Draft: "neutral",
  Submitted: "info",
  Approved: "success",
  Returned: "danger",
};

/** Class-wise gradebook: average/highest/lowest + a mini grade-distribution bar. */
export function GradebookTable({ rows }: { rows: GradebookEntry[] }) {
  const navigate = useNavigate();

  const columns: PremiumDataTableColumn<GradebookEntry>[] = [
    { key: "className", header: "Class", width: "w-[120px]", render: (m) => <span className="font-medium text-foreground">{m.className} · {m.section}</span> },
    { key: "subject", header: "Subject", width: "w-[110px]", render: (m) => <span className="text-sm text-foreground">{m.subject}</span> },
    { key: "exam", header: "Exam", width: "w-[130px]", render: (m) => <span className="text-sm text-foreground">{m.exam}</span> },
    { key: "average", header: "Average", width: "w-[90px]", render: (m) => <span className="tabular-nums text-sm font-semibold">{m.average}</span> },
    { key: "range", header: "High / Low", width: "w-[100px]", render: (m) => <span className="tabular-nums text-sm text-muted-foreground">{m.highest} / {m.lowest}</span> },
    { key: "distribution", header: "Grade Distribution", render: (m) => (
      <div className="flex items-center gap-1">
        {m.gradeDistribution.map((g) => (
          <span key={g.grade} className="rounded-md bg-muted px-1.5 py-0.5 text-[10.5px] font-medium text-muted-foreground">
            {g.grade}:{g.count}
          </span>
        ))}
      </div>
    ) },
    { key: "status", header: "Status", width: "w-[100px]", render: (m) => <PremiumBadge label={m.status} tone={STATUS_TONE[m.status]} /> },
  ];

  return (
    <PremiumDataTable
      columns={columns}
      rows={rows}
      rowKey={(m) => `${m.classId}-${m.exam}`}
      emptyIcon={Award}
      emptyTitle="No exams recorded yet"
      rowActions={(m) => (
        <Button variant="ghost" size="sm" className="h-8 whitespace-nowrap text-[12px]" onClick={() => navigate(`/teacher/marks-entry?class=${m.classId}`)}>
          {m.status === "Draft" || m.status === "Returned" ? "Continue" : "View"}
        </Button>
      )}
    />
  );
}
