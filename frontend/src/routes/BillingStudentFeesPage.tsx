import { useMemo, useState } from "react";
import { Pencil, Plus, Settings2, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

import { FeeStatement } from "@/components/billing/FeeStatement";
import { FeeStructureForm } from "@/components/billing/forms/FeeStructureForm";
import { InvoiceForm } from "@/components/billing/forms/InvoiceForm";
import { PaymentForm } from "@/components/billing/forms/PaymentForm";
import { StudentFeesSummaryCards } from "@/components/billing/StudentFeesSummaryCards";
import { StudentFeesTable, type StudentFeeAction } from "@/components/billing/StudentFeesTable";
import { StudentFeesToolbar, type StudentFeesFilters } from "@/components/billing/StudentFeesToolbar";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { PageHeader } from "@/components/ui/PageHeader";
import { PremiumCard } from "@/components/ui/PremiumCard";
import { PremiumEmptyState } from "@/components/ui/PremiumEmptyState";
import { PremiumSkeleton } from "@/components/ui/PremiumSkeleton";
import { useDeleteStructure, useFeeStructures, useMoney, useStudentFees } from "@/api/billing";
import { errorMessage } from "@/api/http";
import type { FeeStructure, StudentFee } from "@/api/types/billing";
import { useAuth } from "@/lib/auth";

const PAGE_SIZE = 10;
type SortField = "studentName" | "className" | "totalFee" | "paid" | "due" | "status" | "nextDueDate";
type SortDir = "asc" | "desc";

const EMPTY_FILTERS: StudentFeesFilters = { search: "", className: "all", section: "all", status: "all" };

export function BillingStudentFeesPage() {
  const navigate = useNavigate();
  const money = useMoney();
  const { hasPermission } = useAuth();
  const feesQuery = useStudentFees();
  const STUDENT_FEES = useMemo(() => feesQuery.data ?? [], [feesQuery.data]);
  const structuresQuery = useFeeStructures();
  const feeStructures = structuresQuery.data ?? [];
  const deleteStructure = useDeleteStructure();
  const [structureForm, setStructureForm] = useState<{ open: boolean; structure?: FeeStructure }>({ open: false });
  const [dialog, setDialog] = useState<{ kind: "invoice" | "payment" | "statement"; row: StudentFee } | null>(null);
  const [filters, setFilters] = useState<StudentFeesFilters>(EMPTY_FILTERS);
  const [sortField, setSortField] = useState<SortField>("studentName");
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<Set<string | number>>(new Set());

  const sections = useMemo(() => Array.from(new Set(STUDENT_FEES.map((s) => s.section).filter(Boolean))).sort(), [STUDENT_FEES]);
  const classes = useMemo(() => Array.from(new Set(STUDENT_FEES.map((s) => s.className))), [STUDENT_FEES]);

  function updateFilters(next: Partial<StudentFeesFilters>) {
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

  const hasActiveFilter = !!filters.search || filters.className !== "all" || filters.section !== "all" || filters.status !== "all";

  const filtered = useMemo(() => {
    const q = filters.search.trim().toLowerCase();
    return STUDENT_FEES.filter((s) => {
      if (filters.className !== "all" && s.className !== filters.className) return false;
      if (filters.section !== "all" && s.section !== filters.section) return false;
      if (filters.status !== "all" && s.status !== filters.status) return false;
      if (q && !`${s.studentName} ${s.admissionNo} ${s.registrationNo}`.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [filters, STUDENT_FEES]);

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
  const paginated: StudentFee[] = sorted.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  function handleAction(row: StudentFee, action: StudentFeeAction) {
    switch (action) {
      case "view": navigate(`/students/${row.studentId}`); break;
      case "generate-invoice": setDialog({ kind: "invoice", row }); break;
      case "record-payment": setDialog({ kind: "payment", row }); break;
      case "print-statement": setDialog({ kind: "statement", row }); break;
    }
  }

  return (
    <div className="space-y-4">
      <PageHeader
        title={
          <>
            {sorted.length} student{sorted.length !== 1 ? "s" : ""}{" "}
            {hasActiveFilter && (
              <span className="text-base font-normal text-muted-foreground">(filtered from {STUDENT_FEES.length} total)</span>
            )}
          </>
        }
        description="Track student fee balances, discounts, and due dates."
      />

      {feesQuery.isError && (
        <PremiumEmptyState title="Couldn't load student fees" description={errorMessage(feesQuery.error)}
          action={<Button size="sm" variant="outline" onClick={() => feesQuery.refetch()}>Try again</Button>} />
      )}
      {feesQuery.isLoading && <PremiumSkeleton className="h-72 w-full rounded-2xl" />}

      {feesQuery.isSuccess && (<>
      <StudentFeesSummaryCards studentFees={STUDENT_FEES} />

      <PremiumCard className="p-4">
        <div className="flex flex-row items-center justify-between gap-3">
          <p className="flex items-center gap-1.5 text-[13px] font-semibold text-foreground">
            <Settings2 className="h-4 w-4 text-muted-foreground" /> Fee Structures
          </p>
          {hasPermission("fee.create") && (
          <Button size="sm" variant="outline" className="h-7 gap-1.5 text-[11.5px]" onClick={() => setStructureForm({ open: true })}>
            <Plus className="h-3.5 w-3.5" /> Add Fee Structure
          </Button>
          )}
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {structuresQuery.isSuccess && feeStructures.length === 0 && (
            <p className="text-[12px] text-muted-foreground">No fee structures yet. They are used to bill whole classes from the Invoices page.</p>
          )}
          {feeStructures.map((f) => (
            <span key={f.id} className="inline-flex items-center gap-1.5 rounded-full bg-muted px-3 py-1 text-[11.5px] text-foreground">
              {f.name} — {f.className} · {money(f.amount)} / {f.frequency}
              {hasPermission("fee.create") && (<>
                <button type="button" title="Edit" onClick={() => setStructureForm({ open: true, structure: f })}
                  className="text-muted-foreground hover:text-foreground"><Pencil className="h-3 w-3" /></button>
                <button type="button" title="Delete" className="text-muted-foreground hover:text-rose-600" onClick={() => {
                  if (!window.confirm(`Delete the fee structure "${f.name}"? Existing invoices are not affected.`)) return;
                  deleteStructure.mutate(f.id, { onError: (e) => toast.error(errorMessage(e)), onSuccess: () => toast.success("Fee structure deleted.") });
                }}><X className="h-3 w-3" /></button>
              </>)}
            </span>
          ))}
        </div>
      </PremiumCard>

      <StudentFeesToolbar filters={filters} onFiltersChange={updateFilters} hasActiveFilter={hasActiveFilter} onReset={resetFilters} sections={sections} classes={classes} />

      <StudentFeesTable
        studentFees={paginated}
        onAction={handleAction}
        sortField={sortField}
        sortDir={sortDir}
        onSort={handleSort}
        selected={selected}
        onSelectionChange={setSelected}
        pagination={{ page: safePage, pageSize: PAGE_SIZE, total: sorted.length, onPage: (p) => { setPage(p); setSelected(new Set()); }, itemLabel: "students" }}
        hasActiveFilter={hasActiveFilter}
        onResetFilters={resetFilters}
      />
      </>)}

      <Dialog open={structureForm.open} onOpenChange={(o) => !o && setStructureForm({ open: false })}>
        <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{structureForm.structure ? "Edit Fee Structure" : "Add Fee Structure"}</DialogTitle>
            <DialogDescription>A fee charged per class (or all classes) for an academic year.</DialogDescription>
          </DialogHeader>
          <FeeStructureForm key={structureForm.structure?.id ?? "new"} structure={structureForm.structure}
            onCancel={() => setStructureForm({ open: false })} onSaved={() => setStructureForm({ open: false })} />
        </DialogContent>
      </Dialog>

      <Dialog open={!!dialog} onOpenChange={(o) => !o && setDialog(null)}>
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {dialog?.kind === "invoice" ? "Create Invoice" : dialog?.kind === "payment" ? "Record Payment" : "Fee Statement"}
            </DialogTitle>
            <DialogDescription>{dialog?.row.studentName} · {dialog?.row.admissionNo}</DialogDescription>
          </DialogHeader>
          {dialog?.kind === "invoice" && (
            <InvoiceForm defaultStudentId={dialog.row.studentId} onCancel={() => setDialog(null)}
              onSaved={(id) => { setDialog(null); navigate(`/billing/invoices/${id}`); }} />
          )}
          {dialog?.kind === "payment" && (
            <PaymentForm studentId={dialog.row.studentId} onCancel={() => setDialog(null)}
              onSaved={(id) => { setDialog(null); navigate(`/billing/receipts/${id}`); }} />
          )}
          {dialog?.kind === "statement" && <FeeStatement studentId={dialog.row.studentId} />}
        </DialogContent>
      </Dialog>
    </div>
  );
}
