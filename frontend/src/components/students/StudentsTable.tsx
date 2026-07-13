import { GraduationCap } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

import { StudentAvatar } from "@/components/students/StudentAvatar";
import { StudentStatusBadge } from "@/components/students/StudentStatusBadge";
import { Button } from "@/components/ui/button";
import { PremiumDataTable, type PremiumDataTableColumn, type PremiumDataTablePagination } from "@/components/ui/PremiumDataTable";
import { RowActionMenu } from "@/components/ui/RowActionMenu";
import type { Student } from "@/data/studentsData";

export function StudentsTable({
  rows,
  hiddenColumns,
  sortField,
  sortDir,
  onSort,
  selected,
  onSelectionChange,
  pagination,
  hasActiveFilter,
  onResetFilters,
}: {
  rows: Student[];
  hiddenColumns: Set<string>;
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

  const columns: PremiumDataTableColumn<Student>[] = [
    { key: "registrationNo", header: "Reg. No", width: "w-[130px]", sortable: true, render: (s) => <span className="font-mono text-xs text-muted-foreground">{s.registrationNo}</span> },
    {
      key: "name", header: "Student", width: "w-[220px]", sortable: true, render: (s) => (
        <div className="flex items-center gap-2.5">
          <StudentAvatar name={s.name} />
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-foreground">{s.name}</p>
            <p className="truncate text-[11px] text-muted-foreground">{s.email}</p>
          </div>
        </div>
      ),
    },
    { key: "className", header: "Class", width: "w-[90px]", sortable: true, render: (s) => <span className="text-sm">{s.className}</span> },
    { key: "section", header: "Section", width: "w-[80px]", hidden: hiddenColumns.has("section"), render: (s) => <span className="text-sm text-muted-foreground">{s.section ?? "—"}</span> },
    { key: "roll", header: "Roll", width: "w-[60px]", sortable: true, render: (s) => <span className="tabular-nums text-sm">{s.roll}</span> },
    { key: "guardian", header: "Guardian", hidden: hiddenColumns.has("guardian"), render: (s) => <span className="truncate text-sm text-muted-foreground">{s.parentName}</span> },
    { key: "mobile", header: "Mobile", width: "w-[140px]", hidden: hiddenColumns.has("mobile"), render: (s) => <span className="font-mono text-xs text-muted-foreground">{s.mobile}</span> },
    { key: "status", header: "Status", width: "w-[110px]", sortable: true, render: (s) => <StudentStatusBadge status={s.status} /> },
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
      emptyIcon={GraduationCap}
      emptyTitle="No students found"
      emptyDescription={hasActiveFilter ? "Try adjusting your search or filters." : "No students are enrolled yet."}
      emptyAction={hasActiveFilter ? <Button variant="outline" size="sm" onClick={onResetFilters}>Clear filters</Button> : undefined}
      pagination={pagination}
      bulkActions={(count, clear) => (
        <>
          <span className="text-sm font-medium text-foreground">{count} selected</span>
          <Button variant="outline" size="sm" onClick={() => toast.info("Bulk export — coming soon")}>Export</Button>
          <Button variant="outline" size="sm" className="text-destructive hover:bg-destructive/10 hover:text-destructive" onClick={() => toast.info("Bulk delete — coming soon")}>Delete</Button>
          <Button variant="ghost" size="sm" className="ml-auto text-muted-foreground" onClick={clear}>Deselect all</Button>
        </>
      )}
      rowActions={(student) => (
        <RowActionMenu
          onView={() => navigate(`/students/${student.id}`)}
          onEdit={() => navigate(`/students/${student.id}/edit`)}
          onPrint={() => window.print()}
          onDownload={() => console.log("Download record:", student.registrationNo)}
          onMessage={() => console.log("Message guardian:", student.parentName)}
          onDelete={() => toast.error(`Delete ${student.name}? (static — no action taken)`, { duration: 2000 })}
        />
      )}
    />
  );
}
