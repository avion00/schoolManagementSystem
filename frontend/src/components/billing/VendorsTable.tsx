import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Eye, MoreVertical, Pencil, SearchX } from "lucide-react";
import { toast } from "sonner";

import { BillingStatusBadge } from "@/components/billing/BillingStatusBadge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { Vendor } from "@/data/billingData";

const PAGE_SIZE = 10;

export function VendorsTable({ vendors }: { vendors: Vendor[] }) {
  const [page, setPage] = useState(0);
  const pageCount = Math.max(1, Math.ceil(vendors.length / PAGE_SIZE));
  useEffect(() => { setPage(0); }, [vendors.length]);
  const start = page * PAGE_SIZE;
  const rows = vendors.slice(start, start + PAGE_SIZE);

  if (vendors.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 rounded-2xl border border-border/60 bg-card py-16 text-center shadow-sm">
        <SearchX className="h-6 w-6 text-muted-foreground/50" />
        <p className="text-[13px] font-medium text-foreground">No vendors match your filters</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-border/60 bg-card shadow-sm">
      <Table>
        <TableHeader className="bg-muted/40">
          <TableRow className="hover:bg-transparent">
            <TableHead className="text-[11px]">Vendor ID</TableHead>
            <TableHead className="text-[11px]">Vendor Name</TableHead>
            <TableHead className="text-[11px]">Category</TableHead>
            <TableHead className="text-[11px]">Contact Person</TableHead>
            <TableHead className="text-[11px]">Phone</TableHead>
            <TableHead className="text-[11px]">Email</TableHead>
            <TableHead className="text-[11px]">Total Purchases</TableHead>
            <TableHead className="text-[11px]">Outstanding</TableHead>
            <TableHead className="text-[11px]">Status</TableHead>
            <TableHead className="w-9 text-[11px]" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((v, i) => (
            <TableRow key={v.id} className="t-content-in" style={{ animationDelay: `${i * 25}ms` }}>
              <TableCell className="font-mono text-[12px] font-medium text-foreground">{v.vendorId}</TableCell>
              <TableCell className="text-[12.5px] font-medium text-foreground">{v.vendorName}</TableCell>
              <TableCell className="text-[12px] text-muted-foreground">{v.category}</TableCell>
              <TableCell className="text-[12px] text-muted-foreground">{v.contactPerson}</TableCell>
              <TableCell className="whitespace-nowrap text-[12px] text-muted-foreground">{v.phone}</TableCell>
              <TableCell className="text-[12px] text-muted-foreground">{v.email}</TableCell>
              <TableCell className="text-[12.5px] font-medium tabular-nums text-foreground">${v.totalPurchases.toLocaleString()}</TableCell>
              <TableCell className={`text-[12.5px] font-medium tabular-nums ${v.outstandingBalance > 0 ? "text-rose-600 dark:text-rose-400" : "text-muted-foreground"}`}>
                ${v.outstandingBalance.toLocaleString()}
              </TableCell>
              <TableCell><BillingStatusBadge status={v.status} /></TableCell>
              <TableCell className="px-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground"><MoreVertical className="h-4 w-4" /></Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-36">
                    <DropdownMenuItem onClick={() => toast.info(`Viewing ${v.vendorName}`)}><Eye className="h-3.5 w-3.5" /> View</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => toast.info(`Editing ${v.vendorName}`)}><Pencil className="h-3.5 w-3.5" /> Edit</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border/50 px-4 py-3">
        <span className="text-[12px] text-muted-foreground">Showing {start + 1}–{Math.min(start + PAGE_SIZE, vendors.length)} of {vendors.length}</span>
        <div className="flex items-center gap-2">
          <span className="text-[12px] text-muted-foreground">Page {page + 1} of {pageCount}</span>
          <Button variant="outline" size="icon" className="h-7 w-7" disabled={page === 0} onClick={() => setPage((p) => p - 1)}><ChevronLeft className="h-3.5 w-3.5" /></Button>
          <Button variant="outline" size="icon" className="h-7 w-7" disabled={page >= pageCount - 1} onClick={() => setPage((p) => p + 1)}><ChevronRight className="h-3.5 w-3.5" /></Button>
        </div>
      </div>
    </div>
  );
}
