import { useEffect, useState } from "react";
import {
  ChevronLeft, ChevronRight, Download, Eye, FilePen, Printer, Receipt, SearchX, X, MoreVertical,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import { BillingStatusBadge } from "@/components/billing/BillingStatusBadge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { Invoice } from "@/data/billingData";

const PAGE_SIZE = 10;
export type InvoiceAction = "view" | "edit" | "record-payment" | "print" | "download" | "cancel";

export function InvoicesTable({
  invoices,
  onAction,
}: {
  invoices: Invoice[];
  onAction: (invoice: Invoice, action: InvoiceAction) => void;
}) {
  const navigate = useNavigate();
  const [page, setPage] = useState(0);
  const pageCount = Math.max(1, Math.ceil(invoices.length / PAGE_SIZE));
  useEffect(() => { setPage(0); }, [invoices.length]);

  const start = page * PAGE_SIZE;
  const rows = invoices.slice(start, start + PAGE_SIZE);

  if (invoices.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 rounded-2xl border border-border/60 bg-card py-16 text-center shadow-sm">
        <SearchX className="h-6 w-6 text-muted-foreground/50" />
        <p className="text-[13px] font-medium text-foreground">No invoices match your filters</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-border/60 bg-card shadow-sm">
      <Table>
        <TableHeader className="bg-muted/40">
          <TableRow className="hover:bg-transparent">
            <TableHead className="text-[11px]">Invoice No</TableHead>
            <TableHead className="text-[11px]">Student / Parent</TableHead>
            <TableHead className="text-[11px]">Class</TableHead>
            <TableHead className="text-[11px]">Fee Type</TableHead>
            <TableHead className="text-[11px]">Issue Date</TableHead>
            <TableHead className="text-[11px]">Due Date</TableHead>
            <TableHead className="text-[11px]">Amount</TableHead>
            <TableHead className="text-[11px]">Paid</TableHead>
            <TableHead className="text-[11px]">Balance</TableHead>
            <TableHead className="text-[11px]">Status</TableHead>
            <TableHead className="text-[11px]">Method</TableHead>
            <TableHead className="w-9 text-[11px]" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((inv, i) => (
            <TableRow key={inv.id} className="t-content-in cursor-pointer" style={{ animationDelay: `${i * 25}ms` }}
              onClick={() => navigate(`/billing/invoices/${inv.id}`)}>
              <TableCell className="font-mono text-[12px] font-medium text-foreground">{inv.invoiceNo}</TableCell>
              <TableCell>
                <p className="text-[12.5px] font-medium text-foreground">{inv.studentName}</p>
                <p className="text-[11px] text-muted-foreground">{inv.parentName}</p>
              </TableCell>
              <TableCell className="text-[12px] text-muted-foreground">{inv.className} – {inv.section}</TableCell>
              <TableCell className="max-w-[150px] truncate text-[12px] text-muted-foreground">{inv.feeType}</TableCell>
              <TableCell className="whitespace-nowrap text-[12px] text-muted-foreground">{inv.issueDate}</TableCell>
              <TableCell className="whitespace-nowrap text-[12px] text-muted-foreground">{inv.dueDate}</TableCell>
              <TableCell className="text-[12.5px] font-medium tabular-nums text-foreground">${inv.amount.toLocaleString()}</TableCell>
              <TableCell className="text-[12.5px] tabular-nums text-emerald-600 dark:text-emerald-400">${inv.paid.toLocaleString()}</TableCell>
              <TableCell className="text-[12.5px] font-medium tabular-nums text-rose-600 dark:text-rose-400">${inv.balance.toLocaleString()}</TableCell>
              <TableCell><BillingStatusBadge status={inv.status} /></TableCell>
              <TableCell className="text-[12px] text-muted-foreground">{inv.paymentMethod ?? "—"}</TableCell>
              <TableCell className="px-2" onClick={(e) => e.stopPropagation()}>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground"><MoreVertical className="h-4 w-4" /></Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-44">
                    <DropdownMenuItem onClick={() => onAction(inv, "view")}><Eye className="h-3.5 w-3.5" /> View</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onAction(inv, "edit")}><FilePen className="h-3.5 w-3.5" /> Edit</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onAction(inv, "record-payment")}><Receipt className="h-3.5 w-3.5" /> Record Payment</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onAction(inv, "print")}><Printer className="h-3.5 w-3.5" /> Print</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onAction(inv, "download")}><Download className="h-3.5 w-3.5" /> Download</DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="text-destructive" onClick={() => onAction(inv, "cancel")}><X className="h-3.5 w-3.5" /> Cancel</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border/50 px-4 py-3">
        <span className="text-[12px] text-muted-foreground">Showing {start + 1}–{Math.min(start + PAGE_SIZE, invoices.length)} of {invoices.length}</span>
        <div className="flex items-center gap-2">
          <span className="text-[12px] text-muted-foreground">Page {page + 1} of {pageCount}</span>
          <Button variant="outline" size="icon" className="h-7 w-7" disabled={page === 0} onClick={() => setPage((p) => p - 1)}><ChevronLeft className="h-3.5 w-3.5" /></Button>
          <Button variant="outline" size="icon" className="h-7 w-7" disabled={page >= pageCount - 1} onClick={() => setPage((p) => p + 1)}><ChevronRight className="h-3.5 w-3.5" /></Button>
        </div>
      </div>
    </div>
  );
}
