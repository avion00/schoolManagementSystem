import { UserRound } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

import { ParentAvatar } from "@/components/parents/ParentAvatar";
import { ParentStatusBadge } from "@/components/parents/ParentStatusBadge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PremiumDataTable, type PremiumDataTableColumn, type PremiumDataTablePagination } from "@/components/ui/PremiumDataTable";
import { RowActionMenu } from "@/components/ui/RowActionMenu";
import type { Parent } from "@/data/parentsData";

export function ParentsTable({
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
  rows: Parent[];
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

  const columns: PremiumDataTableColumn<Parent>[] = [
    { key: "parentId", header: "Parent ID", width: "w-[110px]", sortable: true, render: (p) => <span className="font-mono text-xs text-muted-foreground">{p.parentId}</span> },
    {
      key: "name", header: "Parent", width: "w-[220px]", sortable: true, render: (p) => (
        <div className="flex items-center gap-2.5">
          <ParentAvatar name={p.name} size="sm" />
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-foreground">{p.name}</p>
            <p className="truncate text-[11px] text-muted-foreground">{p.relation}</p>
          </div>
        </div>
      ),
    },
    { key: "occupation", header: "Occupation", width: "w-[140px]", sortable: true, render: (p) => <Badge variant="outline" className="text-[11px] font-medium">{p.occupation}</Badge> },
    {
      key: "children", header: "Children", width: "w-[160px]", sortable: true, render: (p) => (
        p.linkedChildren.length === 0 ? (
          <span className="text-[12px] text-muted-foreground/50">No children</span>
        ) : p.linkedChildren.length === 1 ? (
          <span className="text-[12.5px] font-medium text-foreground">{p.linkedChildren[0].name}</span>
        ) : (
          <div className="flex flex-wrap gap-1">
            {p.linkedChildren.slice(0, 2).map((c) => (
              <Badge key={c.id} variant="secondary" className="px-1.5 py-0 text-[10px]">{c.name.split(" ")[0]}</Badge>
            ))}
            {p.linkedChildren.length > 2 && (
              <Badge variant="secondary" className="px-1.5 py-0 text-[10px]">+{p.linkedChildren.length - 2}</Badge>
            )}
          </div>
        )
      ),
    },
    { key: "phone", header: "Phone", width: "w-[130px]", render: (p) => <span className="font-mono text-xs text-muted-foreground">{p.phone}</span> },
    { key: "email", header: "Email", render: (p) => <span className="truncate text-xs text-muted-foreground">{p.email}</span> },
    { key: "status", header: "Status", width: "w-[110px]", sortable: true, render: (p) => <ParentStatusBadge status={p.status} /> },
  ];

  return (
    <PremiumDataTable
      columns={columns}
      rows={rows}
      rowKey={(p) => p.id}
      selectable
      selectedKeys={selected}
      onSelectionChange={onSelectionChange}
      sortField={sortField}
      sortDir={sortDir}
      onSort={onSort}
      emptyIcon={UserRound}
      emptyTitle="No parents found"
      emptyDescription={hasActiveFilter ? "Try adjusting your search or filters." : "No parents/guardians are registered yet."}
      emptyAction={hasActiveFilter ? <Button variant="outline" size="sm" onClick={onResetFilters}>Clear filters</Button> : undefined}
      pagination={pagination}
      bulkActions={(_count, clear) => (
        <>
          <Button variant="outline" size="sm" onClick={() => toast.info("Bulk export — coming soon")}>Export</Button>
          <Button variant="outline" size="sm" className="text-destructive hover:bg-destructive/10 hover:text-destructive" onClick={() => toast.info("Bulk delete — coming soon")}>Delete</Button>
          <Button variant="ghost" size="sm" className="ml-auto text-muted-foreground" onClick={clear}>Deselect all</Button>
        </>
      )}
      rowActions={(parent) => (
        <RowActionMenu
          entityLabel="parent"
          onView={() => navigate(`/parents/${parent.id}`)}
          onEdit={() => navigate(`/parents/${parent.id}/edit`)}
          onPrint={() => window.print()}
          onMessage={() => toast.info(`Message ${parent.name} — coming soon`)}
          onDelete={() => toast.error(`Delete ${parent.name}? (static — no action taken)`, { duration: 2000 })}
        />
      )}
    />
  );
}
