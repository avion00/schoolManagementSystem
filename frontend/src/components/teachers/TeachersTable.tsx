import { Users } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

import { TeacherAvatar } from "@/components/teachers/TeacherAvatar";
import { TeacherStatusBadge } from "@/components/teachers/TeacherStatusBadge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PremiumDataTable, type PremiumDataTableColumn, type PremiumDataTablePagination } from "@/components/ui/PremiumDataTable";
import { RowActionMenu } from "@/components/ui/RowActionMenu";
import type { Teacher } from "@/api/types/teachers";

export function TeachersTable({
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
  rows: Teacher[];
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

  const columns: PremiumDataTableColumn<Teacher>[] = [
    { key: "employeeId", header: "Emp. ID", width: "w-[110px]", sortable: true, render: (t) => <span className="font-mono text-xs text-muted-foreground">{t.employeeId}</span> },
    {
      key: "name", header: "Teacher", width: "w-[220px]", sortable: true, render: (t) => (
        <div className="flex items-center gap-2.5">
          <TeacherAvatar name={t.name} size="sm" />
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-foreground">{t.name}</p>
            <p className="truncate text-[11px] text-muted-foreground">{t.designation}</p>
          </div>
        </div>
      ),
    },
    { key: "department", header: "Department", width: "w-[130px]", sortable: true, render: (t) => <Badge variant="outline" className="text-[11px] font-medium">{t.department}</Badge> },
    { key: "subject", header: "Subject", width: "w-[140px]", sortable: true, render: (t) => <span className="text-sm">{t.subject}</span> },
    {
      key: "classes", header: "Classes", width: "w-[160px]", render: (t) => (
        t.assignedClasses.length ? (
          <div className="flex flex-wrap gap-1">
            {t.assignedClasses.slice(0, 2).map((c) => (
              <Badge key={c} variant="secondary" className="px-1.5 py-0 text-[10px]">{c}</Badge>
            ))}
            {t.assignedClasses.length > 2 && (
              <Badge variant="secondary" className="px-1.5 py-0 text-[10px]">+{t.assignedClasses.length - 2}</Badge>
            )}
          </div>
        ) : <span className="text-[12px] text-muted-foreground/50">—</span>
      ),
    },
    { key: "phone", header: "Phone", width: "w-[130px]", render: (t) => <span className="font-mono text-xs text-muted-foreground">{t.phone}</span> },
    { key: "email", header: "Email", render: (t) => <span className="truncate text-xs text-muted-foreground">{t.email}</span> },
    { key: "status", header: "Status", width: "w-[110px]", sortable: true, render: (t) => <TeacherStatusBadge status={t.status} /> },
  ];

  return (
    <PremiumDataTable
      columns={columns}
      rows={rows}
      rowKey={(t) => t.id}
      selectable
      selectedKeys={selected}
      onSelectionChange={onSelectionChange}
      sortField={sortField}
      sortDir={sortDir}
      onSort={onSort}
      emptyIcon={Users}
      emptyTitle="No teachers found"
      emptyDescription={hasActiveFilter ? "Try adjusting your search or filters." : "No teaching staff are registered yet."}
      emptyAction={hasActiveFilter ? <Button variant="outline" size="sm" onClick={onResetFilters}>Clear filters</Button> : undefined}
      pagination={pagination}
      bulkActions={(_count, clear) => (
        <>
          <Button variant="outline" size="sm" onClick={() => toast.info("Bulk export — coming soon")}>Export</Button>
          <Button variant="outline" size="sm" className="text-destructive hover:bg-destructive/10 hover:text-destructive" onClick={() => toast.info("Bulk delete — coming soon")}>Delete</Button>
          <Button variant="ghost" size="sm" className="ml-auto text-muted-foreground" onClick={clear}>Deselect all</Button>
        </>
      )}
      rowActions={(teacher) => (
        <RowActionMenu
          entityLabel="teacher"
          onView={() => navigate(`/teachers/${teacher.id}`)}
          onEdit={() => navigate(`/teachers/${teacher.id}/edit`)}
          onPrint={() => window.print()}
          onMessage={() => toast.info(`Message ${teacher.name} — coming soon`)}
          onDelete={() => toast.error(`Delete ${teacher.name}? (static — no action taken)`, { duration: 2000 })}
        />
      )}
    />
  );
}
