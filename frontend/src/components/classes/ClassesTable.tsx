import { Layers } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

import { ClassStatusBadge } from "@/components/classes/ClassStatusBadge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PremiumDataTable, type PremiumDataTableColumn, type PremiumDataTablePagination } from "@/components/ui/PremiumDataTable";
import { RowActionMenu } from "@/components/ui/RowActionMenu";
import type { ClassData } from "@/api/types/classes";

export function ClassesTable({
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
  rows: ClassData[];
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

  const columns: PremiumDataTableColumn<ClassData>[] = [
    { key: "classId", header: "Class ID", width: "w-[130px]", sortable: true, render: (c) => <span className="font-mono text-xs text-muted-foreground">{c.classId}</span> },
    {
      key: "className", header: "Class Name", width: "w-[170px]", sortable: true, render: (c) => (
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-[12px] font-bold text-primary">
            {c.gradeLevel}
          </div>
          <p className="truncate text-[13px] font-medium text-foreground">{c.className}</p>
        </div>
      ),
    },
    {
      key: "sections", header: "Sections", render: (c) => (
        <div className="flex flex-wrap gap-1">
          {c.sections.map((s) => (
            <Badge key={s.id} variant="outline" className="px-1.5 py-0 text-[10px]">{s.sectionName}</Badge>
          ))}
        </div>
      ),
    },
    { key: "classTeacher", header: "Class Teacher", width: "w-[140px]", render: (c) => <span className="text-[12.5px] text-muted-foreground">{c.mainClassTeacher?.name ?? "—"}</span> },
    {
      key: "totalStudents", header: "Students", width: "w-[140px]", sortable: true, render: (c) => {
        const usedPct = c.totalCapacity ? Math.round((c.totalStudents / c.totalCapacity) * 100) : 0;
        return (
          <div className="flex items-center gap-2">
            <span className="text-[13px] font-medium text-foreground">{c.totalStudents}</span>
            <div className="h-1.5 w-14 overflow-hidden rounded-full bg-muted">
              <div
                className={`h-full rounded-full ${usedPct >= 90 ? "bg-rose-500" : usedPct >= 70 ? "bg-amber-500" : "bg-emerald-500"}`}
                style={{ width: `${usedPct}%` }}
              />
            </div>
          </div>
        );
      },
    },
    { key: "totalCapacity", header: "Capacity", width: "w-[90px]", sortable: true, render: (c) => <span className="text-[12.5px] text-muted-foreground">{c.totalCapacity}</span> },
    { key: "mainRoom", header: "Room", width: "w-[110px]", render: (c) => <span className="text-[12.5px] text-muted-foreground">{c.mainRoom}</span> },
    { key: "shift", header: "Shift", width: "w-[90px]", render: (c) => <span className="text-[12.5px] text-muted-foreground">{c.shift}</span> },
    { key: "medium", header: "Medium", width: "w-[90px]", render: (c) => <span className="text-[12.5px] text-muted-foreground">{c.medium}</span> },
    { key: "academicYear", header: "Acad. Year", width: "w-[100px]", sortable: true, render: (c) => <span className="font-mono text-[12px] text-muted-foreground">{c.academicYear}</span> },
    { key: "status", header: "Status", width: "w-[110px]", sortable: true, render: (c) => <ClassStatusBadge status={c.status} /> },
  ];

  return (
    <PremiumDataTable
      columns={columns}
      rows={rows}
      rowKey={(c) => c.id}
      selectable
      selectedKeys={selected}
      onSelectionChange={onSelectionChange}
      sortField={sortField}
      sortDir={sortDir}
      onSort={onSort}
      emptyIcon={Layers}
      emptyTitle="No classes found"
      emptyDescription={hasActiveFilter ? "Try adjusting your search or filters." : "No classes have been added yet."}
      emptyAction={hasActiveFilter ? <Button variant="outline" size="sm" onClick={onResetFilters}>Clear filters</Button> : undefined}
      pagination={pagination}
      bulkActions={(_count, clear) => (
        <>
          <Button variant="outline" size="sm" onClick={() => toast.info("Bulk export — coming soon")}>Export</Button>
          <Button variant="outline" size="sm" className="text-destructive hover:bg-destructive/10 hover:text-destructive" onClick={() => toast.info("Bulk delete — coming soon")}>Delete</Button>
          <Button variant="ghost" size="sm" className="ml-auto text-muted-foreground" onClick={clear}>Deselect all</Button>
        </>
      )}
      rowActions={(cls) => (
        <RowActionMenu
          entityLabel="class"
          onView={() => navigate(`/classes/${cls.id}`)}
          onEdit={() => navigate(`/classes/${cls.id}/edit`)}
          onDelete={() => toast.error(`Delete ${cls.className}? (static — no action taken)`, { duration: 2000 })}
        />
      )}
    />
  );
}
