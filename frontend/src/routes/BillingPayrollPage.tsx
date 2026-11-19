import { useMemo, useState } from "react";
import { BadgeCheck, Banknote, Printer, RefreshCw, Trash2, UserPlus } from "lucide-react";
import { toast } from "sonner";

import { BillingStatusBadge } from "@/components/billing/BillingStatusBadge";
import { PayrollForm } from "@/components/billing/forms/PayrollForm";
import { PayrollSummaryCards } from "@/components/billing/PayrollSummaryCards";
import { PayrollTable, type PayrollAction } from "@/components/billing/PayrollTable";
import { PayrollToolbar, type PayrollFilters } from "@/components/billing/PayrollToolbar";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { PageHeader } from "@/components/ui/PageHeader";
import { PremiumCard } from "@/components/ui/PremiumCard";
import { PremiumEmptyState } from "@/components/ui/PremiumEmptyState";
import { PremiumSelect } from "@/components/ui/PremiumSelect";
import { PremiumSkeleton } from "@/components/ui/PremiumSkeleton";
import type { Payroll } from "@/api/types/billing";
import {
  monthLabel, useAdjustPayslip, useDeletePayrollRun, useMoney, usePayrollAction, usePayrollRuns, usePayslips,
} from "@/api/billing";
import { useLetterhead } from "@/api/classes";
import { errorMessage } from "@/api/http";
import { useAuth } from "@/lib/auth";

const PAGE_SIZE = 10;
type SortField = "employeeId" | "staffName" | "department" | "basicSalary" | "netSalary" | "status";
type SortDir = "asc" | "desc";

const EMPTY_FILTERS: PayrollFilters = { search: "", status: "all" };

export function BillingPayrollPage() {
  const { hasPermission } = useAuth();
  const canManage = hasPermission("payroll.manage");
  const canApprove = hasPermission("payroll.approve");
  const letterhead = useLetterhead();
  const runs = usePayrollRuns();
  const [runId, setRunId] = useState("");
  const run = (runs.data ?? []).find((r) => r.id === runId) ?? runs.data?.[0];
  const slips = usePayslips(run?.id);
  const payroll = useMemo(() => slips.data?.payslips ?? [], [slips.data]);
  const action = usePayrollAction();
  const removeRun = useDeletePayrollRun();
  const adjust = useAdjustPayslip();
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
      if (q && !`${p.employeeId} ${p.staffName} ${p.department}`.toLowerCase().includes(q)) return false;
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

  const fail = (e: unknown) => toast.error(errorMessage(e));

  function handleAction(row: Payroll, act: PayrollAction) {
    if (act === "payslip") { setPayslip(row); return; }
    const bonus = window.prompt(`Bonus for ${row.staffName}:`, String(row.bonus));
    if (bonus === null) return;
    const other = window.prompt(`Extra deduction for ${row.staffName}:`, String(row.otherDeduction));
    if (other === null) return;
    if (!(Number(bonus) >= 0) || !(Number(other) >= 0)) { toast.error("Amounts can't be negative."); return; }
    const note = window.prompt("Note on the payslip (optional):", row.note) ?? row.note;
    adjust.mutate({ runId: row.runId, id: row.id, bonus, otherDeduction: other, note },
      { onSuccess: () => toast.success("Payslip updated."), onError: fail });
  }

  function runAction(kind: "approve" | "pay" | "generate" | "delete") {
    if (!run) return;
    const label = monthLabel(run.month);
    const confirmText = {
      approve: `Approve payroll for ${label}? Payslips can't be changed after this.`,
      pay: `Release salaries for ${label}? This records a paid salary expense for every payslip.`,
      generate: `Regenerate payslips for ${label}? Bonuses and deductions you entered are recalculated.`,
      delete: `Delete the draft payroll for ${label}?`,
    }[kind];
    if (!window.confirm(confirmText)) return;
    if (kind === "delete") {
      removeRun.mutate(run.id, { onSuccess: () => { setRunId(""); toast.success("Draft payroll deleted."); }, onError: fail });
      return;
    }
    action.mutate({ id: run.id, action: kind }, {
      onSuccess: () => toast.success({ approve: "Payroll approved.", pay: "Salaries released.", generate: "Payslips regenerated." }[kind]),
      onError: fail,
    });
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
        description="Monthly payroll runs: generate, adjust, approve (by someone other than the preparer) and pay."
        actions={canManage ? (
          <Button size="sm" className="h-9 gap-1.5 rounded-xl" onClick={() => setGenerateOpen(true)}>
            <UserPlus className="h-4 w-4" /> Generate Payroll
          </Button>
        ) : undefined}
      />

      {runs.isError && <PremiumEmptyState title="Couldn't load payroll" description={errorMessage(runs.error)} />}
      {runs.isLoading && <PremiumSkeleton className="h-72 w-full rounded-2xl" />}
      {runs.isSuccess && !run && (
        <PremiumEmptyState title="No payroll runs yet"
          description="Generate payroll for a month. Teachers need a salary structure (set on their profile) to be included." />
      )}
      {run && (<>
      <PremiumCard className="flex flex-wrap items-center gap-3 p-4">
        <PremiumSelect value={run.id} onChange={setRunId} className="w-52"
          options={(runs.data ?? []).map((r) => ({ value: r.id, label: `${monthLabel(r.month)} · ${r.status}` }))} />
        <BillingStatusBadge status={run.status} />
        <span className="text-[12px] text-muted-foreground">
          {run.workingDays} working days
          {run.approvedBy ? ` · approved by ${run.approvedBy}` : ""}
          {run.paidAt ? ` · paid ${run.paidAt.slice(0, 10)}` : ""}
        </span>
        <div className="ml-auto flex flex-wrap gap-2">
          {run.status === "Draft" && canManage && (<>
            <Button size="sm" variant="outline" className="h-8 gap-1.5 text-[12px]" disabled={action.isPending} onClick={() => runAction("generate")}>
              <RefreshCw className="h-3.5 w-3.5" /> Regenerate
            </Button>
            <Button size="sm" variant="outline" className="h-8 gap-1.5 text-[12px] text-rose-600" disabled={removeRun.isPending} onClick={() => runAction("delete")}>
              <Trash2 className="h-3.5 w-3.5" /> Delete
            </Button>
          </>)}
          {run.status === "Draft" && canApprove && (
            <Button size="sm" className="h-8 gap-1.5 text-[12px]" disabled={action.isPending} onClick={() => runAction("approve")}>
              <BadgeCheck className="h-3.5 w-3.5" /> Approve
            </Button>
          )}
          {run.status === "Approved" && canApprove && (
            <Button size="sm" className="h-8 gap-1.5 text-[12px]" disabled={action.isPending} onClick={() => runAction("pay")}>
              <Banknote className="h-3.5 w-3.5" /> Pay Salaries
            </Button>
          )}
        </div>
      </PremiumCard>

      {slips.isLoading && <PremiumSkeleton className="h-60 w-full rounded-2xl" />}
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
        canAdjust={canManage}
      />
      </>)}

      <Dialog open={generateOpen} onOpenChange={setGenerateOpen}>
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Generate Payroll</DialogTitle>
            <DialogDescription>Create a draft payroll run for a month.</DialogDescription>
          </DialogHeader>
          <PayrollForm onCancel={() => setGenerateOpen(false)} onSaved={(id) => { setGenerateOpen(false); setRunId(id); }} />
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
                  <h1 className="text-base font-bold text-foreground">{letterhead.name}</h1>
                  {letterhead.address && <p className="text-[11px] text-muted-foreground">{letterhead.address}</p>}
                  <p className="text-[11px] text-muted-foreground">Salary Payslip — {monthLabel(payslip.month)}</p>
                </div>
                <div className="grid grid-cols-2 gap-2 py-4">
                  <Row label="Employee ID" value={payslip.employeeId} />
                  <Row label="Staff Name" value={payslip.staffName} />
                  <Row label="Department" value={payslip.department || "—"} />
                  <Row label="Payment Method" value={payslip.paymentMethod || "—"} />
                  <Row label="Absent Days" value={String(payslip.absentDays)} />
                  <Row label="Paid On" value={run?.paidAt?.slice(0, 10) ?? "Not yet paid"} />
                </div>
                <div className="space-y-1.5 border-t border-border/40 py-4">
                  <SumRow label="Basic Salary" value={payslip.basicSalary} />
                  <SumRow label="Allowance" value={payslip.allowance} tone="green" />
                  <SumRow label="Bonus" value={payslip.bonus} tone="green" />
                  <SumRow label="Attendance Deduction" value={-payslip.attendanceDeduction} tone="red" />
                  <SumRow label="Provident Fund" value={-payslip.providentFund} tone="red" />
                  <SumRow label="Tax" value={-payslip.taxDeduction} tone="red" />
                  <SumRow label="Other Deduction" value={-payslip.otherDeduction} tone="red" />
                  <div className="my-1 border-t border-border/40" />
                  <SumRow label="Net Salary" value={payslip.netSalary} bold />
                </div>
                {payslip.note && <p className="border-t border-border/40 py-2 text-[11px] text-muted-foreground">Note: {payslip.note}</p>}
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
  const money = useMoney();
  return (
    <div className={`flex items-center justify-between ${bold ? "font-bold" : ""}`}>
      <span className="text-muted-foreground">{label}</span>
      <span className={tone === "green" ? "text-emerald-600" : tone === "red" ? "text-rose-600" : "text-foreground"}>
        {value < 0 ? "-" : ""}{money(Math.abs(value))}
      </span>
    </div>
  );
}
