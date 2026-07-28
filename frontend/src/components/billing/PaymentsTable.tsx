import { Eye, MoreHorizontal, Printer, Receipt, RotateCcw, ShieldCheck } from "lucide-react";

import { BillingStatusBadge } from "@/components/billing/BillingStatusBadge";
import { PaymentMethodBadge } from "@/components/billing/PaymentMethodBadge";
import { Button } from "@/components/ui/button";
import { PremiumDataTable, type PremiumDataTableColumn, type PremiumDataTablePagination } from "@/components/ui/PremiumDataTable";
import { PremiumDropdownMenu, type PremiumMenuEntry } from "@/components/ui/PremiumDropdownMenu";
import type { Payment } from "@/data/billingData";

export type PaymentAction = "view-receipt" | "print-receipt" | "refund" | "verify";

export function PaymentsTable({
  payments,
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
  payments: Payment[];
  onAction: (payment: Payment, action: PaymentAction) => void;
  sortField: string;
  sortDir: "asc" | "desc";
  onSort: (field: string) => void;
  selected: Set<string | number>;
  onSelectionChange: (keys: Set<string | number>) => void;
  pagination: PremiumDataTablePagination;
  hasActiveFilter: boolean;
  onResetFilters: () => void;
}) {
  const columns: PremiumDataTableColumn<Payment>[] = [
    { key: "paymentId", header: "Payment ID", width: "w-[130px]", sortable: true, render: (p) => <span className="font-mono text-[12px] font-medium text-foreground">{p.paymentId}</span> },
    { key: "invoiceNo", header: "Invoice No", width: "w-[120px]", render: (p) => <span className="font-mono text-[12px] text-muted-foreground">{p.invoiceNo}</span> },
    { key: "studentName", header: "Student", width: "w-[160px]", sortable: true, render: (p) => <span className="text-[12.5px] font-medium text-foreground">{p.studentName}</span> },
    { key: "parentName", header: "Parent", width: "w-[150px]", render: (p) => <span className="text-[12px] text-muted-foreground">{p.parentName}</span> },
    { key: "amount", header: "Amount", width: "w-[100px]", sortable: true, render: (p) => <span className="text-[12.5px] font-semibold tabular-nums text-emerald-600 dark:text-emerald-400">${p.amount.toLocaleString()}</span> },
    { key: "method", header: "Method", width: "w-[140px]", render: (p) => <PaymentMethodBadge method={p.method} /> },
    { key: "transactionId", header: "Transaction ID", width: "w-[120px]", render: (p) => <span className="font-mono text-[11.5px] text-muted-foreground">{p.transactionId}</span> },
    { key: "paymentDate", header: "Date", width: "w-[110px]", sortable: true, render: (p) => <span className="whitespace-nowrap text-[12px] text-muted-foreground">{p.paymentDate}</span> },
    { key: "receivedBy", header: "Received By", width: "w-[130px]", render: (p) => <span className="text-[12px] text-muted-foreground">{p.receivedBy}</span> },
    { key: "status", header: "Status", width: "w-[110px]", sortable: true, render: (p) => <BillingStatusBadge status={p.status} /> },
  ];

  return (
    <PremiumDataTable
      columns={columns}
      rows={payments}
      rowKey={(p) => p.id}
      selectable
      selectedKeys={selected}
      onSelectionChange={onSelectionChange}
      sortField={sortField}
      sortDir={sortDir}
      onSort={onSort}
      emptyIcon={Receipt}
      emptyTitle="No payments found"
      emptyDescription={hasActiveFilter ? "Try adjusting your search or filters." : "No payments have been recorded yet."}
      emptyAction={hasActiveFilter ? <Button variant="outline" size="sm" onClick={onResetFilters}>Clear filters</Button> : undefined}
      pagination={pagination}
      bulkActions={(_count, clear) => (
        <>
          <Button variant="ghost" size="sm" className="ml-auto text-muted-foreground" onClick={clear}>Deselect all</Button>
        </>
      )}
      rowActions={(payment) => {
        const items: PremiumMenuEntry[] = [
          { label: "View receipt", icon: Eye, onClick: () => onAction(payment, "view-receipt") },
          { label: "Print receipt", icon: Printer, onClick: () => onAction(payment, "print-receipt") },
          { label: "Verify", icon: ShieldCheck, onClick: () => onAction(payment, "verify") },
          "separator",
          { label: "Refund", icon: RotateCcw, danger: true, onClick: () => onAction(payment, "refund") },
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
