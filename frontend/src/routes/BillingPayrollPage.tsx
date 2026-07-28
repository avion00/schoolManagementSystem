import { useMemo, useState } from "react";
import { Printer, UserPlus } from "lucide-react";
import { toast } from "sonner";

import { BillingStatusBadge } from "@/components/billing/BillingStatusBadge";
import { PayrollForm, type PayrollFormData } from "@/components/billing/forms/PayrollForm";
import { PayrollSummaryCards } from "@/components/billing/PayrollSummaryCards";
import { PayrollTable, type PayrollAction } from "@/components/billing/PayrollTable";
import { PayrollToolbar, type PayrollFilters } from "@/components/billing/PayrollToolbar";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { PageHeader } from "@/components/ui/PageHeader";
import { PAYROLL, type Payroll } from "@/data/billingData";

const PAGE_SIZE = 10;
type SortField = "employeeId" | "staffName" | "role" | "basicSalary" | "netSalary" | "status";
type SortDir = "asc" | "desc";

const EMPTY_FILTERS: PayrollFilters = { search: "", status: "all" };

export function BillingPayrollPage() {
  const [payroll, setPayroll] = useState<Payroll[]>(PAYROLL);
  const [filters, setFilters] = useState<PayrollFilters>(EMPTY_FILTERS);
  const [sortField, setSortField] = useState<SortField>("staffName");
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<Set<string | number>>(new Set());
  const [generateOpen, setGenerateOpen] = useState(false);
  const [payslip, setPayslip] = useState<Payroll | null>(null);

  function updateFilters(next: Partial<PayrollFilters>) {
    setFilters((f) => ({ ...f, ...next }));
    setPage(1);
  }
  function resetFilters() {
    setFilters(EMPTY_FILTERS);
    setPage(1);
  }
  function handleSort(field: string) {
    const f = field as SortField;
    if (sortField === f) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortField(f); setSortDir("asc"); }
    setPage(1);
  }

  const hasActiveFilter = !!filters.search || filters.status !== "all";

  const filtered = useMemo(() => {
    const q = filters.search.trim().toLowerCase();
    return payroll.filter((p) => {
      if (filters.status !== "all" && p.status !== filters.status) return false;
      if (q && !`${p.employeeId} ${p.staffName} ${p.role}`.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [payroll, filters]);

  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      const av: string | number = a[sortField] ?? "";
      const bv: string | number = b[sortField] ?? "";
      if (typeof av === "number" && typeof bv === "number") return sortDir === "asc" ? av - bv : bv - av;
      return sortDir === "asc" ? String(av).localeCompare(String(bv)) : String(bv).localeCompare(String(av));
    });
  }, [filtered, sortField, sortDir]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const paginated: Payroll[] = sorted.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  function handleAction(row: Payroll, action: PayrollAction) {
    if (action === "view" || action === "payslip" || action === "print-payslip") { setPayslip(row); return; }
    if (action === "mark-paid") {
      setPayroll((prev) => prev.map((p) => (p.id === row.id ? { ...p, status: "Paid", paymentDate: new Date().toISOString().slice(0, 10) } : p)));
      console.log("Marked paid:", row.employeeId);
      toast.success(`${row.staffName}'s salary marked as paid.`);
    }
  }

  function handleGenerate(data: PayrollFormData) {
    console.log("Generated payroll:", data);
    toast.success("Payroll generated successfully.");
    setGenerateOpen(false);
  }

  return (
    <div className="space-y-4">
      <PageHeader
        title={
          <>
            {sorted.length} staff record{sorted.length !== 1 ? "s" : ""}{" "}
            {hasActiveFilter && (
              <span className="text-base font-normal text-muted-foreground">(filtered from {payroll.length} total)</span>
            )}
          </>
        }
        description="Manage staff salaries and payroll records."
        actions={
          <Button size="sm" className="h-9 gap-1.5 rounded-xl" onClick={() => setGenerateOpen(true)}>
            <UserPlus className="h-4 w-4" /> Generate Payroll
          </Button>
        }
      />

      <PayrollSummaryCards payroll={payroll} />

      <PayrollToolbar filters={filters} onFiltersChange={updateFilters} hasActiveFilter={hasActiveFilter} onReset={resetFilters} />

      <PayrollTable
        payroll={paginated}
        onAction={handleAction}
        sortField={sortField}
        sortDir={sortDir}
        onSort={handleSort}
        selected={selected}
        onSelectionChange={setSelected}
        pagination={{ page: safePage, pageSize: PAGE_SIZE, total: sorted.length, onPage: (p) => { setPage(p); setSelected(new Set()); }, itemLabel: "staff records" }}
        hasActiveFilter={hasActiveFilter}
        onResetFilters={resetFilters}
      />

      <Dialog open={generateOpen} onOpenChange={setGenerateOpen}>
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Generate Payroll</DialogTitle>
            <DialogDescription>Create a new salary entry for a staff member.</DialogDescription>
          </DialogHeader>
          <PayrollForm onCancel={() => setGenerateOpen(false)} onSubmit={handleGenerate} />
        </DialogContent>
      </Dialog>

      <Dialog open={!!payslip} onOpenChange={(o) => !o && setPayslip(null)}>
        <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto">
          {payslip && (
            <div className="space-y-3">
              <div className="flex justify-end print:hidden">
                <Button size="sm" variant="outline" className="h-8 gap-1.5 text-[12px]" onClick={() => window.print()}>
                  <Printer className="h-3.5 w-3.5" /> Print Payslip
                </Button>
              </div>
              <div id="payslip-print" className="rounded-2xl border border-border/60 bg-white p-6 text-[12px] dark:bg-background">
                <div className="border-b border-border/40 pb-4 text-center">
                  <h1 className="text-base font-bold text-foreground">SchoolOS Academy</h1>
                  <p className="text-[11px] text-muted-foreground">Salary Payslip — {payslip.month}</p>
                </div>
                <div className="grid grid-cols-2 gap-2 py-4">
                  <Row label="Employee ID" value={payslip.employeeId} />
                  <Row label="Staff Name" value={payslip.staffName} />
                  <Row label="Role" value={payslip.role} />
                  <Row label="Department" value={payslip.department} />
                  <Row label="Payment Method" value={payslip.paymentMethod ?? "—"} />
                  <Row label="Payment Date" value={payslip.paymentDate ?? "Not yet paid"} />
                </div>
                <div className="space-y-1.5 border-t border-border/40 py-4">
                  <SumRow label="Basic Salary" value={payslip.basicSalary} />
                  <SumRow label="Allowance" value={payslip.allowance} tone="green" />
                  <SumRow label="Bonus" value={payslip.bonus ?? 0} tone="green" />
                  <SumRow label="Attendance Deduction" value={-(payslip.attendanceDeduction ?? 0)} tone="red" />
                  <SumRow label="Tax / Other Deduction" value={-(payslip.taxDeduction ?? 0)} tone="red" />
                  <div className="my-1 border-t border-border/40" />
                  <SumRow label="Net Salary" value={payslip.netSalary} bold />
                </div>
                <div className="flex items-center justify-between border-t border-border/40 pt-3">
                  <span className="text-[11px] text-muted-foreground">Status</span>
                  <BillingStatusBadge status={payslip.status} />
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-2">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium text-foreground">{value}</span>
    </div>
  );
}

function SumRow({ label, value, bold, tone }: { label: string; value: number; bold?: boolean; tone?: "green" | "red" }) {
  return (
    <div className={`flex items-center justify-between ${bold ? "font-bold" : ""}`}>
      <span className="text-muted-foreground">{label}</span>
      <span className={tone === "green" ? "text-emerald-600" : tone === "red" ? "text-rose-600" : "text-foreground"}>
        {value < 0 ? "-" : ""}${Math.abs(value).toLocaleString()}
      </span>
    </div>
  );
}
