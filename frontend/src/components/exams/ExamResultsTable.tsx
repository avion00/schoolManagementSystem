import { BarChart2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { PremiumBadge } from "@/components/ui/PremiumBadge";
import { PremiumDataTable, type PremiumDataTableColumn, type PremiumDataTablePagination } from "@/components/ui/PremiumDataTable";
import { RowActionMenu } from "@/components/ui/RowActionMenu";
import { GradeBadge } from "@/components/exams/GradeBadge";
import type { ExamResult } from "@/api/types/exams";
import { cn } from "@/lib/utils";

export function ExamResultsTable({
  results,
  sortField,
  sortDir,
  onSort,
  pagination,
  reportLink,
}: {
  results: ExamResult[];
  sortField: string;
  sortDir: "asc" | "desc";
  onSort: (field: string) => void;
  pagination?: PremiumDataTablePagination;
  reportLink: (r: ExamResult) => string;
}) {
  const navigate = useNavigate();

  const columns: PremiumDataTableColumn<ExamResult>[] = [
    {
      key: "rank", header: "Rank", width: "w-[70px]", sortable: true, render: (r) => (
        r.rank === null ? <span className="text-muted-foreground">—</span> : r.rank <= 3 ? (
          <span className={cn("inline-flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-bold",
            r.rank === 1 ? "bg-amber-400 text-white" :
            r.rank === 2 ? "bg-slate-400 text-white" : "bg-orange-400 text-white",
          )}>{r.rank}</span>
        ) : (
          <span className="text-muted-foreground">{r.rank}</span>
        )
      ),
    },
    { key: "studentName", header: "Student", width: "w-[170px]", sortable: true, render: (r) => <span className="whitespace-nowrap font-medium text-foreground">{r.studentName}</span> },
    { key: "admissionNo", header: "Adm No", width: "w-[130px]", render: (r) => <span className="font-mono text-[11px] text-muted-foreground">{r.admissionNo}</span> },
    { key: "roll", header: "Roll", width: "w-[70px]", align: "center", sortable: true, render: (r) => <span className="text-muted-foreground">{r.roll || "—"}</span> },
    { key: "className", header: "Class", width: "w-[110px]", align: "center", render: (r) => <span className="whitespace-nowrap text-foreground">{r.className} {r.section}</span> },
    { key: "totalMarks", header: "Obtained", width: "w-[90px]", align: "center", sortable: true, render: (r) => <span className="font-bold text-foreground">{r.totalMarks}</span> },
    { key: "totalFullMarks", header: "Full", width: "w-[80px]", align: "center", render: (r) => <span className="text-muted-foreground">{r.totalFullMarks}</span> },
    { key: "percentage", header: "%", width: "w-[80px]", align: "center", sortable: true, render: (r) => <span className="font-semibold">{r.percentage === null ? "—" : `${r.percentage}%`}</span> },
    { key: "gpa", header: "GPA", width: "w-[80px]", align: "center", sortable: true, render: (r) => <span className="font-semibold text-indigo-600">{r.gpa === null ? "—" : r.gpa.toFixed(2)}</span> },
    { key: "grade", header: "Grade", width: "w-[90px]", align: "center", render: (r) => <GradeBadge grade={r.grade} /> },
    { key: "result", header: "Result", width: "w-[90px]", align: "center", render: (r) => <PremiumBadge label={r.result} tone={r.result === "Pass" ? "success" : r.result === "Incomplete" ? "neutral" : "danger"} /> },
  ];

  return (
    <PremiumDataTable
      columns={columns}
      rows={results}
      rowKey={(r) => r.studentId}
      sortField={sortField}
      sortDir={sortDir}
      onSort={onSort}
      pagination={pagination}
      emptyIcon={BarChart2}
      emptyTitle="No results found"
      emptyDescription="No results found for the selected filters."
      rowActions={(r) => (
        <RowActionMenu
          entityLabel="report card"
          onView={() => navigate(reportLink(r))}
        />
      )}
    />
  );
}
