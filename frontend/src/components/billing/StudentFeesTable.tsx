import { Eye, FileText, MoreHorizontal, Printer, Receipt, Users } from "lucide-react";

import { BillingStatusBadge } from "@/components/billing/BillingStatusBadge";
import { Button } from "@/components/ui/button";
import { PremiumDataTable, type PremiumDataTableColumn, type PremiumDataTablePagination } from "@/components/ui/PremiumDataTable";
import { PremiumDropdownMenu, type PremiumMenuEntry } from "@/components/ui/PremiumDropdownMenu";
import type { StudentFee } from "@/data/billingData";

export type StudentFeeAction = "view" | "generate-invoice" | "record-payment" | "print-statement";

export function StudentFeesTable({
  studentFees,
  onAction,
  sortField,
  sortDir,
  onSort,
  selected,
  onSelectionChange,
  pagination,
  hasActiveFilter,
  onResetFilters,
}: {
  studentFees: StudentFee[];
  onAction: (row: StudentFee, action: StudentFeeAction) => void;
  sortField: string;
  sortDir: "asc" | "desc";
  onSort: (field: string) => void;
  selected: Set<string | number>;
  onSelectionChange: (keys: Set<string | number>) => void;
  pagination: PremiumDataTablePagination;
  hasActiveFilter: boolean;
  onResetFilters: () => void;
}) {
  const columns: PremiumDataTableColumn<StudentFee>[] = [
    { key: "studentName", header: "Student", width: "w-[160px]", sortable: true, render: (s) => <span className="text-[12.5px] font-medium text-foreground">{s.studentName}</span> },
    { key: "admissionNo", header: "Admission No", width: "w-[120px]", render: (s) => <span className="font-mono text-[11.5px] text-muted-foreground">{s.admissionNo}</span> },
    { key: "registrationNo", header: "Registration No", width: "w-[130px]", render: (s) => <span className="font-mono text-[11.5px] text-muted-foreground">{s.registrationNo}</span> },
    { key: "className", header: "Class", width: "w-[90px]", sortable: true, render: (s) => <span className="text-[12px] text-muted-foreground">{s.className}</span> },
    { key: "section", header: "Section", width: "w-[80px]", render: (s) => <span className="text-[12px] text-muted-foreground">{s.section}</span> },
    { key: "feePlan", header: "Fee Plan", width: "w-[140px]", render: (s) => <span className="text-[12px] text-muted-foreground">{s.feePlan}</span> },
    { key: "totalFee", header: "Total Fee", width: "w-[100px]", sortable: true, render: (s) => <span className="text-[12.5px] tabular-nums text-foreground">${s.totalFee.toLocaleString()}</span> },
    { key: "paid", header: "Paid", width: "w-[100px]", sortable: true, render: (s) => <span className="text-[12.5px] tabular-nums text-emerald-600 dark:text-emerald-400">${s.paid.toLocaleString()}</span> },
    { key: "due", header: "Due", width: "w-[100px]", sortable: true, render: (s) => <span className="text-[12.5px] font-medium tabular-nums text-rose-600 dark:text-rose-400">${s.due.toLocaleString()}</span> },
    { key: "discount", header: "Discount", width: "w-[90px]", render: (s) => <span className="text-[12px] tabular-nums text-muted-foreground">${s.discount.toLocaleString()}</span> },
    { key: "status", header: "Status", width: "w-[100px]", sortable: true, render: (s) => <BillingStatusBadge status={s.status} /> },
    { key: "nextDueDate", header: "Next Due Date", width: "w-[110px]", sortable: true, render: (s) => <span className="whitespace-nowrap text-[12px] text-muted-foreground">{s.nextDueDate ?? "—"}</span> },
  ];

  return (
    <PremiumDataTable
      columns={columns}
      rows={studentFees}
      rowKey={(s) => s.id}
      selectable
      selectedKeys={selected}
      onSelectionChange={onSelectionChange}
      sortField={sortField}
      sortDir={sortDir}
      onSort={onSort}
      emptyIcon={Users}
      emptyTitle="No students found"
      emptyDescription={hasActiveFilter ? "Try adjusting your search or filters." : "No student fee records available."}
      emptyAction={hasActiveFilter ? <Button variant="outline" size="sm" onClick={onResetFilters}>Clear filters</Button> : undefined}
      pagination={pagination}
      bulkActions={(_count, clear) => (
        <>
          <Button variant="ghost" size="sm" className="ml-auto text-muted-foreground" onClick={clear}>Deselect all</Button>
        </>
      )}
      rowActions={(row) => {
        const items: PremiumMenuEntry[] = [
          { label: "View", icon: Eye, onClick: () => onAction(row, "view") },
          { label: "Generate invoice", icon: FileText, onClick: () => onAction(row, "generate-invoice") },
          { label: "Record payment", icon: Receipt, onClick: () => onAction(row, "record-payment") },
          { label: "Print statement", icon: Printer, onClick: () => onAction(row, "print-statement") },
        ];
        return (
          <PremiumDropdownMenu
            align="end"
            width="w-48"
            trigger={
              <button type="button" aria-label="Row actions" className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent/70 hover:text-foreground">
                <MoreHorizontal className="h-4 w-4" />
              </button>
            }
            items={items}
          />
        );
      }}
    />
  );
}
