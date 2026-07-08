import { useMemo, useState } from "react";
import {
  Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip as RTooltip, XAxis, YAxis,
} from "recharts";
import { Download, Printer } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  CLASS_OPTIONS, EXPENSES, FEE_CATEGORY_OPTIONS, INVOICE_STATUS_OPTIONS,
  PAYMENTS, PAYROLL, REPORT_TYPES, STUDENT_FEES, VENDORS,
  type ReportTypeDef,
} from "@/data/billingData";

type ReportRow = Record<string, string | number>;
interface ReportResult {
  summary: { label: string; value: string }[];
  columns: { key: string; label: string }[];
  rows: ReportRow[];
  chart?: { name: string; value: number }[];
}

const selectClass = "h-9 rounded-lg border border-input bg-background px-2.5 text-[12px] text-foreground focus:outline-none focus:ring-1 focus:ring-ring";

function inRange(dateStr: string, from: string, to: string) {
  if (from && dateStr < from) return false;
  if (to && dateStr > to) return false;
  return true;
}

function buildReport(type: string, f: { from: string; to: string; className: string; section: string; feeType: string; status: string }): ReportResult {
  switch (type) {
    case "daily-collection":
    case "monthly-collection": {
      const rows = PAYMENTS.filter((p) => p.status === "Completed" && inRange(p.paymentDate, f.from, f.to));
      const total = rows.reduce((s, p) => s + p.amount, 0);
      const byMethod = new Map<string, number>();
      rows.forEach((p) => byMethod.set(p.method, (byMethod.get(p.method) ?? 0) + p.amount));
      return {
        summary: [
          { label: "Total Collected", value: `$${total.toLocaleString()}` },
          { label: "Payments", value: String(rows.length) },
          { label: "Avg. Payment", value: rows.length ? `$${Math.round(total / rows.length).toLocaleString()}` : "$0" },
        ],
        columns: [
          { key: "paymentId", label: "Payment ID" }, { key: "studentName", label: "Student" },
          { key: "method", label: "Method" }, { key: "amount", label: "Amount" }, { key: "paymentDate", label: "Date" },
        ],
        rows: rows.map((p) => ({ paymentId: p.paymentId, studentName: p.studentName, method: p.method, amount: `$${p.amount.toLocaleString()}`, paymentDate: p.paymentDate })),
        chart: Array.from(byMethod.entries()).map(([name, value]) => ({ name, value })),
      };
    }
    case "outstanding-dues": {
      const rows = STUDENT_FEES.filter((s) => s.due > 0)
        .filter((s) => !f.className || s.className === f.className)
        .filter((s) => !f.status || s.status === f.status);
      const total = rows.reduce((s, r) => s + r.due, 0);
      return {
        summary: [
          { label: "Students with Dues", value: String(rows.length) },
          { label: "Total Outstanding", value: `$${total.toLocaleString()}` },
        ],
        columns: [
          { key: "studentName", label: "Student" }, { key: "className", label: "Class" },
          { key: "due", label: "Due" }, { key: "status", label: "Status" }, { key: "nextDueDate", label: "Due Date" },
        ],
        rows: rows.map((r) => ({ studentName: r.studentName, className: `${r.className}-${r.section}`, due: `$${r.due.toLocaleString()}`, status: r.status, nextDueDate: r.nextDueDate ?? "—" })),
        chart: CLASS_OPTIONS.map((c) => ({ name: c.replace("Grade ", "G"), value: rows.filter((r) => r.className === c).reduce((s, r) => s + r.due, 0) })).filter((d) => d.value > 0),
      };
    }
    case "expense": {
      const rows = EXPENSES.filter((e) => inRange(e.date, f.from, f.to));
      const total = rows.reduce((s, e) => s + e.amount, 0);
      const byCat = new Map<string, number>();
      rows.forEach((e) => byCat.set(e.category, (byCat.get(e.category) ?? 0) + e.amount));
      return {
        summary: [
          { label: "Total Expenses", value: `$${total.toLocaleString()}` },
          { label: "Entries", value: String(rows.length) },
        ],
        columns: [
          { key: "expenseId", label: "Expense ID" }, { key: "category", label: "Category" },
          { key: "vendor", label: "Vendor" }, { key: "amount", label: "Amount" }, { key: "date", label: "Date" }, { key: "status", label: "Status" },
        ],
        rows: rows.map((e) => ({ expenseId: e.expenseId, category: e.category, vendor: e.vendor, amount: `$${e.amount.toLocaleString()}`, date: e.date, status: e.status })),
        chart: Array.from(byCat.entries()).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value).slice(0, 8),
      };
    }
    case "payroll": {
      const rows = PAYROLL;
      const total = rows.reduce((s, p) => s + p.netSalary, 0);
      return {
        summary: [
          { label: "Total Payroll", value: `$${total.toLocaleString()}` },
          { label: "Staff", value: String(rows.length) },
          { label: "Pending", value: String(rows.filter((p) => p.status === "Pending").length) },
        ],
        columns: [
          { key: "staffName", label: "Staff" }, { key: "role", label: "Role" },
          { key: "netSalary", label: "Net Salary" }, { key: "status", label: "Status" }, { key: "month", label: "Month" },
        ],
        rows: rows.map((p) => ({ staffName: p.staffName, role: p.role, netSalary: `$${p.netSalary.toLocaleString()}`, status: p.status, month: p.month })),
        chart: Array.from(new Set(rows.map((p) => p.department))).map((d) => ({ name: d, value: rows.filter((p) => p.department === d).reduce((s, p) => s + p.netSalary, 0) })),
      };
    }
    case "profit-loss": {
      const income = PAYMENTS.filter((p) => p.status === "Completed" && inRange(p.paymentDate, f.from, f.to)).reduce((s, p) => s + p.amount, 0);
      const expense = EXPENSES.filter((e) => inRange(e.date, f.from, f.to)).reduce((s, e) => s + e.amount, 0);
      return {
        summary: [
          { label: "Income", value: `$${income.toLocaleString()}` },
          { label: "Expenses", value: `$${expense.toLocaleString()}` },
          { label: "Net Profit", value: `$${(income - expense).toLocaleString()}` },
        ],
        columns: [{ key: "label", label: "Line Item" }, { key: "amount", label: "Amount" }],
        rows: [
          { label: "Total Income", amount: `$${income.toLocaleString()}` },
          { label: "Total Expenses", amount: `-$${expense.toLocaleString()}` },
          { label: "Net Profit / Loss", amount: `$${(income - expense).toLocaleString()}` },
        ],
        chart: [{ name: "Income", value: income }, { name: "Expenses", value: expense }],
      };
    }
    case "fee-statement": {
      const rows = STUDENT_FEES.filter((s) => !f.className || s.className === f.className);
      return {
        summary: [
          { label: "Students", value: String(rows.length) },
          { label: "Total Fee", value: `$${rows.reduce((s, r) => s + r.totalFee, 0).toLocaleString()}` },
          { label: "Total Paid", value: `$${rows.reduce((s, r) => s + r.paid, 0).toLocaleString()}` },
        ],
        columns: [
          { key: "studentName", label: "Student" }, { key: "totalFee", label: "Total Fee" },
          { key: "paid", label: "Paid" }, { key: "due", label: "Due" }, { key: "status", label: "Status" },
        ],
        rows: rows.map((r) => ({ studentName: r.studentName, totalFee: `$${r.totalFee.toLocaleString()}`, paid: `$${r.paid.toLocaleString()}`, due: `$${r.due.toLocaleString()}`, status: r.status })),
      };
    }
    case "vendor-payment": {
      const rows = VENDORS;
      return {
        summary: [
          { label: "Vendors", value: String(rows.length) },
          { label: "Total Purchases", value: `$${rows.reduce((s, v) => s + v.totalPurchases, 0).toLocaleString()}` },
          { label: "Outstanding", value: `$${rows.reduce((s, v) => s + v.outstandingBalance, 0).toLocaleString()}` },
        ],
        columns: [
          { key: "vendorName", label: "Vendor" }, { key: "category", label: "Category" },
          { key: "totalPurchases", label: "Total Purchases" }, { key: "outstandingBalance", label: "Outstanding" },
        ],
        rows: rows.map((v) => ({ vendorName: v.vendorName, category: v.category, totalPurchases: `$${v.totalPurchases.toLocaleString()}`, outstandingBalance: `$${v.outstandingBalance.toLocaleString()}` })),
        chart: rows.map((v) => ({ name: v.vendorName.split(" ")[0], value: v.totalPurchases })),
      };
    }
    case "refund": {
      const rows = PAYMENTS.filter((p) => p.status === "Refunded");
      return {
        summary: [{ label: "Refunds", value: String(rows.length) }, { label: "Total Refunded", value: `$${rows.reduce((s, p) => s + p.amount, 0).toLocaleString()}` }],
        columns: [{ key: "paymentId", label: "Payment ID" }, { key: "studentName", label: "Student" }, { key: "amount", label: "Amount" }, { key: "paymentDate", label: "Date" }],
        rows: rows.map((p) => ({ paymentId: p.paymentId, studentName: p.studentName, amount: `$${p.amount.toLocaleString()}`, paymentDate: p.paymentDate })),
      };
    }
    default:
      return { summary: [], columns: [], rows: [] };
  }
}

export function ReportGenerator() {
  const [reportType, setReportType] = useState<string>(REPORT_TYPES[0].id);
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [className, setClassName] = useState("");
  const [feeType, setFeeType] = useState("");
  const [status, setStatus] = useState("");
  const [result, setResult] = useState<ReportResult | null>(null);

  const activeType: ReportTypeDef = REPORT_TYPES.find((r) => r.id === reportType) ?? REPORT_TYPES[0];

  function generate() {
    setResult(buildReport(reportType, { from, to, className, section: "", feeType, status }));
  }

  const chartData = useMemo(() => result?.chart ?? [], [result]);

  return (
    <div className="space-y-4">
      <Card className="rounded-2xl border-border/60 shadow-sm">
        <CardContent className="space-y-3 p-4">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            <select value={reportType} onChange={(e) => setReportType(e.target.value)} className={selectClass}>
              {REPORT_TYPES.map((r) => <option key={r.id} value={r.id}>{r.label}</option>)}
            </select>
            <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className={selectClass} title="From date" />
            <input type="date" value={to} onChange={(e) => setTo(e.target.value)} className={selectClass} title="To date" />
            <select value={className} onChange={(e) => setClassName(e.target.value)} className={selectClass}>
              <option value="">All Classes</option>
              {CLASS_OPTIONS.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
            <select value={feeType} onChange={(e) => setFeeType(e.target.value)} className={selectClass}>
              <option value="">All Fee Types</option>
              {FEE_CATEGORY_OPTIONS.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
            <select value={status} onChange={(e) => setStatus(e.target.value)} className={selectClass}>
              <option value="">Any Status</option>
              {INVOICE_STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <p className="text-[11.5px] text-muted-foreground">{activeType.description}</p>
          <div className="flex justify-end">
            <Button size="sm" className="h-8 text-[12px]" onClick={generate}>Generate Report</Button>
          </div>
        </CardContent>
      </Card>

      {result && (
        <div className="t-content-in space-y-4">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {result.summary.map((s) => (
              <Card key={s.label} className="rounded-2xl border-border/60 shadow-sm">
                <CardContent className="p-4">
                  <p className="text-[11px] text-muted-foreground">{s.label}</p>
                  <p className="mt-0.5 text-lg font-semibold text-foreground">{s.value}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {chartData.length > 0 && (
            <Card className="rounded-2xl border-border/60 shadow-sm">
              <CardContent className="p-4">
                <div className="h-56 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} margin={{ left: -12, right: 4, top: 4 }}>
                      <CartesianGrid vertical={false} stroke="hsl(var(--border))" strokeDasharray="3 3" />
                      <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                      <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" width={42} tickFormatter={(v: number) => `$${(v / 1000).toFixed(0)}k`} />
                      <RTooltip cursor={{ fill: "hsl(var(--muted))" }} />
                      <Bar dataKey="value" fill="#2a78d6" radius={[4, 4, 0, 0]} maxBarSize={26} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          )}

          <Card className="rounded-2xl border-border/60 shadow-sm">
            <CardContent className="p-0">
              <div className="flex items-center justify-between border-b border-border/50 p-3">
                <p className="text-[12.5px] font-semibold text-foreground">{activeType.label}</p>
                <div className="flex gap-2 print:hidden">
                  <Button variant="outline" size="sm" className="h-7 gap-1.5 text-[11.5px]" onClick={() => toast.success("Report exported (CSV).")}>
                    <Download className="h-3.5 w-3.5" /> Export
                  </Button>
                  <Button variant="outline" size="sm" className="h-7 gap-1.5 text-[11.5px]" onClick={() => window.print()}>
                    <Printer className="h-3.5 w-3.5" /> Print
                  </Button>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-[12px]">
                  <thead className="bg-muted/40">
                    <tr>
                      {result.columns.map((c) => <th key={c.key} className="px-4 py-2 text-left font-medium text-muted-foreground">{c.label}</th>)}
                    </tr>
                  </thead>
                  <tbody>
                    {result.rows.map((row, i) => (
                      <tr key={i} className="border-t border-border/40">
                        {result.columns.map((c) => <td key={c.key} className="px-4 py-2 text-foreground">{row[c.key]}</td>)}
                      </tr>
                    ))}
                    {result.rows.length === 0 && (
                      <tr><td colSpan={result.columns.length} className="px-4 py-8 text-center text-muted-foreground">No data for the selected filters.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
