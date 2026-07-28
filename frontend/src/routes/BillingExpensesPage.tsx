import { useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { toast } from "sonner";

import { ExpenseForm, type ExpenseFormData } from "@/components/billing/forms/ExpenseForm";
import { ExpensesSummaryCards } from "@/components/billing/ExpensesSummaryCards";
import { ExpensesTable, type ExpenseAction } from "@/components/billing/ExpensesTable";
import { ExpensesToolbar, type ExpensesFilters } from "@/components/billing/ExpensesToolbar";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { PageHeader } from "@/components/ui/PageHeader";
import { EXPENSES, type Expense } from "@/data/billingData";

const PAGE_SIZE = 10;
type SortField = "expenseId" | "category" | "vendor" | "amount" | "date" | "status";
type SortDir = "asc" | "desc";

const EMPTY_FILTERS: ExpensesFilters = { search: "", category: "all", method: "all", status: "all" };

export function BillingExpensesPage() {
  const [expenses, setExpenses] = useState<Expense[]>(EXPENSES);
  const [filters, setFilters] = useState<ExpensesFilters>(EMPTY_FILTERS);
  const [sortField, setSortField] = useState<SortField>("date");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<Set<string | number>>(new Set());
  const [addOpen, setAddOpen] = useState(false);

  function updateFilters(next: Partial<ExpensesFilters>) {
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

  const hasActiveFilter = !!filters.search || filters.category !== "all" || filters.method !== "all" || filters.status !== "all";

  const filtered = useMemo(() => {
    const q = filters.search.trim().toLowerCase();
    return expenses.filter((e) => {
      if (filters.category !== "all" && e.category !== filters.category) return false;
      if (filters.method !== "all" && e.paymentMethod !== filters.method) return false;
      if (filters.status !== "all" && e.status !== filters.status) return false;
      if (q && !`${e.expenseId} ${e.vendor} ${e.category}`.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [expenses, filters]);

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
  const paginated: Expense[] = sorted.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  function handleAction(e: Expense, action: ExpenseAction) {
    if (action === "view") { toast.info(`Viewing ${e.expenseId}`); return; }
    const nextStatus = action === "approve" ? "Approved" : "Rejected";
    setExpenses((prev) => prev.map((row) => (row.id === e.id ? { ...row, status: nextStatus } : row)));
    console.log(`Expense ${action}:`, e.expenseId);
    toast.success(`${e.expenseId} ${nextStatus.toLowerCase()}.`);
  }

  function handleAdd(data: ExpenseFormData) {
    console.log("New expense:", data);
    toast.success("Expense added successfully.");
    setAddOpen(false);
  }

  return (
    <div className="space-y-4">
      <PageHeader
        title={
          <>
            {sorted.length} expense{sorted.length !== 1 ? "s" : ""}{" "}
            {hasActiveFilter && (
              <span className="text-base font-normal text-muted-foreground">(filtered from {expenses.length} total)</span>
            )}
          </>
        }
        description="Track and approve outgoing school expenses."
        actions={
          <Button size="sm" className="h-9 gap-1.5 rounded-xl" onClick={() => setAddOpen(true)}>
            <Plus className="h-4 w-4" /> Add Expense
          </Button>
        }
      />

      <ExpensesSummaryCards expenses={expenses} />

      <ExpensesToolbar filters={filters} onFiltersChange={updateFilters} hasActiveFilter={hasActiveFilter} onReset={resetFilters} />

      <ExpensesTable
        expenses={paginated}
        onAction={handleAction}
        sortField={sortField}
        sortDir={sortDir}
        onSort={handleSort}
        selected={selected}
        onSelectionChange={setSelected}
        pagination={{ page: safePage, pageSize: PAGE_SIZE, total: sorted.length, onPage: (p) => { setPage(p); setSelected(new Set()); }, itemLabel: "expenses" }}
        hasActiveFilter={hasActiveFilter}
        onResetFilters={resetFilters}
      />

      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add Expense</DialogTitle>
            <DialogDescription>Log a new outgoing school expense.</DialogDescription>
          </DialogHeader>
          <ExpenseForm onCancel={() => setAddOpen(false)} onSubmit={handleAdd} />
        </DialogContent>
      </Dialog>
    </div>
  );
}
