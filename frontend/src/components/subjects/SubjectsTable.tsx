import { BookOpen } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

import { SubjectStatusBadge } from "@/components/subjects/SubjectStatusBadge";
import { SubjectTypeBadge } from "@/components/subjects/SubjectTypeBadge";
import { Button } from "@/components/ui/button";
import { PremiumBadge } from "@/components/ui/PremiumBadge";
import { PremiumDataTable, type PremiumDataTableColumn, type PremiumDataTablePagination } from "@/components/ui/PremiumDataTable";
import { RowActionMenu } from "@/components/ui/RowActionMenu";
import type { SubjectCategory, SubjectData } from "@/data/subjectsData";

const CAT_TONE: Record<SubjectCategory, "success" | "warning" | "danger" | "neutral" | "info" | "purple"> = {
  "Compulsory": "purple",
  "Optional": "warning",
  "Language": "info",
  "Science": "success",
  "Commerce": "info",
  "Technical": "purple",
  "Extra-curricular": "danger",
};

export function SubjectsTable({
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
  rows: SubjectData[];
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

  const columns: PremiumDataTableColumn<SubjectData>[] = [
    { key: "subjectCode", header: "Code", width: "w-[110px]", sortable: true, render: (s) => <span className="font-mono text-xs text-muted-foreground">{s.subjectCode}</span> },
    {
      key: "subjectName", header: "Subject", width: "w-[200px]", sortable: true, render: (s) => (
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-foreground">{s.subjectName}</p>
          <p className="truncate text-[11px] text-muted-foreground">{s.department}</p>
        </div>
      ),
    },
    { key: "type", header: "Type", width: "w-[130px]", sortable: true, render: (s) => <SubjectTypeBadge type={s.type} /> },
    { key: "category", header: "Category", width: "w-[130px]", sortable: true, render: (s) => <PremiumBadge label={s.category} tone={CAT_TONE[s.category]} /> },
    { key: "primaryTeacher", header: "Primary Teacher", width: "w-[140px]", render: (s) => <span className="text-sm text-foreground">{s.primaryTeacher.name}</span> },
    { key: "weeklyPeriods", header: "Periods/Wk", width: "w-[90px]", align: "right", sortable: true, render: (s) => <span className="tabular-nums text-sm">{s.weeklyPeriods}</span> },
    { key: "fullMarks", header: "Full Marks", width: "w-[90px]", align: "right", sortable: true, render: (s) => <span className="tabular-nums text-sm">{s.fullMarks}</span> },
    {
      key: "assignedClasses", header: "Classes", render: (s) => (
        <span className="text-[11px] text-muted-foreground">
          {s.assignedClasses.length > 3
            ? `${s.assignedClasses.slice(0, 2).join(", ")} +${s.assignedClasses.length - 2}`
            : s.assignedClasses.join(", ")}
        </span>
      ),
    },
    { key: "status", header: "Status", width: "w-[110px]", sortable: true, render: (s) => <SubjectStatusBadge status={s.status} /> },
  ];

  return (
    <PremiumDataTable
      columns={columns}
      rows={rows}
      rowKey={(s) => s.id}
      selectable
      selectedKeys={selected}
      onSelectionChange={onSelectionChange}
      sortField={sortField}
      sortDir={sortDir}
      onSort={onSort}
      emptyIcon={BookOpen}
      emptyTitle="No subjects found"
      emptyDescription={hasActiveFilter ? "Try adjusting your search or filters." : "No subjects have been added yet."}
      emptyAction={hasActiveFilter ? <Button variant="outline" size="sm" onClick={onResetFilters}>Clear filters</Button> : undefined}
      pagination={pagination}
      bulkActions={(_count, clear) => (
        <>
          <Button variant="outline" size="sm" onClick={() => toast.info("Bulk export — coming soon")}>Export</Button>
          <Button variant="outline" size="sm" className="text-destructive hover:bg-destructive/10 hover:text-destructive" onClick={() => toast.info("Bulk delete — coming soon")}>Delete</Button>
          <Button variant="ghost" size="sm" className="ml-auto text-muted-foreground" onClick={clear}>Deselect all</Button>
        </>
      )}
      rowActions={(subject) => (
        <RowActionMenu
          entityLabel="subject"
          onView={() => navigate(`/subjects/${subject.id}`)}
        />
      )}
    />
  );
}
