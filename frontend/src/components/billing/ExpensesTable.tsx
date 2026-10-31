import { Banknote, CheckCircle2, Eye, MoreHorizontal, Pencil, Trash2, Wallet, X } from "lucide-react";

import { BillingStatusBadge } from "@/components/billing/BillingStatusBadge";
import { Button } from "@/components/ui/button";
import { PremiumDataTable, type PremiumDataTableColumn, type PremiumDataTablePagination } from "@/components/ui/PremiumDataTable";
import { PremiumDropdownMenu, type PremiumMenuEntry } from "@/components/ui/PremiumDropdownMenu";
import type { Expense } from "@/api/types/billing";
import { useMoney } from "@/api/billing";

export type ExpenseAction = "edit" | "receipt" | "approve" | "reject" | "pay" | "delete";

export function ExpensesTable({
  expenses,
  onAction,
  sortField,
  sortDir,
  onSort,
  selected,
  onSelectionChange,
  pagination,
  hasActiveFilter,
  onResetFilters,
  can,
}: {
  expenses: Expense[];
  onAction: (expense: Expense, action: ExpenseAction) => void;
  sortField: string;
  sortDir: "asc" | "desc";
  onSort: (field: string) => void;
  selected: Set<string | number>;
  onSelectionChange: (keys: Set<string | number>) => void;
  pagination: PremiumDataTablePagination;
  hasActiveFilter: boolean;
  onResetFilters: () => void;
  can: { manage: boolean; approve: boolean };
}) {
  const money = useMoney();
  const columns: PremiumDataTableColumn<Expense>[] = [
    { key: "expenseId", header: "Expense ID", width: "w-[130px]", sortable: true, render: (e) => <span className="font-mono text-[12px] font-medium text-foreground">{e.expenseId}</span> },
    { key: "category", header: "Category", width: "w-[130px]", sortable: true, render: (e) => <span className="text-[12px] text-muted-foreground">{e.category}</span> },
    { key: "vendor", header: "Vendor / Paid To", width: "w-[170px]", sortable: true, render: (e) => <span className="text-[12.5px] font-medium text-foreground">{e.vendor}</span> },
    { key: "description", header: "Description", render: (e) => <span className="max-w-[220px] truncate text-[12px] text-muted-foreground">{e.description}</span> },
    { key: "amount", header: "Amount", width: "w-[110px]", sortable: true, render: (e) => <span className="text-[12.5px] font-semibold tabular-nums text-rose-600 dark:text-rose-400">{money(e.amount)}</span> },
    { key: "paymentMethod", header: "Method", width: "w-[140px]", render: (e) => e.paymentMethod ? <span className="text-[12px] text-muted-foreground">{e.paymentMethod}</span> : <span className="text-[12px] text-muted-foreground">—</span> },
    { key: "date", header: "Date", width: "w-[110px]", sortable: true, render: (e) => <span className="whitespace-nowrap text-[12px] text-muted-foreground">{e.date}</span> },
    { key: "approvedBy", header: "Approved By", width: "w-[130px]", render: (e) => <span className="text-[12px] text-muted-foreground">{e.approvedBy}</span> },
    { key: "status", header: "Status", width: "w-[110px]", sortable: true, render: (e) => <BillingStatusBadge status={e.status} /> },
  ];

  return (
    <PremiumDataTable
      columns={columns}
      rows={expenses}
      rowKey={(e) => e.id}
      selectedKeys={selected}
      onSelectionChange={onSelectionChange}
      sortField={sortField}
      sortDir={sortDir}
      onSort={onSort}
      emptyIcon={Wallet}
      emptyTitle="No expenses found"
      emptyDescription={hasActiveFilter ? "Try adjusting your search or filters." : "No expenses have been logged yet."}
      emptyAction={hasActiveFilter ? <Button variant="outline" size="sm" onClick={onResetFilters}>Clear filters</Button> : undefined}
      pagination={pagination}
      rowActions={(expense) => {
        const items: PremiumMenuEntry[] = [
          ...(expense.attachmentId ? [{ label: "Download bill", icon: Eye, onClick: () => onAction(expense, "receipt") }] : []),
          ...(expense.status === "Pending" && can.manage && !expense.fromPayroll ? [{ label: "Edit", icon: Pencil, onClick: () => onAction(expense, "edit") }] : []),
          ...(expense.status === "Pending" && can.approve ? [
            { label: "Approve", icon: CheckCircle2, onClick: () => onAction(expense, "approve") },
            { label: "Reject", icon: X, danger: true, onClick: () => onAction(expense, "reject") },
          ] : []),
          ...(expense.status === "Approved" && can.approve ? [{ label: "Mark as paid", icon: Banknote, onClick: () => onAction(expense, "pay") }] : []),
          ...(expense.status === "Pending" && can.manage ? ["separator" as const, { label: "Delete", icon: Trash2, danger: true, onClick: () => onAction(expense, "delete") }] : []),
        ];
        if (items.length === 0) return null;
        return (
          <PremiumDropdownMenu
            align="end"
            width="w-40"
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
