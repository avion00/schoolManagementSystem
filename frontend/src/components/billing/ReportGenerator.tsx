import { useMemo, useState } from "react";
import {
  Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip as RTooltip, XAxis, YAxis,
} from "recharts";
import {
  Download, Printer, DollarSign, Receipt, TrendingUp, TrendingDown, Users, Wallet,
  ListChecks, Clock, GraduationCap, CheckCircle2, Building2, ShoppingCart, RotateCcw,
  Banknote, BarChart3, type LucideIcon,
} from "lucide-react";
import { toast } from "sonner";

import { CATEGORICAL_COLORS, STATUS_COLORS } from "@/components/charts/palette";
import { Reveal } from "@/components/motion";
import { Button } from "@/components/ui/button";
import { KPITrendCard, type KPITrend } from "@/components/ui/KPITrendCard";
import { METRIC_TONES } from "@/components/ui/MetricCard";
import { PremiumCard } from "@/components/ui/PremiumCard";
import { PremiumSelect } from "@/components/ui/PremiumSelect";
import {
  CLASS_OPTIONS, EXPENSES, FEE_CATEGORY_OPTIONS, INVOICE_STATUS_OPTIONS,
  PAYMENTS, PAYROLL, REPORT_TYPES, STUDENT_FEES, VENDORS,
  type ReportTypeDef,
} from "@/data/billingData";

interface SummaryMeta {
  icon: LucideIcon;
  tone: string;
  sparkColor: string;
  sparkData: Record<string, number>[];
  trend?: KPITrend;
}

const moneyUp = (base: number): Record<string, number>[] => [0.88, 0.91, 0.94, 0.96, 0.98, 0.99, 1].map((f) => ({ value: Math.round(base * f) }));
const moneyDown = (base: number): Record<string, number>[] => [1.12, 1.09, 1.06, 1.04, 1.02, 1.01, 1].map((f) => ({ value: Math.round(base * f) }));
const countUp = (base: number): Record<string, number>[] => [0.8, 0.85, 0.88, 0.92, 0.95, 0.98, 1].map((f) => ({ value: Math.max(0, Math.round(base * f)) }));
const countDown = (base: number): Record<string, number>[] => [1.2, 1.15, 1.1, 1.06, 1.03, 1.01, 1].map((f) => ({ value: Math.max(0, Math.round(base * f)) }));

/** Icon/tone/mock-trend lookup for the report-summary tiles — keyed by the exact
 * label strings `buildReport()` emits across its 9 report types. A generic
 * fallback covers any label not explicitly listed. */
const SUMMARY_META: Record<string, SummaryMeta> = {
  "Total Collected": { icon: DollarSign, tone: METRIC_TONES.green, sparkColor: STATUS_COLORS.good, sparkData: moneyUp(180000), },
  "Payments": { icon: Receipt, tone: METRIC_TONES.blue, sparkColor: CATEGORICAL_COLORS[0], sparkData: countUp(120), },
  "Avg. Payment": { icon: TrendingUp, tone: METRIC_TONES.purple, sparkColor: CATEGORICAL_COLORS[4], sparkData: moneyUp(1500), },
  "Students with Dues": { icon: Users, tone: METRIC_TONES.amber, sparkColor: STATUS_COLORS.warning, sparkData: countDown(45), },
  "Total Outstanding": { icon: Wallet, tone: METRIC_TONES.red, sparkColor: STATUS_COLORS.critical, sparkData: moneyDown(85000), },
  "Total Expenses": { icon: TrendingDown, tone: METRIC_TONES.red, sparkColor: STATUS_COLORS.critical, sparkData: moneyUp(372000), },
  "Entries": { icon: ListChecks, tone: METRIC_TONES.blue, sparkColor: CATEGORICAL_COLORS[0], sparkData: countUp(35), },
  "Total Payroll": { icon: Wallet, tone: METRIC_TONES.purple, sparkColor: CATEGORICAL_COLORS[4], sparkData: moneyUp(604000), },
  "Staff": { icon: Users, tone: METRIC_TONES.blue, sparkColor: CATEGORICAL_COLORS[0], sparkData: countUp(15), },
  "Pending": { icon: Clock, tone: METRIC_TONES.amber, sparkColor: STATUS_COLORS.warning, sparkData: countDown(6), },
  "Income": { icon: TrendingUp, tone: METRIC_TONES.green, sparkColor: STATUS_COLORS.good, sparkData: moneyUp(210000), },
  "Expenses": { icon: TrendingDown, tone: METRIC_TONES.red, sparkColor: STATUS_COLORS.critical, sparkData: moneyUp(372000), },
  "Net Profit": { icon: Banknote, tone: METRIC_TONES.green, sparkColor: STATUS_COLORS.good, sparkData: moneyUp(60000), },
  "Students": { icon: GraduationCap, tone: METRIC_TONES.blue, sparkColor: CATEGORICAL_COLORS[0], sparkData: countUp(320), },
  "Total Fee": { icon: Wallet, tone: METRIC_TONES.purple, sparkColor: CATEGORICAL_COLORS[4], sparkData: moneyUp(950000), },
  "Total Paid": { icon: CheckCircle2, tone: METRIC_TONES.green, sparkColor: STATUS_COLORS.good, sparkData: moneyUp(720000), },
  "Vendors": { icon: Building2, tone: METRIC_TONES.cyan, sparkColor: CATEGORICAL_COLORS[5], sparkData: countUp(10), },
  "Total Purchases": { icon: ShoppingCart, tone: METRIC_TONES.purple, sparkColor: CATEGORICAL_COLORS[4], sparkData: moneyUp(1954000), },
  "Outstanding": { icon: Clock, tone: METRIC_TONES.amber, sparkColor: STATUS_COLORS.warning, sparkData: moneyDown(96000), },
  "Refunds": { icon: RotateCcw, tone: METRIC_TONES.red, sparkColor: STATUS_COLORS.critical, sparkData: countDown(5), },
  "Total Refunded": { icon: Banknote, tone: METRIC_TONES.red, sparkColor: STATUS_COLORS.critical, sparkData: moneyDown(8000), },
};

const DEFAULT_SUMMARY_META: SummaryMeta = {
  icon: BarChart3, tone: METRIC_TONES.neutral, sparkColor: CATEGORICAL_COLORS[0],
  sparkData: countUp(10),
};

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
      <PremiumCard className="space-y-3 p-4">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          <PremiumSelect
            value={reportType}
            onChange={setReportType}
            options={REPORT_TYPES.map((r) => ({ value: r.id, label: r.label }))}
          />
          <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className={dateInputClass} title="From date" />
          <input type="date" value={to} onChange={(e) => setTo(e.target.value)} className={dateInputClass} title="To date" />
          <PremiumSelect
            value={className}
            onChange={setClassName}
            options={[{ value: "", label: "All Classes" }, ...CLASS_OPTIONS.map((c) => ({ value: c, label: c }))]}
          />
          <PremiumSelect
            value={feeType}
            onChange={setFeeType}
            options={[{ value: "", label: "All Fee Types" }, ...FEE_CATEGORY_OPTIONS.map((c) => ({ value: c, label: c }))]}
          />
          <PremiumSelect
            value={status}
            onChange={setStatus}
            options={[{ value: "", label: "Any Status" }, ...INVOICE_STATUS_OPTIONS.map((s) => ({ value: s, label: s }))]}
          />
        </div>
        <p className="text-[11.5px] text-muted-foreground">{activeType.description}</p>
        <div className="flex justify-end">
          <Button size="sm" className="h-8 text-[12px]" onClick={generate}>Generate Report</Button>
        </div>
      </PremiumCard>

      {result && (
        <div className="t-content-in space-y-4">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {result.summary.map((s, i) => {
              const meta = SUMMARY_META[s.label] ?? DEFAULT_SUMMARY_META;
              return (
                <Reveal key={s.label} delay={i * 40}>
                  <KPITrendCard
                    label={s.label}
                    value={s.value}
                    icon={meta.icon}
                    iconCls={meta.tone}
                    sparklineColor={meta.sparkColor}
                  />
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
                    <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" width={42} tickFormatter={(v: number) => `$${(v / 1000).toFixed(0)}k`} />
                    <RTooltip cursor={{ fill: "hsl(var(--muted))" }} />
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
          </PremiumCard>
        </div>
      )}
    </div>
  );
}
