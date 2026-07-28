import { useState } from "react";
import { BarChart2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast }  from "sonner";

import { PremiumBadge } from "@/components/ui/PremiumBadge";
import { PremiumDataTable, type PremiumDataTableColumn, type PremiumDataTablePagination } from "@/components/ui/PremiumDataTable";
import { RowActionMenu } from "@/components/ui/RowActionMenu";
import { GradeBadge } from "@/components/exams/GradeBadge";
import type { ExamResult } from "@/data/examsData";
import { cn } from "@/lib/utils";

export function ExamResultsTable({
  results,
  sortField,
  sortDir,
  onSort,
  pagination,
}: {
  results: ExamResult[];
  sortField: string;
  sortDir: "asc" | "desc";
  onSort: (field: string) => void;
  pagination?: PremiumDataTablePagination;
}) {
  const navigate = useNavigate();
  const [published, setPublished] = useState<Set<number>>(
    new Set(results.filter((r) => r.published).map((r) => r.id)),
  );

  function togglePublish(id: number) {
    setPublished((prev) => {
      const next = new Set(prev);
      if (next.has(id)) { next.delete(id); toast.info("Result unpublished."); }
      else               { next.add(id);    toast.success("Result published!"); }
      return next;
    });
  }

  const columns: PremiumDataTableColumn<ExamResult>[] = [
    {
      key: "rank", header: "Rank", width: "w-[70px]", sortable: true, render: (r) => (
        r.rank <= 3 ? (
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
    { key: "roll", header: "Roll", width: "w-[70px]", align: "center", sortable: true, render: (r) => <span className="text-muted-foreground">{r.roll}</span> },
    { key: "className", header: "Class", width: "w-[110px]", align: "center", render: (r) => <span className="whitespace-nowrap text-foreground">{r.className} {r.section}</span> },
    { key: "totalMarks", header: "Obtained", width: "w-[90px]", align: "center", sortable: true, render: (r) => <span className="font-bold text-foreground">{r.totalMarks}</span> },
    { key: "totalFullMarks", header: "Full", width: "w-[80px]", align: "center", render: (r) => <span className="text-muted-foreground">{r.totalFullMarks}</span> },
    { key: "percentage", header: "%", width: "w-[80px]", align: "center", sortable: true, render: (r) => <span className="font-semibold">{r.percentage}%</span> },
    { key: "gpa", header: "GPA", width: "w-[80px]", align: "center", sortable: true, render: (r) => <span className="font-semibold text-indigo-600">{r.gpa.toFixed(2)}</span> },
    { key: "grade", header: "Grade", width: "w-[90px]", align: "center", render: (r) => <GradeBadge grade={r.grade} /> },
    { key: "result", header: "Result", width: "w-[90px]", align: "center", render: (r) => <PremiumBadge label={r.result} tone={r.result === "Pass" ? "success" : "danger"} /> },
    {
      key: "published", header: "Published", width: "w-[100px]", align: "center", render: (r) => (
        <button
          onClick={() => togglePublish(r.id)}
          className={cn(
            "relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors",
            published.has(r.id) ? "bg-emerald-500" : "bg-muted",
          )}
          title={published.has(r.id) ? "Click to unpublish" : "Click to publish"}
        >
          <span className={cn(
            "pointer-events-none inline-block h-4 w-4 rounded-full bg-white shadow ring-0 transition-transform",
            published.has(r.id) ? "translate-x-4" : "translate-x-0",
          )} />
        </button>
      ),
    },
  ];

  return (
    <PremiumDataTable
      columns={columns}
      rows={results}
      rowKey={(r) => r.id}
      sortField={sortField}
      sortDir={sortDir}
      onSort={onSort}
      pagination={pagination}
      emptyIcon={BarChart2}
      emptyTitle="No results found"
      emptyDescription="No results found for the selected filters."
      rowActions={() => (
        <RowActionMenu
          entityLabel="report card"
          onView={() => navigate("/exams/report-cards")}
          onPrint={() => window.print()}
        />
      )}
    />
  );
}
