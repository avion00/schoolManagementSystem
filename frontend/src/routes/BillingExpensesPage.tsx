import { useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { toast } from "sonner";

import { ExpenseForm } from "@/components/billing/forms/ExpenseForm";
import { ExpensesSummaryCards } from "@/components/billing/ExpensesSummaryCards";
import { ExpensesTable, type ExpenseAction } from "@/components/billing/ExpensesTable";
import { ExpensesToolbar, type ExpensesFilters } from "@/components/billing/ExpensesToolbar";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { PageHeader } from "@/components/ui/PageHeader";
import { PremiumEmptyState } from "@/components/ui/PremiumEmptyState";
import { PremiumSkeleton } from "@/components/ui/PremiumSkeleton";
import { METHOD_LABEL, useDeleteExpense, useExpenseAction, useExpenses } from "@/api/billing";
import { downloadFile } from "@/api/files";
import { errorMessage } from "@/api/http";
import type { Expense } from "@/api/types/billing";
import { useAuth } from "@/lib/auth";

const PAGE_SIZE = 10;
type SortField = "expenseId" | "category" | "vendor" | "amount" | "date" | "status";
type SortDir = "asc" | "desc";

const EMPTY_FILTERS: ExpensesFilters = { search: "", category: "all", method: "all", status: "all" };

export function BillingExpensesPage() {
  const query = useExpenses();
  const expenses = useMemo(() => query.data ?? [], [query.data]);
  const act = useExpenseAction();
  const remove = useDeleteExpense();
  const { hasPermission } = useAuth();
  const can = { manage: hasPermission("finance.expense.manage"), approve: hasPermission("finance.expense.approve") };
  const [editing, setEditing] = useState<Expense | null>(null);
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
      if (q && !`${e.expenseId} ${e.vendor} ${e.category} ${e.description}`.toLowerCase().includes(q)) return false;
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
    const fail = (err: unknown) => toast.error(errorMessage(err));
    switch (action) {
      case "edit": setEditing(e); break;
      case "receipt":
        if (e.attachment) downloadFile(e.attachment as Parameters<typeof downloadFile>[0]).catch(fail);
        break;
      case "approve":
      case "reject": {
        const remarks = window.prompt(`${action === "approve" ? "Approve" : "Reject"} ${e.expenseId}? Optional remarks:`);
        if (remarks === null) return;
        act.mutate({ id: e.id, action, remarks }, { onSuccess: () => toast.success(`${e.expenseId} ${action === "approve" ? "approved" : "rejected"}.`), onError: fail });
        break;
      }
      case "pay": {
        const options = Object.entries(METHOD_LABEL).map(([v, l]) => `${v} (${l})`).join(", ");
        const method = window.prompt(`Mark ${e.expenseId} as paid. Payment method — one of: ${options}`, "bank");
        if (!method || !METHOD_LABEL[method.trim()]) { if (method) toast.error("Unknown payment method."); return; }
        act.mutate({ id: e.id, action: "pay", paymentMethod: method.trim() }, { onSuccess: () => toast.success(`${e.expenseId} marked as paid.`), onError: fail });
        break;
      }
      case "delete":
        if (!window.confirm(`Delete ${e.expenseId}?`)) return;
        remove.mutate(e.id, { onSuccess: () => toast.success(`${e.expenseId} deleted.`), onError: fail });
        break;
    }
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
        actions={can.manage ? (
          <Button size="sm" className="h-9 gap-1.5 rounded-xl" onClick={() => setAddOpen(true)}>
            <Plus className="h-4 w-4" /> Add Expense
          </Button>
        ) : undefined}
      />

      {query.isError && (
        <PremiumEmptyState title="Couldn't load expenses" description={errorMessage(query.error)}
          action={<Button size="sm" variant="outline" onClick={() => query.refetch()}>Try again</Button>} />
      )}
      {query.isLoading && <PremiumSkeleton className="h-72 w-full rounded-2xl" />}
      {query.isSuccess && (<>

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
        can={can}
      />
      </>)}

      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add Expense</DialogTitle>
            <DialogDescription>Log a new outgoing school expense. It needs approval before it's paid.</DialogDescription>
          </DialogHeader>
          <ExpenseForm onCancel={() => setAddOpen(false)} onSaved={() => setAddOpen(false)} />
        </DialogContent>
      </Dialog>

      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Expense</DialogTitle>
            <DialogDescription>{editing?.expenseId}</DialogDescription>
          </DialogHeader>
          {editing && <ExpenseForm key={editing.id} expense={editing} onCancel={() => setEditing(null)} onSaved={() => setEditing(null)} />}
        </DialogContent>
      </Dialog>
    </div>
  );
}
