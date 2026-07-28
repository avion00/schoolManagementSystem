import { FileText } from "lucide-react";

import { BillingStatusBadge } from "@/components/billing/BillingStatusBadge";
import { Button } from "@/components/ui/button";
import { PremiumDataTable, type PremiumDataTableColumn, type PremiumDataTablePagination } from "@/components/ui/PremiumDataTable";
import { RowActionMenu } from "@/components/ui/RowActionMenu";
import type { Invoice } from "@/data/billingData";

export type InvoiceAction = "view" | "edit" | "record-payment" | "print" | "download" | "cancel";

export function InvoicesTable({
  invoices,
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
  invoices: Invoice[];
  onAction: (invoice: Invoice, action: InvoiceAction) => void;
  sortField: string;
  sortDir: "asc" | "desc";
  onSort: (field: string) => void;
  selected: Set<string | number>;
  onSelectionChange: (keys: Set<string | number>) => void;
  pagination: PremiumDataTablePagination;
  hasActiveFilter: boolean;
  onResetFilters: () => void;
}) {
  const columns: PremiumDataTableColumn<Invoice>[] = [
    { key: "invoiceNo", header: "Invoice No", width: "w-[130px]", sortable: true, render: (inv) => <span className="font-mono text-[12px] font-medium text-foreground">{inv.invoiceNo}</span> },
    {
      key: "studentName", header: "Student / Parent", width: "w-[200px]", sortable: true, render: (inv) => (
        <div>
          <p className="text-[12.5px] font-medium text-foreground">{inv.studentName}</p>
          <p className="text-[11px] text-muted-foreground">{inv.parentName}</p>
        </div>
      ),
    },
    { key: "className", header: "Class", width: "w-[110px]", render: (inv) => <span className="text-[12px] text-muted-foreground">{inv.className} – {inv.section}</span> },
    { key: "feeType", header: "Fee Type", width: "w-[150px]", render: (inv) => <span className="max-w-[150px] truncate text-[12px] text-muted-foreground">{inv.feeType}</span> },
    { key: "issueDate", header: "Issue Date", width: "w-[110px]", sortable: true, render: (inv) => <span className="whitespace-nowrap text-[12px] text-muted-foreground">{inv.issueDate}</span> },
    { key: "dueDate", header: "Due Date", width: "w-[110px]", sortable: true, render: (inv) => <span className="whitespace-nowrap text-[12px] text-muted-foreground">{inv.dueDate}</span> },
    { key: "amount", header: "Amount", width: "w-[100px]", sortable: true, render: (inv) => <span className="text-[12.5px] font-medium tabular-nums text-foreground">${inv.amount.toLocaleString()}</span> },
    { key: "paid", header: "Paid", width: "w-[100px]", render: (inv) => <span className="text-[12.5px] tabular-nums text-emerald-600 dark:text-emerald-400">${inv.paid.toLocaleString()}</span> },
    { key: "balance", header: "Balance", width: "w-[100px]", sortable: true, render: (inv) => <span className="text-[12.5px] font-medium tabular-nums text-rose-600 dark:text-rose-400">${inv.balance.toLocaleString()}</span> },
    { key: "status", header: "Status", width: "w-[110px]", sortable: true, render: (inv) => <BillingStatusBadge status={inv.status} /> },
    { key: "paymentMethod", header: "Method", width: "w-[120px]", render: (inv) => <span className="text-[12px] text-muted-foreground">{inv.paymentMethod ?? "—"}</span> },
  ];

  return (
    <PremiumDataTable
      columns={columns}
      rows={invoices}
      rowKey={(inv) => inv.id}
      selectable
      selectedKeys={selected}
      onSelectionChange={onSelectionChange}
      sortField={sortField}
      sortDir={sortDir}
      onSort={onSort}
      emptyIcon={FileText}
      emptyTitle="No invoices found"
      emptyDescription={hasActiveFilter ? "Try adjusting your search or filters." : "No invoices have been created yet."}
      emptyAction={hasActiveFilter ? <Button variant="outline" size="sm" onClick={onResetFilters}>Clear filters</Button> : undefined}
      pagination={pagination}
      bulkActions={(_count, clear) => (
        <>
          <Button variant="ghost" size="sm" className="ml-auto text-muted-foreground" onClick={clear}>Deselect all</Button>
        </>
      )}
      rowActions={(invoice) => (
        <RowActionMenu
          entityLabel="invoice"
          onView={() => onAction(invoice, "view")}
          onEdit={() => onAction(invoice, "edit")}
          onPrint={() => onAction(invoice, "print")}
          onDownload={() => onAction(invoice, "download")}
          onMessage={() => onAction(invoice, "record-payment")}
          messageLabel="Record payment"
          onDelete={invoice.status !== "Cancelled" ? () => onAction(invoice, "cancel") : undefined}
        />
      )}
    />
  );
}
