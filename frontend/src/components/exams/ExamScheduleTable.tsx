import { AlertTriangle, CalendarClock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { PremiumDataTable, type PremiumDataTableColumn, type PremiumDataTablePagination } from "@/components/ui/PremiumDataTable";
import { RowActionMenu } from "@/components/ui/RowActionMenu";
import { ExamStatusBadge } from "@/components/exams/ExamStatusBadge";
import { EXAM_CONFLICT_IDS } from "@/data/examsData";
import type { ExamSchedule } from "@/data/examsData";

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
function getDayName(d: string) { return DAY_NAMES[new Date(d).getDay()]; }

export function ExamScheduleTable({
  rows,
  sortField,
  sortDir,
  onSort,
  selected,
  onSelectionChange,
  pagination,
  hasActiveFilter,
  onResetFilters,
}: {
  rows: ExamSchedule[];
  sortField: string;
  sortDir: "asc" | "desc";
  onSort: (field: string) => void;
  selected: Set<string | number>;
  onSelectionChange: (keys: Set<string | number>) => void;
  pagination: PremiumDataTablePagination;
  hasActiveFilter: boolean;
  onResetFilters: () => void;
}) {
  const navigate = useNavigate();

  const columns: PremiumDataTableColumn<ExamSchedule>[] = [
    {
      key: "examId", header: "Exam ID", width: "w-[130px]", sortable: true, render: (ex) => (
        <div className="flex items-center gap-1 font-mono text-xs font-semibold text-foreground">
          {EXAM_CONFLICT_IDS.has(ex.id) && <AlertTriangle className="h-3 w-3 shrink-0 text-rose-500" />}
          {ex.examId}
        </div>
      ),
    },
    { key: "term", header: "Term", width: "w-[100px]", sortable: true, render: (ex) => <span className="text-sm">{ex.term}</span> },
    { key: "examType", header: "Type", width: "w-[110px]", render: (ex) => <span className="text-sm text-muted-foreground">{ex.examType}</span> },
    { key: "subject", header: "Subject", width: "w-[170px]", sortable: true, render: (ex) => <span className="truncate text-sm font-medium text-foreground">{ex.subject}</span> },
    {
      key: "className", header: "Class", width: "w-[110px]", sortable: true, render: (ex) => (
        <span className="text-sm text-foreground">{ex.className} {ex.section}</span>
      ),
    },
    {
      key: "date", header: "Date", width: "w-[130px]", sortable: true, render: (ex) => (
        <div>
          <p className="text-sm text-foreground">{ex.date}</p>
          <p className="text-[11px] text-muted-foreground">{getDayName(ex.date)}</p>
        </div>
      ),
    },
    { key: "time", header: "Time", width: "w-[110px]", render: (ex) => <span className="whitespace-nowrap text-sm text-muted-foreground">{ex.startTime}–{ex.endTime}</span> },
    { key: "room", header: "Room", width: "w-[110px]", sortable: true, render: (ex) => <span className="text-sm">{ex.room}</span> },
    { key: "invigilator", header: "Invigilator", width: "w-[140px]", sortable: true, render: (ex) => <span className="truncate text-sm text-muted-foreground">{ex.invigilator}</span> },
    { key: "fullMarks", header: "Marks", width: "w-[80px]", sortable: true, align: "right", render: (ex) => <span className="font-semibold text-foreground">{ex.fullMarks}</span> },
    { key: "status", header: "Status", width: "w-[110px]", sortable: true, render: (ex) => <ExamStatusBadge status={ex.status} /> },
  ];

  return (
    <PremiumDataTable
      columns={columns}
      rows={rows}
      rowKey={(ex) => ex.id}
      selectable
      selectedKeys={selected}
      onSelectionChange={onSelectionChange}
      sortField={sortField}
      sortDir={sortDir}
      onSort={onSort}
      emptyIcon={CalendarClock}
      emptyTitle="No exam schedules found"
      emptyDescription={hasActiveFilter ? "Try adjusting your search or filters." : "No exams have been scheduled yet."}
      emptyAction={hasActiveFilter ? <Button variant="outline" size="sm" onClick={onResetFilters}>Clear filters</Button> : undefined}
      pagination={pagination}
      bulkActions={(_count, clear) => (
        <>
          <Button variant="outline" size="sm" onClick={() => toast.info("Bulk export — coming soon")}>Export</Button>
          <Button variant="outline" size="sm" className="text-destructive hover:bg-destructive/10 hover:text-destructive" onClick={() => toast.info("Bulk delete — coming soon")}>Delete</Button>
          <Button variant="ghost" size="sm" className="ml-auto text-muted-foreground" onClick={clear}>Deselect all</Button>
        </>
      )}
      rowActions={(ex) => (
        <RowActionMenu
          entityLabel="exam schedule"
          onView={() => navigate(`/exams/schedule/${ex.id}`)}
          onEdit={() => navigate(`/exams/schedule/${ex.id}/edit`)}
          onPrint={() => window.print()}
          onDelete={() => toast.error(`Delete ${ex.examId}? (static — no action taken)`, { duration: 2000 })}
        />
      )}
    />
  );
}
