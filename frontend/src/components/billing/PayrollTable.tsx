import { useEffect, useState } from "react";
import { CheckCircle2, ChevronLeft, ChevronRight, Eye, MoreVertical, Printer, SearchX } from "lucide-react";

import { BillingStatusBadge } from "@/components/billing/BillingStatusBadge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { Payroll } from "@/data/billingData";

const PAGE_SIZE = 10;
export type PayrollAction = "view" | "payslip" | "mark-paid" | "print-payslip";

export function PayrollTable({
  payroll,
  onAction,
}: {
  payroll: Payroll[];
  onAction: (row: Payroll, action: PayrollAction) => void;
}) {
  const [page, setPage] = useState(0);
  const pageCount = Math.max(1, Math.ceil(payroll.length / PAGE_SIZE));
  useEffect(() => { setPage(0); }, [payroll.length]);
  const start = page * PAGE_SIZE;
  const rows = payroll.slice(start, start + PAGE_SIZE);

  if (payroll.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 rounded-2xl border border-border/60 bg-card py-16 text-center shadow-sm">
        <SearchX className="h-6 w-6 text-muted-foreground/50" />
        <p className="text-[13px] font-medium text-foreground">No payroll records match your filters</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-border/60 bg-card shadow-sm">
      <Table>
        <TableHeader className="bg-muted/40">
          <TableRow className="hover:bg-transparent">
            <TableHead className="text-[11px]">Employee ID</TableHead>
            <TableHead className="text-[11px]">Staff Name</TableHead>
            <TableHead className="text-[11px]">Role</TableHead>
            <TableHead className="text-[11px]">Department</TableHead>
            <TableHead className="text-[11px]">Basic</TableHead>
            <TableHead className="text-[11px]">Allowance</TableHead>
            <TableHead className="text-[11px]">Deduction</TableHead>
            <TableHead className="text-[11px]">Net Salary</TableHead>
            <TableHead className="text-[11px]">Month</TableHead>
            <TableHead className="text-[11px]">Status</TableHead>
            <TableHead className="text-[11px]">Payment Date</TableHead>
            <TableHead className="w-9 text-[11px]" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((p, i) => (
            <TableRow key={p.id} className="t-content-in" style={{ animationDelay: `${i * 25}ms` }}>
              <TableCell className="font-mono text-[12px] font-medium text-foreground">{p.employeeId}</TableCell>
              <TableCell className="text-[12.5px] font-medium text-foreground">{p.staffName}</TableCell>
              <TableCell className="text-[12px] text-muted-foreground">{p.role}</TableCell>
              <TableCell className="text-[12px] text-muted-foreground">{p.department}</TableCell>
              <TableCell className="text-[12px] tabular-nums text-muted-foreground">${p.basicSalary.toLocaleString()}</TableCell>
              <TableCell className="text-[12px] tabular-nums text-emerald-600 dark:text-emerald-400">+${p.allowance.toLocaleString()}</TableCell>
              <TableCell className="text-[12px] tabular-nums text-rose-600 dark:text-rose-400">-${p.deduction.toLocaleString()}</TableCell>
              <TableCell className="text-[12.5px] font-semibold tabular-nums text-foreground">${p.netSalary.toLocaleString()}</TableCell>
              <TableCell className="whitespace-nowrap text-[12px] text-muted-foreground">{p.month}</TableCell>
              <TableCell><BillingStatusBadge status={p.status} /></TableCell>
              <TableCell className="whitespace-nowrap text-[12px] text-muted-foreground">{p.paymentDate ?? "—"}</TableCell>
              <TableCell className="px-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground"><MoreVertical className="h-4 w-4" /></Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-44">
                    <DropdownMenuItem onClick={() => onAction(p, "view")}><Eye className="h-3.5 w-3.5" /> View</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onAction(p, "payslip")}><Eye className="h-3.5 w-3.5" /> Generate Payslip</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onAction(p, "print-payslip")}><Printer className="h-3.5 w-3.5" /> Print Payslip</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onAction(p, "mark-paid")}><CheckCircle2 className="h-3.5 w-3.5" /> Mark Paid</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border/50 px-4 py-3">
        <span className="text-[12px] text-muted-foreground">Showing {start + 1}–{Math.min(start + PAGE_SIZE, payroll.length)} of {payroll.length}</span>
        <div className="flex items-center gap-2">
          <span className="text-[12px] text-muted-foreground">Page {page + 1} of {pageCount}</span>
          <Button variant="outline" size="icon" className="h-7 w-7" disabled={page === 0} onClick={() => setPage((p) => p - 1)}><ChevronLeft className="h-3.5 w-3.5" /></Button>
          <Button variant="outline" size="icon" className="h-7 w-7" disabled={page >= pageCount - 1} onClick={() => setPage((p) => p + 1)}><ChevronRight className="h-3.5 w-3.5" /></Button>
        </div>
      </div>
    </div>
  );
}
