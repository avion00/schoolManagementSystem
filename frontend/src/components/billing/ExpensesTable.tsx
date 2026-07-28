import { CheckCircle2, Eye, MoreHorizontal, Wallet, X } from "lucide-react";

import { BillingStatusBadge } from "@/components/billing/BillingStatusBadge";
import { PaymentMethodBadge } from "@/components/billing/PaymentMethodBadge";
import { Button } from "@/components/ui/button";
import { PremiumDataTable, type PremiumDataTableColumn, type PremiumDataTablePagination } from "@/components/ui/PremiumDataTable";
import { PremiumDropdownMenu, type PremiumMenuEntry } from "@/components/ui/PremiumDropdownMenu";
import type { Expense } from "@/data/billingData";

export type ExpenseAction = "view" | "approve" | "reject";

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
}) {
  const columns: PremiumDataTableColumn<Expense>[] = [
    { key: "expenseId", header: "Expense ID", width: "w-[130px]", sortable: true, render: (e) => <span className="font-mono text-[12px] font-medium text-foreground">{e.expenseId}</span> },
    { key: "category", header: "Category", width: "w-[130px]", sortable: true, render: (e) => <span className="text-[12px] text-muted-foreground">{e.category}</span> },
    { key: "vendor", header: "Vendor / Paid To", width: "w-[170px]", sortable: true, render: (e) => <span className="text-[12.5px] font-medium text-foreground">{e.vendor}</span> },
    { key: "description", header: "Description", render: (e) => <span className="max-w-[220px] truncate text-[12px] text-muted-foreground">{e.description}</span> },
    { key: "amount", header: "Amount", width: "w-[110px]", sortable: true, render: (e) => <span className="text-[12.5px] font-semibold tabular-nums text-rose-600 dark:text-rose-400">${e.amount.toLocaleString()}</span> },
    { key: "paymentMethod", header: "Method", width: "w-[140px]", render: (e) => <PaymentMethodBadge method={e.paymentMethod} /> },
    { key: "date", header: "Date", width: "w-[110px]", sortable: true, render: (e) => <span className="whitespace-nowrap text-[12px] text-muted-foreground">{e.date}</span> },
    { key: "approvedBy", header: "Approved By", width: "w-[130px]", render: (e) => <span className="text-[12px] text-muted-foreground">{e.approvedBy}</span> },
    { key: "status", header: "Status", width: "w-[110px]", sortable: true, render: (e) => <BillingStatusBadge status={e.status} /> },
  ];

  return (
    <PremiumDataTable
      columns={columns}
      rows={expenses}
      rowKey={(e) => e.id}
      selectable
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
      bulkActions={(_count, clear) => (
        <>
          <Button variant="ghost" size="sm" className="ml-auto text-muted-foreground" onClick={clear}>Deselect all</Button>
        </>
      )}
      rowActions={(expense) => {
        const items: PremiumMenuEntry[] = [
          { label: "View", icon: Eye, onClick: () => onAction(expense, "view") },
          { label: "Approve", icon: CheckCircle2, onClick: () => onAction(expense, "approve") },
          "separator",
          { label: "Reject", icon: X, danger: true, onClick: () => onAction(expense, "reject") },
        ];
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
