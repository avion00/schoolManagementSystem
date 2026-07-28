import { useMemo, useState } from "react";
import { Plus, Settings2 } from "lucide-react";
import { toast } from "sonner";

import { FeeStructureForm, type FeeStructureFormData } from "@/components/billing/forms/FeeStructureForm";
import { StudentFeesSummaryCards } from "@/components/billing/StudentFeesSummaryCards";
import { StudentFeesTable, type StudentFeeAction } from "@/components/billing/StudentFeesTable";
import { StudentFeesToolbar, type StudentFeesFilters } from "@/components/billing/StudentFeesToolbar";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { PageHeader } from "@/components/ui/PageHeader";
import { PremiumCard } from "@/components/ui/PremiumCard";
import { FEE_STRUCTURES, STUDENT_FEES, type FeeStructure, type StudentFee } from "@/data/billingData";

const PAGE_SIZE = 10;
type SortField = "studentName" | "className" | "totalFee" | "paid" | "due" | "status" | "nextDueDate";
type SortDir = "asc" | "desc";

const EMPTY_FILTERS: StudentFeesFilters = { search: "", className: "all", section: "all", status: "all" };

export function BillingStudentFeesPage() {
  const [feeStructures, setFeeStructures] = useState<FeeStructure[]>(FEE_STRUCTURES);
  const [structureFormOpen, setStructureFormOpen] = useState(false);
  const [filters, setFilters] = useState<StudentFeesFilters>(EMPTY_FILTERS);
  const [sortField, setSortField] = useState<SortField>("studentName");
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<Set<string | number>>(new Set());

  const sections = useMemo(() => Array.from(new Set(STUDENT_FEES.map((s) => s.section))).sort(), []);

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
  }, [filters]);

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
      case "view": toast.info(`Viewing ${row.studentName}`); break;
      case "generate-invoice": toast.success(`Invoice generated for ${row.studentName}.`); break;
      case "record-payment": toast.info(`Record payment for ${row.studentName}`); break;
      case "print-statement": toast.success(`Printing statement for ${row.studentName}.`); break;
    }
  }

  function handleAddStructure(data: FeeStructureFormData) {
    const structure: FeeStructure = {
      id: feeStructures.length + 1,
      category: data.category as FeeStructure["category"],
      className: data.className,
      amount: Number(data.amount),
      frequency: data.frequency as FeeStructure["frequency"],
    };
    setFeeStructures((prev) => [...prev, structure]);
    console.log("Added fee structure:", structure);
    toast.success("Fee structure saved.");
    setStructureFormOpen(false);
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

      <StudentFeesSummaryCards studentFees={STUDENT_FEES} />

      <PremiumCard className="p-4">
        <div className="flex flex-row items-center justify-between gap-3">
          <p className="flex items-center gap-1.5 text-[13px] font-semibold text-foreground">
            <Settings2 className="h-4 w-4 text-muted-foreground" /> Fee Structures
          </p>
          <Button size="sm" variant="outline" className="h-7 gap-1.5 text-[11.5px]" onClick={() => setStructureFormOpen(true)}>
            <Plus className="h-3.5 w-3.5" /> Add Fee Structure
          </Button>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {feeStructures.map((f) => (
            <span key={f.id} className="rounded-full bg-muted px-3 py-1 text-[11.5px] text-foreground">
              {f.category} — {f.className} · ${f.amount.toLocaleString()} / {f.frequency}
            </span>
          ))}
        </div>
      </PremiumCard>

      <StudentFeesToolbar filters={filters} onFiltersChange={updateFilters} hasActiveFilter={hasActiveFilter} onReset={resetFilters} sections={sections} />

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

      <Dialog open={structureFormOpen} onOpenChange={setStructureFormOpen}>
        <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add Fee Structure</DialogTitle>
            <DialogDescription>Define a new fee category and amount for a class.</DialogDescription>
          </DialogHeader>
          <FeeStructureForm onCancel={() => setStructureFormOpen(false)} onSubmit={handleAddStructure} />
        </DialogContent>
      </Dialog>
    </div>
  );
}
