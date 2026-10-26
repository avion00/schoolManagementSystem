import { useMemo, useState } from "react";
import {
  Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip as RTooltip, XAxis, YAxis,
} from "recharts";
import {
  Download, Printer, DollarSign, Receipt, TrendingUp, TrendingDown, Users, Wallet,
  ListChecks, Clock, GraduationCap, CheckCircle2, Building2, ShoppingCart, RotateCcw,
  Banknote, BarChart3, type LucideIcon,
} from "lucide-react";

import { Reveal } from "@/components/motion";
import { Button } from "@/components/ui/button";
import { KPITrendCard } from "@/components/ui/KPITrendCard";
import { METRIC_TONES } from "@/components/ui/MetricCard";
import { PremiumCard } from "@/components/ui/PremiumCard";
import { PremiumSelect } from "@/components/ui/PremiumSelect";
import {
  monthLabel, useExpenses, useMoney, usePayments, usePayrollRuns, usePayslips, useStudentFees, useVendors,
} from "@/api/billing";
import { todayIso } from "@/api/attendance";
import { FEE_STATUS_OPTIONS, type ReportTypeDef } from "@/api/types/billing";
import { useAuth } from "@/lib/auth";

/** Report types; `finance` ones need finance access, `payroll` needs payroll access. */
const REPORT_TYPES: (ReportTypeDef & { needs?: "finance" | "payroll"; filters: ("dates" | "class" | "status" | "run")[] })[] = [
  { id: "collection", label: "Collection Report", description: "Fees collected in a period, by payment method.", filters: ["dates"] },
  { id: "outstanding-dues", label: "Outstanding Dues Report", description: "Students with unpaid or overdue balances.", filters: ["class", "status"] },
  { id: "fee-statement", label: "Class Fee Summary", description: "Billed, paid and due per student.", filters: ["class"] },
  { id: "expense", label: "Expense Report", description: "Expenses by category in a period.", needs: "finance", filters: ["dates"] },
  { id: "profit-loss", label: "Income vs Expenses", description: "Fee collections against paid expenses for a period.", needs: "finance", filters: ["dates"] },
  { id: "vendor-payment", label: "Vendor Report", description: "Purchases and unpaid balances by vendor.", needs: "finance", filters: [] },
  { id: "payroll", label: "Payroll Report", description: "Payslips for a payroll month.", needs: "payroll", filters: ["run"] },
  { id: "reversals", label: "Reversed Payments", description: "Payments reversed in a period.", filters: ["dates"] },
];

const SUMMARY_META: Record<string, { icon: LucideIcon; tone: string }> = {
  "Total Collected": { icon: DollarSign, tone: METRIC_TONES.green },
  "Payments": { icon: Receipt, tone: METRIC_TONES.blue },
  "Avg. Payment": { icon: TrendingUp, tone: METRIC_TONES.purple },
  "Students with Dues": { icon: Users, tone: METRIC_TONES.amber },
  "Total Outstanding": { icon: Wallet, tone: METRIC_TONES.red },
  "Paid Expenses": { icon: TrendingDown, tone: METRIC_TONES.red },
  "Entries": { icon: ListChecks, tone: METRIC_TONES.blue },
  "Net Payroll": { icon: Wallet, tone: METRIC_TONES.purple },
  "Staff": { icon: Users, tone: METRIC_TONES.blue },
  "Status": { icon: Clock, tone: METRIC_TONES.amber },
  "Income": { icon: TrendingUp, tone: METRIC_TONES.green },
  "Expenses": { icon: TrendingDown, tone: METRIC_TONES.red },
  "Net": { icon: Banknote, tone: METRIC_TONES.green },
  "Students": { icon: GraduationCap, tone: METRIC_TONES.blue },
  "Total Billed": { icon: Wallet, tone: METRIC_TONES.purple },
  "Total Paid": { icon: CheckCircle2, tone: METRIC_TONES.green },
  "Vendors": { icon: Building2, tone: METRIC_TONES.cyan },
  "Total Purchases": { icon: ShoppingCart, tone: METRIC_TONES.purple },
  "Outstanding": { icon: Clock, tone: METRIC_TONES.amber },
  "Reversals": { icon: RotateCcw, tone: METRIC_TONES.red },
  "Total Reversed": { icon: Banknote, tone: METRIC_TONES.red },
};
const DEFAULT_META = { icon: BarChart3, tone: METRIC_TONES.neutral };

type ReportRow = Record<string, string | number>;
interface ReportResult {
  summary: { label: string; value: string }[];
  columns: { key: string; label: string }[];
  rows: ReportRow[];
  chart?: { name: string; value: number }[];
}

const dateInputClass = "h-9 rounded-lg border border-input bg-background px-2.5 text-[12px] text-foreground focus:outline-none focus:ring-1 focus:ring-ring";

function inRange(dateStr: string, from: string, to: string) {
  if (from && dateStr < from) return false;
  if (to && dateStr > to) return false;
  return true;
}

function downloadCsv(name: string, result: ReportResult) {
  const esc = (v: unknown) => `"${String(v ?? "").replace(/"/g, '""')}"`;
  const lines = [result.columns.map((c) => esc(c.label)).join(","),
    ...result.rows.map((r) => result.columns.map((c) => esc(r[c.key])).join(","))];
  const url = URL.createObjectURL(new Blob([lines.join("\n")], { type: "text/csv" }));
  const a = Object.assign(document.createElement("a"), { href: url, download: `${name}.csv` });
  a.click();
  URL.revokeObjectURL(url);
}

export function ReportGenerator() {
  const money = useMoney();
  const { hasPermission } = useAuth();
  const canFinance = hasPermission("finance.view");
  const canPayroll = hasPermission("payroll.manage");
  const types = REPORT_TYPES.filter((t) => !t.needs || (t.needs === "finance" ? canFinance : canPayroll));

  const monthStart = todayIso().slice(0, 8) + "01";
  const [reportType, setReportType] = useState<string>(types[0].id);
  const [from, setFrom] = useState(monthStart);
  const [to, setTo] = useState(todayIso());
  const [className, setClassName] = useState("");
  const [status, setStatus] = useState("");
  const [runId, setRunId] = useState("");
  const [generated, setGenerated] = useState<string | null>(null);

  const payments = usePayments();
  const fees = useStudentFees();
  const expenses = useExpenses(canFinance);
  const vendors = useVendors(canFinance);
  const runs = usePayrollRuns(canPayroll);
  const run = (runs.data ?? []).find((r) => r.id === runId) ?? runs.data?.[0];
  const slips = usePayslips(canPayroll && reportType === "payroll" ? run?.id : undefined);

  const activeType = types.find((r) => r.id === reportType) ?? types[0];
  const classes = useMemo(() => Array.from(new Set((fees.data ?? []).map((f) => f.className))), [fees.data]);

  const result = useMemo((): ReportResult | null => {
    if (!generated) return null;
    switch (generated) {
      case "collection": {
        const rows = (payments.data ?? []).filter((p) => p.status === "Completed" && inRange(p.paymentDate, from, to));
        const total = rows.reduce((s, p) => s + p.amount, 0);
        const byMethod = new Map<string, number>();
        rows.forEach((p) => byMethod.set(p.method, (byMethod.get(p.method) ?? 0) + p.amount));
        return {
          summary: [
            { label: "Total Collected", value: money(total) },
            { label: "Payments", value: String(rows.length) },
            { label: "Avg. Payment", value: money(rows.length ? total / rows.length : 0) },
          ],
          columns: [
            { key: "paymentId", label: "Receipt" }, { key: "invoiceNo", label: "Invoice" }, { key: "studentName", label: "Student" },
            { key: "method", label: "Method" }, { key: "amount", label: "Amount" }, { key: "paymentDate", label: "Date" },
          ],
          rows: rows.map((p) => ({ paymentId: p.paymentId, invoiceNo: p.invoiceNo, studentName: p.studentName, method: p.method, amount: money(p.amount), paymentDate: p.paymentDate })),
          chart: Array.from(byMethod.entries()).map(([name, value]) => ({ name, value })),
        };
      }
      case "outstanding-dues": {
        const rows = (fees.data ?? []).filter((s) => s.due > 0)
          .filter((s) => !className || s.className === className)
          .filter((s) => !status || s.status === status)
          .sort((a, b) => b.due - a.due);
        const total = rows.reduce((s, r) => s + r.due, 0);
        const byClass = new Map<string, number>();
        rows.forEach((r) => byClass.set(r.className, (byClass.get(r.className) ?? 0) + r.due));
        return {
          summary: [
            { label: "Students with Dues", value: String(rows.length) },
            { label: "Total Outstanding", value: money(total) },
          ],
          columns: [
            { key: "studentName", label: "Student" }, { key: "admissionNo", label: "Admission No" }, { key: "className", label: "Class" },
            { key: "due", label: "Due" }, { key: "status", label: "Status" }, { key: "nextDueDate", label: "Next Due" },
          ],
          rows: rows.map((r) => ({
            studentName: r.studentName, admissionNo: r.admissionNo, className: [r.className, r.section].filter(Boolean).join("-"),
            due: money(r.due), status: r.status, nextDueDate: r.nextDueDate ?? "—",
          })),
          chart: Array.from(byClass.entries()).map(([name, value]) => ({ name, value })),
        };
      }
      case "fee-statement": {
        const rows = (fees.data ?? []).filter((s) => !className || s.className === className);
        return {
          summary: [
            { label: "Students", value: String(rows.length) },
            { label: "Total Billed", value: money(rows.reduce((s, r) => s + r.totalFee - r.discount, 0)) },
            { label: "Total Paid", value: money(rows.reduce((s, r) => s + r.paid, 0)) },
          ],
          columns: [
            { key: "studentName", label: "Student" }, { key: "className", label: "Class" }, { key: "totalFee", label: "Billed" },
            { key: "discount", label: "Discount" }, { key: "paid", label: "Paid" }, { key: "due", label: "Due" }, { key: "status", label: "Status" },
          ],
          rows: rows.map((r) => ({
            studentName: r.studentName, className: [r.className, r.section].filter(Boolean).join("-"), totalFee: money(r.totalFee),
            discount: money(r.discount), paid: money(r.paid), due: money(r.due), status: r.status,
          })),
        };
      }
      case "expense": {
        const rows = (expenses.data ?? []).filter((e) => inRange(e.date, from, to));
        const paid = rows.filter((e) => e.status === "Paid");
        const byCat = new Map<string, number>();
        paid.forEach((e) => byCat.set(e.category, (byCat.get(e.category) ?? 0) + e.amount));
        return {
          summary: [
            { label: "Paid Expenses", value: money(paid.reduce((s, e) => s + e.amount, 0)) },
            { label: "Entries", value: String(rows.length) },
          ],
          columns: [
            { key: "expenseId", label: "Expense ID" }, { key: "category", label: "Category" }, { key: "vendor", label: "Vendor" },
            { key: "description", label: "Description" }, { key: "amount", label: "Amount" }, { key: "date", label: "Date" }, { key: "status", label: "Status" },
          ],
          rows: rows.map((e) => ({ expenseId: e.expenseId, category: e.category, vendor: e.vendor || "—", description: e.description, amount: money(e.amount), date: e.date, status: e.status })),
          chart: Array.from(byCat.entries()).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value).slice(0, 8),
        };
      }
      case "profit-loss": {
        const income = (payments.data ?? []).filter((p) => p.status === "Completed" && inRange(p.paymentDate, from, to)).reduce((s, p) => s + p.amount, 0);
        const expense = (expenses.data ?? []).filter((e) => e.status === "Paid" && inRange(e.date, from, to)).reduce((s, e) => s + e.amount, 0);
        return {
          summary: [
            { label: "Income", value: money(income) },
            { label: "Expenses", value: money(expense) },
            { label: "Net", value: `${income - expense < 0 ? "-" : ""}${money(Math.abs(income - expense))}` },
          ],
          columns: [{ key: "label", label: "Line Item" }, { key: "amount", label: "Amount" }],
          rows: [
            { label: "Fee collections", amount: money(income) },
            { label: "Paid expenses (including salaries)", amount: `-${money(expense)}` },
            { label: "Net", amount: `${income - expense < 0 ? "-" : ""}${money(Math.abs(income - expense))}` },
          ],
          chart: [{ name: "Income", value: income }, { name: "Expenses", value: expense }],
        };
      }
      case "vendor-payment": {
        const rows = vendors.data ?? [];
        return {
          summary: [
            { label: "Vendors", value: String(rows.length) },
            { label: "Total Purchases", value: money(rows.reduce((s, v) => s + v.totalPurchases, 0)) },
            { label: "Outstanding", value: money(rows.reduce((s, v) => s + v.outstandingBalance, 0)) },
          ],
          columns: [
            { key: "vendorName", label: "Vendor" }, { key: "category", label: "Category" },
            { key: "totalPurchases", label: "Total Purchases" }, { key: "outstandingBalance", label: "Outstanding" },
          ],
          rows: rows.map((v) => ({ vendorName: v.vendorName, category: v.category, totalPurchases: money(v.totalPurchases), outstandingBalance: money(v.outstandingBalance) })),
          chart: rows.filter((v) => v.totalPurchases > 0).map((v) => ({ name: v.vendorName.split(" ")[0], value: v.totalPurchases })),
        };
      }
      case "payroll": {
        const rows = slips.data?.payslips ?? [];
        const byDept = new Map<string, number>();
        rows.forEach((p) => byDept.set(p.department || "—", (byDept.get(p.department || "—") ?? 0) + p.netSalary));
        return {
          summary: [
            { label: "Net Payroll", value: money(rows.reduce((s, p) => s + p.netSalary, 0)) },
            { label: "Staff", value: String(rows.length) },
            { label: "Status", value: run?.status ?? "—" },
          ],
          columns: [
            { key: "employeeId", label: "Employee ID" }, { key: "staffName", label: "Staff" }, { key: "department", label: "Department" },
            { key: "basic", label: "Basic" }, { key: "deduction", label: "Deductions" }, { key: "netSalary", label: "Net Salary" },
          ],
          rows: rows.map((p) => ({ employeeId: p.employeeId, staffName: p.staffName, department: p.department || "—", basic: money(p.basicSalary), deduction: money(p.deduction), netSalary: money(p.netSalary) })),
          chart: Array.from(byDept.entries()).map(([name, value]) => ({ name, value })),
        };
      }
      case "reversals": {
        const rows = (payments.data ?? []).filter((p) => p.status === "Reversed" && inRange(p.paymentDate, from, to));
        return {
          summary: [{ label: "Reversals", value: String(rows.length) }, { label: "Total Reversed", value: money(rows.reduce((s, p) => s + p.amount, 0)) }],
          columns: [
            { key: "paymentId", label: "Receipt" }, { key: "studentName", label: "Student" }, { key: "amount", label: "Amount" },
            { key: "paymentDate", label: "Paid On" }, { key: "reason", label: "Reason" },
          ],
          rows: rows.map((p) => ({ paymentId: p.paymentId, studentName: p.studentName, amount: money(p.amount), paymentDate: p.paymentDate, reason: p.reversedReason || "—" })),
        };
      }
      default:
        return null;
    }
  }, [generated, payments.data, fees.data, expenses.data, vendors.data, slips.data, run, from, to, className, status, money]);

  const loading = payments.isLoading || fees.isLoading || (canFinance && expenses.isLoading);
  const chartData = result?.chart ?? [];
  const show = (f: "dates" | "class" | "status" | "run") => activeType.filters.includes(f);

  return (
    <div className="space-y-4">
      <PremiumCard className="space-y-3 p-4">
        <div className="flex flex-wrap items-center gap-3">
          <PremiumSelect className="w-60" value={reportType} onChange={(v) => { setReportType(v); setGenerated(null); }}
            options={types.map((r) => ({ value: r.id, label: r.label }))} />
          {show("dates") && (<>
            <input type="date" value={from} max={to} onChange={(e) => setFrom(e.target.value)} className={dateInputClass} title="From date" />
            <input type="date" value={to} min={from} onChange={(e) => setTo(e.target.value)} className={dateInputClass} title="To date" />
          </>)}
          {show("class") && (
            <PremiumSelect className="w-44" value={className} onChange={setClassName}
              options={[{ value: "", label: "All Classes" }, ...classes.map((c) => ({ value: c, label: c }))]} />
          )}
          {show("status") && (
            <PremiumSelect className="w-40" value={status} onChange={setStatus}
              options={[{ value: "", label: "Any Status" }, ...FEE_STATUS_OPTIONS.filter((s) => s !== "Paid" && s !== "No Fees").map((s) => ({ value: s, label: s }))]} />
          )}
          {show("run") && (
            <PremiumSelect className="w-52" value={run?.id ?? ""} onChange={setRunId} disabled={!runs.data?.length}
              placeholder="No payroll runs" options={(runs.data ?? []).map((r) => ({ value: r.id, label: `${monthLabel(r.month)} · ${r.status}` }))} />
          )}
        </div>
        <p className="text-[11.5px] text-muted-foreground">{activeType.description}</p>
        <div className="flex justify-end">
          <Button size="sm" className="h-8 text-[12px]" disabled={loading} onClick={() => setGenerated(reportType)}>
            {loading ? "Loading data…" : "Generate Report"}
          </Button>
        </div>
      </PremiumCard>

      {result && (
        <div className="t-content-in space-y-4">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {result.summary.map((s, i) => {
              const meta = SUMMARY_META[s.label] ?? DEFAULT_META;
              return (
                <Reveal key={s.label} delay={i * 40}>
                  <KPITrendCard label={s.label} value={s.value} icon={meta.icon} iconCls={meta.tone} />
                </Reveal>
              );
            })}
          </div>

          {chartData.length > 0 && (
            <PremiumCard className="p-4">
              <div className="h-56 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ left: -12, right: 4, top: 4 }}>
                    <CartesianGrid vertical={false} stroke="hsl(var(--border))" strokeDasharray="3 3" />
                    <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                    <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" width={56} tickFormatter={money.short} />
                    <RTooltip cursor={{ fill: "hsl(var(--muted))" }} formatter={(v: number) => money(v)} />
                    <Bar dataKey="value" fill="#2a78d6" radius={[4, 4, 0, 0]} maxBarSize={26} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </PremiumCard>
          )}

          <PremiumCard>
            <div className="flex items-center justify-between border-b border-border/50 p-3">
              <p className="text-[12.5px] font-semibold text-foreground">{activeType.label}</p>
              <div className="flex gap-2 print:hidden">
                <Button variant="outline" size="sm" className="h-7 gap-1.5 text-[11.5px]" disabled={result.rows.length === 0}
                  onClick={() => downloadCsv(`${activeType.id}-${todayIso()}`, result)}>
                  <Download className="h-3.5 w-3.5" /> Export CSV
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
          </PremiumCard>
        </div>
      )}
    </div>
  );
}
