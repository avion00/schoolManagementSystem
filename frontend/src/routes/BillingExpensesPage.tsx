import { useMemo, useState } from "react";
import { Plus, RotateCcw, Search } from "lucide-react";
import { toast } from "sonner";

import { ExpenseForm, type ExpenseFormData } from "@/components/billing/forms/ExpenseForm";
import { ExpensesTable, type ExpenseAction } from "@/components/billing/ExpensesTable";
import { Reveal } from "@/components/motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  EXPENSES, EXPENSE_CATEGORY_OPTIONS, EXPENSE_STATUS_OPTIONS, PAYMENT_METHOD_OPTIONS, type Expense,
} from "@/data/billingData";

const selectClass = "h-8 rounded-lg border border-input bg-background px-2.5 text-[12px] text-foreground focus:outline-none focus:ring-1 focus:ring-ring";

const BUCKETS: Record<string, string[]> = {
  "Staff Salary": ["Teacher Salary", "Staff Salary"],
  Materials: ["Stationery", "Books", "Lab Materials", "Furniture"],
  Utilities: ["Electricity", "Internet", "Rent"],
  Maintenance: ["Maintenance"],
  Transport: ["Transport Fuel"],
  Other: ["Hostel", "Library", "Events", "Miscellaneous"],
};

export function BillingExpensesPage() {
  const [expenses, setExpenses] = useState<Expense[]>(EXPENSES);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [method, setMethod] = useState("all");
  const [status, setStatus] = useState("all");
  const [addOpen, setAddOpen] = useState(false);

  const bucketTotals = useMemo(() => {
    const totals: Record<string, number> = { "Staff Salary": 0, Materials: 0, Utilities: 0, Maintenance: 0, Transport: 0, Other: 0 };
    expenses.forEach((e) => {
      const bucket = Object.entries(BUCKETS).find(([, cats]) => cats.includes(e.category))?.[0];
      if (bucket) totals[bucket] += e.amount;
    });
    return totals;
  }, [expenses]);

  const total = expenses.reduce((s, e) => s + e.amount, 0);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return expenses.filter((e) => {
      if (category !== "all" && e.category !== category) return false;
      if (method !== "all" && e.paymentMethod !== method) return false;
      if (status !== "all" && e.status !== status) return false;
      if (q && !`${e.expenseId} ${e.vendor} ${e.category}`.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [expenses, search, category, method, status]);

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

  const cards = [
    { label: "Total Expenses", value: total },
    ...Object.entries(bucketTotals).map(([label, value]) => ({ label, value })),
  ];

  return (
    <div className="space-y-4">
      <Reveal className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-7">
        {cards.map((c) => (
          <Card key={c.label} className="rounded-2xl border-border/60 shadow-sm">
            <CardContent className="p-4">
              <p className="text-[11px] text-muted-foreground">{c.label}</p>
              <p className="mt-1 text-[15px] font-semibold tabular-nums text-rose-600 dark:text-rose-400">${c.value.toLocaleString()}</p>
            </CardContent>
          </Card>
        ))}
      </Reveal>

      <div className="flex flex-col gap-3 rounded-2xl border border-border/60 bg-card p-3.5 shadow-sm">
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative min-w-[240px] flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground/60" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by expense ID, vendor, category..."
              className="h-8 w-full rounded-lg border border-input bg-background pl-8 pr-3 text-[12px] text-foreground focus:outline-none focus:ring-1 focus:ring-ring" />
          </div>
          <Button variant="outline" size="sm" className="h-8 gap-1.5 text-[12px]" onClick={() => { setSearch(""); setCategory("all"); setMethod("all"); setStatus("all"); }}>
            <RotateCcw className="h-3.5 w-3.5" /> Reset
          </Button>
          <Button size="sm" className="h-8 gap-1.5 text-[12px]" onClick={() => setAddOpen(true)}>
            <Plus className="h-3.5 w-3.5" /> Add Expense
          </Button>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <select value={category} onChange={(e) => setCategory(e.target.value)} className={selectClass}>
            <option value="all">All Categories</option>
            {EXPENSE_CATEGORY_OPTIONS.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          <select value={method} onChange={(e) => setMethod(e.target.value)} className={selectClass}>
            <option value="all">All Payment Methods</option>
            {PAYMENT_METHOD_OPTIONS.map((m) => <option key={m} value={m}>{m}</option>)}
          </select>
          <select value={status} onChange={(e) => setStatus(e.target.value)} className={selectClass}>
            <option value="all">All Statuses</option>
            {EXPENSE_STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          <span className="ml-auto text-[11.5px] text-muted-foreground">{filtered.length} expenses</span>
        </div>
      </div>

      <ExpensesTable expenses={filtered} onAction={handleAction} />

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
