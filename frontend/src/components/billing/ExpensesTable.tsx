import { useEffect, useState } from "react";
import { CheckCircle2, ChevronLeft, ChevronRight, Eye, MoreVertical, SearchX, X } from "lucide-react";

import { BillingStatusBadge } from "@/components/billing/BillingStatusBadge";
import { PaymentMethodBadge } from "@/components/billing/PaymentMethodBadge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { Expense } from "@/data/billingData";

const PAGE_SIZE = 10;
export type ExpenseAction = "view" | "approve" | "reject";

export function ExpensesTable({
  expenses,
  onAction,
}: {
  expenses: Expense[];
  onAction: (expense: Expense, action: ExpenseAction) => void;
}) {
  const [page, setPage] = useState(0);
  const pageCount = Math.max(1, Math.ceil(expenses.length / PAGE_SIZE));
  useEffect(() => { setPage(0); }, [expenses.length]);
  const start = page * PAGE_SIZE;
  const rows = expenses.slice(start, start + PAGE_SIZE);

  if (expenses.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 rounded-2xl border border-border/60 bg-card py-16 text-center shadow-sm">
        <SearchX className="h-6 w-6 text-muted-foreground/50" />
        <p className="text-[13px] font-medium text-foreground">No expenses match your filters</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-border/60 bg-card shadow-sm">
      <Table>
        <TableHeader className="bg-muted/40">
          <TableRow className="hover:bg-transparent">
            <TableHead className="text-[11px]">Expense ID</TableHead>
            <TableHead className="text-[11px]">Category</TableHead>
            <TableHead className="text-[11px]">Vendor / Paid To</TableHead>
            <TableHead className="text-[11px]">Description</TableHead>
            <TableHead className="text-[11px]">Amount</TableHead>
            <TableHead className="text-[11px]">Method</TableHead>
            <TableHead className="text-[11px]">Date</TableHead>
            <TableHead className="text-[11px]">Approved By</TableHead>
            <TableHead className="text-[11px]">Status</TableHead>
            <TableHead className="w-9 text-[11px]" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((e, i) => (
            <TableRow key={e.id} className="t-content-in" style={{ animationDelay: `${i * 25}ms` }}>
              <TableCell className="font-mono text-[12px] font-medium text-foreground">{e.expenseId}</TableCell>
              <TableCell className="text-[12px] text-muted-foreground">{e.category}</TableCell>
              <TableCell className="text-[12.5px] font-medium text-foreground">{e.vendor}</TableCell>
              <TableCell className="max-w-[220px] truncate text-[12px] text-muted-foreground">{e.description}</TableCell>
              <TableCell className="text-[12.5px] font-semibold tabular-nums text-rose-600 dark:text-rose-400">${e.amount.toLocaleString()}</TableCell>
              <TableCell><PaymentMethodBadge method={e.paymentMethod} /></TableCell>
              <TableCell className="whitespace-nowrap text-[12px] text-muted-foreground">{e.date}</TableCell>
              <TableCell className="text-[12px] text-muted-foreground">{e.approvedBy}</TableCell>
              <TableCell><BillingStatusBadge status={e.status} /></TableCell>
              <TableCell className="px-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground"><MoreVertical className="h-4 w-4" /></Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-40">
                    <DropdownMenuItem onClick={() => onAction(e, "view")}><Eye className="h-3.5 w-3.5" /> View</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onAction(e, "approve")}><CheckCircle2 className="h-3.5 w-3.5" /> Approve</DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="text-destructive" onClick={() => onAction(e, "reject")}><X className="h-3.5 w-3.5" /> Reject</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border/50 px-4 py-3">
        <span className="text-[12px] text-muted-foreground">Showing {start + 1}–{Math.min(start + PAGE_SIZE, expenses.length)} of {expenses.length}</span>
        <div className="flex items-center gap-2">
          <span className="text-[12px] text-muted-foreground">Page {page + 1} of {pageCount}</span>
          <Button variant="outline" size="icon" className="h-7 w-7" disabled={page === 0} onClick={() => setPage((p) => p - 1)}><ChevronLeft className="h-3.5 w-3.5" /></Button>
          <Button variant="outline" size="icon" className="h-7 w-7" disabled={page >= pageCount - 1} onClick={() => setPage((p) => p + 1)}><ChevronRight className="h-3.5 w-3.5" /></Button>
        </div>
      </div>
    </div>
  );
}
