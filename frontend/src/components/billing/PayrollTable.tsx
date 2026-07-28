import { CheckCircle2, Eye, MoreHorizontal, Printer, Users } from "lucide-react";

import { BillingStatusBadge } from "@/components/billing/BillingStatusBadge";
import { Button } from "@/components/ui/button";
import { PremiumDataTable, type PremiumDataTableColumn, type PremiumDataTablePagination } from "@/components/ui/PremiumDataTable";
import { PremiumDropdownMenu, type PremiumMenuEntry } from "@/components/ui/PremiumDropdownMenu";
import type { Payroll } from "@/data/billingData";

export type PayrollAction = "view" | "payslip" | "mark-paid" | "print-payslip";

export function PayrollTable({
  payroll,
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
  payroll: Payroll[];
  onAction: (row: Payroll, action: PayrollAction) => void;
  sortField: string;
  sortDir: "asc" | "desc";
  onSort: (field: string) => void;
  selected: Set<string | number>;
  onSelectionChange: (keys: Set<string | number>) => void;
  pagination: PremiumDataTablePagination;
  hasActiveFilter: boolean;
  onResetFilters: () => void;
}) {
  const columns: PremiumDataTableColumn<Payroll>[] = [
    { key: "employeeId", header: "Employee ID", width: "w-[130px]", sortable: true, render: (p) => <span className="font-mono text-[12px] font-medium text-foreground">{p.employeeId}</span> },
    { key: "staffName", header: "Staff Name", width: "w-[160px]", sortable: true, render: (p) => <span className="text-[12.5px] font-medium text-foreground">{p.staffName}</span> },
    { key: "role", header: "Role", width: "w-[120px]", sortable: true, render: (p) => <span className="text-[12px] text-muted-foreground">{p.role}</span> },
    { key: "department", header: "Department", width: "w-[140px]", render: (p) => <span className="text-[12px] text-muted-foreground">{p.department}</span> },
    { key: "basicSalary", header: "Basic", width: "w-[100px]", sortable: true, render: (p) => <span className="text-[12px] tabular-nums text-muted-foreground">${p.basicSalary.toLocaleString()}</span> },
    { key: "allowance", header: "Allowance", width: "w-[100px]", render: (p) => <span className="text-[12px] tabular-nums text-emerald-600 dark:text-emerald-400">+${p.allowance.toLocaleString()}</span> },
    { key: "deduction", header: "Deduction", width: "w-[100px]", render: (p) => <span className="text-[12px] tabular-nums text-rose-600 dark:text-rose-400">-${p.deduction.toLocaleString()}</span> },
    { key: "netSalary", header: "Net Salary", width: "w-[110px]", sortable: true, render: (p) => <span className="text-[12.5px] font-semibold tabular-nums text-foreground">${p.netSalary.toLocaleString()}</span> },
    { key: "month", header: "Month", width: "w-[100px]", render: (p) => <span className="whitespace-nowrap text-[12px] text-muted-foreground">{p.month}</span> },
    { key: "status", header: "Status", width: "w-[100px]", sortable: true, render: (p) => <BillingStatusBadge status={p.status} /> },
    { key: "paymentDate", header: "Payment Date", width: "w-[110px]", render: (p) => <span className="whitespace-nowrap text-[12px] text-muted-foreground">{p.paymentDate ?? "—"}</span> },
  ];

  return (
    <PremiumDataTable
      columns={columns}
      rows={payroll}
      rowKey={(p) => p.id}
      selectable
      selectedKeys={selected}
      onSelectionChange={onSelectionChange}
      sortField={sortField}
      sortDir={sortDir}
      onSort={onSort}
      emptyIcon={Users}
      emptyTitle="No payroll records found"
      emptyDescription={hasActiveFilter ? "Try adjusting your search or filters." : "No payroll has been generated yet."}
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
          { label: "Generate payslip", icon: Eye, onClick: () => onAction(row, "payslip") },
          { label: "Print payslip", icon: Printer, onClick: () => onAction(row, "print-payslip") },
          { label: "Mark paid", icon: CheckCircle2, onClick: () => onAction(row, "mark-paid") },
        ];
        return (
          <PremiumDropdownMenu
            align="end"
            width="w-44"
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
