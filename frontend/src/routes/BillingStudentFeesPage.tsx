import { useMemo, useState } from "react";
import {
  ChevronLeft, ChevronRight, Eye, FileText, MoreVertical, Plus, Printer, Receipt, Search, SearchX, Settings2,
} from "lucide-react";
import { toast } from "sonner";

import { BillingStatusBadge } from "@/components/billing/BillingStatusBadge";
import { FeeStructureForm, type FeeStructureFormData } from "@/components/billing/forms/FeeStructureForm";
import { Reveal } from "@/components/motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CLASS_OPTIONS, FEE_STATUS_OPTIONS, FEE_STRUCTURES, STUDENT_FEES, type FeeStructure } from "@/data/billingData";
import { cn } from "@/lib/utils";

const PAGE_SIZE = 10;
const selectClass = "h-8 rounded-lg border border-input bg-background px-2.5 text-[12px] text-foreground focus:outline-none focus:ring-1 focus:ring-ring";

export function BillingStudentFeesPage() {
  const [feeStructures, setFeeStructures] = useState<FeeStructure[]>(FEE_STRUCTURES);
  const [structureFormOpen, setStructureFormOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [className, setClassName] = useState("all");
  const [section, setSection] = useState("all");
  const [status, setStatus] = useState("all");
  const [page, setPage] = useState(0);

  const summary = useMemo(() => ({
    total: STUDENT_FEES.length,
    paid: STUDENT_FEES.filter((s) => s.status === "Paid").length,
    partial: STUDENT_FEES.filter((s) => s.status === "Partial").length,
    unpaid: STUDENT_FEES.filter((s) => s.status === "Due").length,
    overdue: STUDENT_FEES.filter((s) => s.status === "Overdue").length,
    scholarship: STUDENT_FEES.filter((s) => s.discount > 0).length,
  }), []);

  const sections = useMemo(() => Array.from(new Set(STUDENT_FEES.map((s) => s.section))).sort(), []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return STUDENT_FEES.filter((s) => {
      if (className !== "all" && s.className !== className) return false;
      if (section !== "all" && s.section !== section) return false;
      if (status !== "all" && s.status !== status) return false;
      if (q && !`${s.studentName} ${s.admissionNo} ${s.registrationNo}`.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [search, className, section, status]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const start = page * PAGE_SIZE;
  const rows = filtered.slice(start, start + PAGE_SIZE);

  const cards = [
    { label: "Total Students", value: summary.total, tone: "blue" },
    { label: "Fully Paid", value: summary.paid, tone: "green" },
    { label: "Partially Paid", value: summary.partial, tone: "amber" },
    { label: "Unpaid", value: summary.unpaid, tone: "amber" },
    { label: "Overdue", value: summary.overdue, tone: "red" },
    { label: "Scholarship Students", value: summary.scholarship, tone: "purple" },
  ] as const;

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
      <Reveal className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {cards.map((c) => (
          <Card key={c.label} className="rounded-2xl border-border/60 shadow-sm">
            <CardContent className="p-4">
              <p className="text-[11px] text-muted-foreground">{c.label}</p>
              <p className={cn("mt-1 text-xl font-semibold tabular-nums",
                c.tone === "green" ? "text-emerald-600 dark:text-emerald-400" :
                c.tone === "amber" ? "text-amber-600 dark:text-amber-400" :
                c.tone === "red"   ? "text-rose-600 dark:text-rose-400" :
                c.tone === "purple"? "text-purple-600 dark:text-purple-400" : "text-blue-600 dark:text-blue-400",
              )}>{c.value}</p>
            </CardContent>
          </Card>
        ))}
      </Reveal>

      <Card className="rounded-2xl border-border/60 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="flex items-center gap-1.5 text-[13px] font-semibold"><Settings2 className="h-4 w-4 text-muted-foreground" /> Fee Structures</CardTitle>
          <Button size="sm" variant="outline" className="h-7 gap-1.5 text-[11.5px]" onClick={() => setStructureFormOpen(true)}>
            <Plus className="h-3.5 w-3.5" /> Add Fee Structure
          </Button>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2 pt-0">
          {feeStructures.map((f) => (
            <span key={f.id} className="rounded-full bg-muted px-3 py-1 text-[11.5px] text-foreground">
              {f.category} — {f.className} · ${f.amount.toLocaleString()} / {f.frequency}
            </span>
          ))}
        </CardContent>
      </Card>

      <div className="flex flex-col gap-3 rounded-2xl border border-border/60 bg-card p-3.5 shadow-sm">
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative min-w-[240px] flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground/60" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by student, admission no, registration no..."
              className="h-8 w-full rounded-lg border border-input bg-background pl-8 pr-3 text-[12px] text-foreground focus:outline-none focus:ring-1 focus:ring-ring" />
          </div>
          <span className="text-[11.5px] text-muted-foreground">{filtered.length} students</span>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <select value={className} onChange={(e) => { setClassName(e.target.value); setPage(0); }} className={selectClass}>
            <option value="all">All Classes</option>
            {CLASS_OPTIONS.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          <select value={section} onChange={(e) => { setSection(e.target.value); setPage(0); }} className={selectClass}>
            <option value="all">All Sections</option>
            {sections.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          <select value={status} onChange={(e) => { setStatus(e.target.value); setPage(0); }} className={selectClass}>
            <option value="all">All Statuses</option>
            {FEE_STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          <select className={selectClass} defaultValue="2026" title="Academic Year"><option value="2026">AY 2025–2026</option></select>
          <select className={selectClass} defaultValue="jul" title="Month"><option value="jul">July 2026</option></select>
        </div>
      </div>

      {rows.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-2xl border border-border/60 bg-card py-16 text-center shadow-sm">
          <SearchX className="h-6 w-6 text-muted-foreground/50" />
          <p className="text-[13px] font-medium text-foreground">No students match your filters</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-border/60 bg-card shadow-sm">
          <Table>
            <TableHeader className="bg-muted/40">
              <TableRow className="hover:bg-transparent">
                <TableHead className="text-[11px]">Student</TableHead>
                <TableHead className="text-[11px]">Admission No</TableHead>
                <TableHead className="text-[11px]">Registration No</TableHead>
                <TableHead className="text-[11px]">Class</TableHead>
                <TableHead className="text-[11px]">Section</TableHead>
                <TableHead className="text-[11px]">Fee Plan</TableHead>
                <TableHead className="text-[11px]">Total Fee</TableHead>
                <TableHead className="text-[11px]">Paid</TableHead>
                <TableHead className="text-[11px]">Due</TableHead>
                <TableHead className="text-[11px]">Discount</TableHead>
                <TableHead className="text-[11px]">Status</TableHead>
                <TableHead className="text-[11px]">Next Due Date</TableHead>
                <TableHead className="w-9 text-[11px]" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((s, i) => (
                <TableRow key={s.id} className="t-content-in" style={{ animationDelay: `${i * 25}ms` }}>
                  <TableCell className="text-[12.5px] font-medium text-foreground">{s.studentName}</TableCell>
                  <TableCell className="font-mono text-[11.5px] text-muted-foreground">{s.admissionNo}</TableCell>
                  <TableCell className="font-mono text-[11.5px] text-muted-foreground">{s.registrationNo}</TableCell>
                  <TableCell className="text-[12px] text-muted-foreground">{s.className}</TableCell>
                  <TableCell className="text-[12px] text-muted-foreground">{s.section}</TableCell>
                  <TableCell className="text-[12px] text-muted-foreground">{s.feePlan}</TableCell>
                  <TableCell className="text-[12.5px] tabular-nums text-foreground">${s.totalFee.toLocaleString()}</TableCell>
                  <TableCell className="text-[12.5px] tabular-nums text-emerald-600 dark:text-emerald-400">${s.paid.toLocaleString()}</TableCell>
                  <TableCell className="text-[12.5px] font-medium tabular-nums text-rose-600 dark:text-rose-400">${s.due.toLocaleString()}</TableCell>
                  <TableCell className="text-[12px] tabular-nums text-muted-foreground">${s.discount.toLocaleString()}</TableCell>
                  <TableCell><BillingStatusBadge status={s.status} /></TableCell>
                  <TableCell className="whitespace-nowrap text-[12px] text-muted-foreground">{s.nextDueDate ?? "—"}</TableCell>
                  <TableCell className="px-2">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground"><MoreVertical className="h-4 w-4" /></Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-44">
                        <DropdownMenuItem onClick={() => toast.info(`Viewing ${s.studentName}`)}><Eye className="h-3.5 w-3.5" /> View</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => toast.success(`Invoice generated for ${s.studentName}.`)}><FileText className="h-3.5 w-3.5" /> Generate Invoice</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => toast.info(`Record payment for ${s.studentName}`)}><Receipt className="h-3.5 w-3.5" /> Record Payment</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => toast.success(`Printing statement for ${s.studentName}.`)}><Printer className="h-3.5 w-3.5" /> Print Statement</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border/50 px-4 py-3">
            <span className="text-[12px] text-muted-foreground">Showing {start + 1}–{Math.min(start + PAGE_SIZE, filtered.length)} of {filtered.length}</span>
            <div className="flex items-center gap-2">
              <span className="text-[12px] text-muted-foreground">Page {page + 1} of {pageCount}</span>
              <Button variant="outline" size="icon" className="h-7 w-7" disabled={page === 0} onClick={() => setPage((p) => p - 1)}><ChevronLeft className="h-3.5 w-3.5" /></Button>
              <Button variant="outline" size="icon" className="h-7 w-7" disabled={page >= pageCount - 1} onClick={() => setPage((p) => p + 1)}><ChevronRight className="h-3.5 w-3.5" /></Button>
            </div>
          </div>
        </div>
      )}

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
