import { Truck } from "lucide-react";
import { toast } from "sonner";

import { BillingStatusBadge } from "@/components/billing/BillingStatusBadge";
import { Button } from "@/components/ui/button";
import { PremiumDataTable, type PremiumDataTableColumn, type PremiumDataTablePagination } from "@/components/ui/PremiumDataTable";
import { RowActionMenu } from "@/components/ui/RowActionMenu";
import type { Vendor } from "@/data/billingData";

export function VendorsTable({
  vendors,
  sortField,
  sortDir,
  onSort,
  selected,
  onSelectionChange,
  pagination,
  hasActiveFilter,
  onResetFilters,
}: {
  vendors: Vendor[];
  sortField: string;
  sortDir: "asc" | "desc";
  onSort: (field: string) => void;
  selected: Set<string | number>;
  onSelectionChange: (keys: Set<string | number>) => void;
  pagination: PremiumDataTablePagination;
  hasActiveFilter: boolean;
  onResetFilters: () => void;
}) {
  const columns: PremiumDataTableColumn<Vendor>[] = [
    { key: "vendorId", header: "Vendor ID", width: "w-[120px]", sortable: true, render: (v) => <span className="font-mono text-[12px] font-medium text-foreground">{v.vendorId}</span> },
    { key: "vendorName", header: "Vendor Name", width: "w-[190px]", sortable: true, render: (v) => <span className="text-[12.5px] font-medium text-foreground">{v.vendorName}</span> },
    { key: "category", header: "Category", width: "w-[150px]", sortable: true, render: (v) => <span className="text-[12px] text-muted-foreground">{v.category}</span> },
    { key: "contactPerson", header: "Contact Person", width: "w-[140px]", render: (v) => <span className="text-[12px] text-muted-foreground">{v.contactPerson}</span> },
    { key: "phone", header: "Phone", width: "w-[130px]", render: (v) => <span className="whitespace-nowrap text-[12px] text-muted-foreground">{v.phone}</span> },
    { key: "email", header: "Email", render: (v) => <span className="text-[12px] text-muted-foreground">{v.email}</span> },
    { key: "totalPurchases", header: "Total Purchases", width: "w-[130px]", sortable: true, render: (v) => <span className="text-[12.5px] font-medium tabular-nums text-foreground">${v.totalPurchases.toLocaleString()}</span> },
    {
      key: "outstandingBalance", header: "Outstanding", width: "w-[110px]", sortable: true, render: (v) => (
        <span className={`text-[12.5px] font-medium tabular-nums ${v.outstandingBalance > 0 ? "text-rose-600 dark:text-rose-400" : "text-muted-foreground"}`}>
          ${v.outstandingBalance.toLocaleString()}
        </span>
      ),
    },
    { key: "status", header: "Status", width: "w-[100px]", sortable: true, render: (v) => <BillingStatusBadge status={v.status} /> },
  ];

  return (
    <PremiumDataTable
      columns={columns}
      rows={vendors}
      rowKey={(v) => v.id}
      selectable
      selectedKeys={selected}
      onSelectionChange={onSelectionChange}
      sortField={sortField}
      sortDir={sortDir}
      onSort={onSort}
      emptyIcon={Truck}
      emptyTitle="No vendors found"
      emptyDescription={hasActiveFilter ? "Try adjusting your search or filters." : "No vendors have been added yet."}
      emptyAction={hasActiveFilter ? <Button variant="outline" size="sm" onClick={onResetFilters}>Clear filters</Button> : undefined}
      pagination={pagination}
      bulkActions={(_count, clear) => (
        <>
          <Button variant="ghost" size="sm" className="ml-auto text-muted-foreground" onClick={clear}>Deselect all</Button>
        </>
      )}
      rowActions={(vendor) => (
        <RowActionMenu
          entityLabel="vendor"
          onView={() => toast.info(`Viewing ${vendor.vendorName}`)}
          onEdit={() => toast.info(`Editing ${vendor.vendorName}`)}
        />
      )}
    />
  );
}
