/**
 * Billing: fees (structures, invoices, payments, discounts, student roster,
 * reports) and finance (expenses, vendors, payroll). API access, mapping to the
 * billing pages' view models, and query hooks.
 */
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { del, get, getAll, patch, post, type Page, type Schemas } from "./http";
import type {
  Expense, ExpenseCategory, ExpenseStatus, FeeCategoryRef, FeeDiscount, FeeFrequency, FeeStatus, FeeStructure,
  Invoice, InvoiceStatus, Payment, PaymentMethod, Payroll, PayrollRun, PayrollStatus, StudentFee, Vendor,
  VendorCategory,
} from "./types/billing";

const num = (v: string | number | null | undefined) => (v === null || v === undefined || v === "" ? 0 : Number(v));
const invert = <T extends string>(m: Record<string, T>) => Object.fromEntries(Object.entries(m).map(([k, v]) => [v, k])) as Record<T, string>;

// ── vocabularies (API value ↔ label) ─────────────────────────────────────────

export const METHOD_LABEL: Record<string, PaymentMethod> = {
  cash: "Cash", bank: "Bank Transfer", card: "Card", online: "Online Payment", wallet: "Online Wallet",
  mobile_banking: "Mobile Banking", cheque: "Cheque",
};
export const METHOD_VALUE = invert(METHOD_LABEL);

const INVOICE_STATUS: Record<string, InvoiceStatus> = {
  unpaid: "Issued", partial: "Partially Paid", paid: "Paid", overdue: "Overdue", cancelled: "Cancelled", refunded: "Refunded",
};
export const INVOICE_STATUS_VALUE = invert(INVOICE_STATUS);

const FEE_STATUS: Record<string, FeeStatus> = {
  paid: "Paid", partial: "Partial", due: "Due", overdue: "Overdue", waived: "Waived", no_fees: "No Fees",
};
export const FEE_STATUS_VALUE = invert(FEE_STATUS);

export const EXPENSE_CATEGORY: Record<string, ExpenseCategory> = {
  teacher_salary: "Teacher Salary", staff_salary: "Staff Salary", stationery: "Stationery", books: "Books",
  furniture: "Furniture", maintenance: "Maintenance", electricity: "Electricity", internet: "Internet", rent: "Rent",
  fuel: "Transport Fuel", hostel: "Hostel", library: "Library", lab: "Lab Materials", events: "Events", misc: "Miscellaneous",
};
export const EXPENSE_CATEGORY_VALUE = invert(EXPENSE_CATEGORY);

const EXPENSE_STATUS: Record<string, ExpenseStatus> = {
  pending: "Pending", approved: "Approved", paid: "Paid", rejected: "Rejected",
};

export const VENDOR_CATEGORY: Record<string, VendorCategory> = {
  stationery: "Stationery Supplier", books: "Book Supplier", uniform: "Uniform Supplier", food: "Food/Canteen",
  transport: "Transport", maintenance: "Maintenance", it: "IT Services", furniture: "Furniture", other: "Other",
};
export const VENDOR_CATEGORY_VALUE = invert(VENDOR_CATEGORY);

export const FREQUENCY_LABEL: Record<string, FeeFrequency> = {
  one_time: "One-time", monthly: "Monthly", term: "Term", annual: "Annual",
};
export const FREQUENCY_VALUE = invert(FREQUENCY_LABEL);

const PAYROLL_STATUS: Record<string, PayrollStatus> = { draft: "Draft", approved: "Approved", paid: "Paid" };

/** "2026-10" -> "October 2026" */
export function monthLabel(ym: string): string {
  const [y, m] = ym.split("-").map(Number);
  return y && m ? new Date(y, m - 1, 1).toLocaleDateString("en", { month: "long", year: "numeric" }) : ym;
}

// ── currency ─────────────────────────────────────────────────────────────────

export interface FeeSettings {
  currency: string; currency_symbol: string; late_fee_enabled: boolean; late_fee_amount: number;
  late_fee_type: "fixed" | "percentage"; grace_period_days: number; payment_methods: Record<string, boolean>;
}

export function useFeeSettings() {
  return useQuery({
    queryKey: ["settings", "fees"],
    queryFn: () => get<FeeSettings>("/settings/fees/"),
    staleTime: 10 * 60_000,
  });
}

/** Formats amounts with the school's currency symbol (Settings → Fees). */
export function useMoney() {
  const symbol = useFeeSettings().data?.currency_symbol ?? "";
  const money = (n: number | null | undefined) =>
    n === null || n === undefined ? "—" : `${symbol}${symbol && !symbol.endsWith(" ") ? " " : ""}${Math.round(n).toLocaleString()}`;
  /** Compact form for chart axes: "Rs. 12k". */
  money.short = (n: number) => `${symbol ? `${symbol} ` : ""}${n >= 1000 ? `${Math.round(n / 1000)}k` : Math.round(n)}`;
  return money;
}

// ── mappers ──────────────────────────────────────────────────────────────────

export function mapInvoice(i: Schemas["Invoice"]): Invoice {
  const items = (i.items ?? []).map((it) => ({
    id: it.id, label: it.description, category: it.category_name ?? "", qty: it.quantity ?? 1,
    unitPrice: num(it.unit_price), amount: num(it.amount),
  }));
  const cats = [...new Set(items.map((it) => it.category).filter(Boolean))];
  return {
    id: i.id, invoiceNo: i.number, studentId: i.student, studentName: i.student_name, admissionNo: i.admission_number,
    className: i.class_level_name, section: i.section_name ?? "", billingPeriod: i.billing_period ?? "",
    feeType: cats.length === 1 ? cats[0] : cats.length ? "Mixed" : "",
    issueDate: i.issue_date, dueDate: i.due_date ?? "", amount: num(i.total_amount), discount: num(i.discount_amount),
    paid: num(i.paid_amount), balance: num(i.balance), status: INVOICE_STATUS[i.status] ?? "Issued",
    cancelledReason: i.cancelled_reason ?? "", items,
  };
}

export function mapPayment(p: Schemas["Payment"]): Payment {
  return {
    id: p.id, paymentId: p.receipt_number, invoiceId: p.invoice, invoiceNo: p.invoice_number, studentName: p.student_name,
    amount: num(p.amount), method: METHOD_LABEL[p.method ?? "cash"] ?? "Cash", transactionId: p.transaction_id ?? "",
    paymentDate: (p.paid_at ?? "").slice(0, 10), receivedBy: p.received_by ?? "",
    status: p.is_reversed ? "Reversed" : "Completed", remarks: p.remarks ?? "", reversedReason: p.reversed_reason ?? "",
  };
}

export function mapExpense(e: Schemas["Expense"]): Expense {
  return {
    id: e.id, expenseId: e.code, category: EXPENSE_CATEGORY[e.category] ?? "Miscellaneous", vendorId: e.vendor ?? null,
    vendor: e.vendor_name ?? "", description: e.description, amount: num(e.amount),
    paymentMethod: METHOD_LABEL[e.payment_method ?? ""] ?? (e.payment_method ?? ""), date: e.expense_date,
    recordedBy: e.recorded_by ?? "", approvedBy: e.decided_by_name ?? "", status: EXPENSE_STATUS[e.status] ?? "Pending",
    attachmentName: e.receipt?.original_name ?? undefined, attachmentId: e.receipt?.id ?? undefined,
    attachment: e.receipt ?? undefined,
    remarks: e.remarks ?? "", fromPayroll: !!e.payroll_run,
  };
}

export function mapVendor(v: Schemas["Vendor"]): Vendor {
  return {
    id: v.id, vendorId: v.code, vendorName: v.name, category: VENDOR_CATEGORY[v.category ?? "other"] ?? "Other",
    contactPerson: v.contact_person ?? "", phone: v.phone ?? "", email: (v.email as string | null) ?? "",
    address: v.address ?? "", taxId: v.tax_id ?? "", totalPurchases: num(v.total_purchases),
    outstandingBalance: num(v.outstanding), status: v.status === "inactive" ? "Inactive" : "Active",
  };
}

export function mapStructure(s: Schemas["FeeStructure"]): FeeStructure {
  return {
    id: s.id, name: s.name, categoryId: s.category, category: s.category_name, classLevelId: s.class_level ?? null,
    className: s.class_level_name ?? "All Classes", academicYearId: s.academic_year, amount: num(s.amount),
    frequency: FREQUENCY_LABEL[s.frequency ?? "monthly"] ?? "Monthly",
  };
}

export function mapRun(r: Schemas["PayrollRun"]): PayrollRun {
  return {
    id: r.id, month: r.month, workingDays: r.working_days ?? 0, status: PAYROLL_STATUS[r.status] ?? "Draft",
    approvedBy: r.approved_by_name ?? "", approvedAt: r.approved_at ?? null, paidAt: r.paid_at ?? null,
  };
}

interface ApiPayslip {
  id: string; run: string; month: string; run_status: string; teacher: string; teacher_name: string;
  employee_id: string; department: string; basic: string; allowances: string; bonus: string; absent_days: number;
  attendance_deduction: string; provident_fund: string; tax: string; other_deduction: string; net: string;
  payment_method: string; note: string;
}

export function mapPayslip(p: ApiPayslip): Payroll {
  const att = num(p.attendance_deduction), pf = num(p.provident_fund), tax = num(p.tax), other = num(p.other_deduction);
  return {
    id: p.id, runId: p.run, employeeId: p.employee_id, staffName: p.teacher_name, department: p.department ?? "",
    month: p.month, basicSalary: num(p.basic), allowance: num(p.allowances), bonus: num(p.bonus),
    absentDays: p.absent_days ?? 0, attendanceDeduction: att, providentFund: pf, taxDeduction: tax, otherDeduction: other,
    deduction: att + pf + tax + other, netSalary: num(p.net), status: PAYROLL_STATUS[p.run_status] ?? "Draft",
    paymentMethod: METHOD_LABEL[p.payment_method] ?? (p.payment_method ?? ""), note: p.note ?? "",
  };
}

// ── fees: reads ──────────────────────────────────────────────────────────────

export function useInvoices() {
  return useQuery({
    queryKey: ["billing", "invoices"],
    queryFn: async () => (await getAll<Schemas["Invoice"]>("/fees/invoices/")).map(mapInvoice)
      .sort((a, b) => b.issueDate.localeCompare(a.issueDate) || b.invoiceNo.localeCompare(a.invoiceNo)),
    staleTime: 30_000,
  });
}

export function useInvoice(id: string | undefined) {
  return useQuery({
    queryKey: ["billing", "invoice", id],
    queryFn: async () => {
      const [invoice, payments, discounts] = await Promise.all([
        get<Schemas["Invoice"]>(`/fees/invoices/${id}/`).then(mapInvoice),
        getAll<Schemas["Payment"]>("/fees/payments/", { invoice: id }).then((r) => r.map(mapPayment)),
        getAll<Schemas["FeeDiscount"]>("/fees/discounts/", { invoice: id }).then((r) => r.map(mapDiscount)).catch(() => []),
      ]);
      return { invoice, payments, discounts };
    },
    enabled: !!id,
  });
}

export function usePayments() {
  return useQuery({
    queryKey: ["billing", "payments"],
    queryFn: async () => (await getAll<Schemas["Payment"]>("/fees/payments/")).map(mapPayment)
      .sort((a, b) => b.paymentDate.localeCompare(a.paymentDate) || b.paymentId.localeCompare(a.paymentId)),
    staleTime: 30_000,
  });
}

export function usePayment(id: string | undefined) {
  return useQuery({
    queryKey: ["billing", "payment", id],
    queryFn: async () => {
      const payment = mapPayment(await get<Schemas["Payment"]>(`/fees/payments/${id}/`));
      const invoice = mapInvoice(await get<Schemas["Invoice"]>(`/fees/invoices/${payment.invoiceId}/`));
      return { payment, invoice };
    },
    enabled: !!id,
  });
}

interface ApiStudentFee {
  student: string; name: string; admission_number: string; registration_number: string; class_level_name: string;
  section_name: string | null; billed: number; discount: number; paid: number; due: number; status: string;
  next_due_date: string | null;
}

export function useStudentFees() {
  return useQuery({
    queryKey: ["billing", "student-fees"],
    queryFn: async () => {
      const rows: ApiStudentFee[] = [];
      for (let page = 1; ; page += 1) {
        const data = await get<Page<ApiStudentFee>>("/fees/student-fees/", { page, page_size: 200 });
        rows.push(...data.results);
        if (!data.next) break;
      }
      return rows.map((r): StudentFee => ({
        id: r.student, studentId: r.student, studentName: r.name, admissionNo: r.admission_number,
        registrationNo: r.registration_number, className: r.class_level_name, section: r.section_name ?? "",
        totalFee: r.billed, paid: r.paid, due: r.due, discount: r.discount, status: FEE_STATUS[r.status] ?? "Due",
        nextDueDate: r.next_due_date,
      }));
    },
    staleTime: 30_000,
  });
}

export function useFeeStructures() {
  return useQuery({
    queryKey: ["billing", "structures"],
    queryFn: async () => (await getAll<Schemas["FeeStructure"]>("/fees/fee-structures/")).map(mapStructure),
    staleTime: 60_000,
  });
}

export function useFeeCategories() {
  return useQuery({
    queryKey: ["billing", "categories"],
    queryFn: async () => (await getAll<Schemas["FeeCategory"]>("/fees/fee-categories/"))
      .map((c): FeeCategoryRef => ({ id: c.id, name: c.name, code: c.code })),
    staleTime: 5 * 60_000,
  });
}

export function mapDiscount(d: Schemas["FeeDiscount"]): FeeDiscount {
  const status = d.status === "approved" ? "Approved" : d.status === "rejected" ? "Rejected" : "Pending";
  return {
    id: d.id, invoiceId: d.invoice, invoiceNo: d.invoice_number, studentName: d.student_name, amount: num(d.amount),
    reason: d.reason, status, requestedBy: d.requested_by ?? "", decidedBy: d.decided_by_name ?? "",
    createdAt: (d.created_at ?? "").slice(0, 10),
  };
}

export function useDiscounts() {
  return useQuery({
    queryKey: ["billing", "discounts"],
    queryFn: async () => (await getAll<Schemas["FeeDiscount"]>("/fees/discounts/")).map(mapDiscount),
    staleTime: 30_000,
  });
}

export interface FeeSummary {
  billed: number; discounts: number; collected: number; collectedByMethod: Record<string, number>;
  outstanding: number; openInvoices: number; overdueInvoices: number; pendingDiscounts: number;
}

export function useFeeSummary(from?: string, to?: string) {
  return useQuery({
    queryKey: ["billing", "summary", from, to],
    queryFn: async (): Promise<FeeSummary> => {
      const r = await get<{
        billed: number; discounts: number; collected: number; collected_by_method: Record<string, number>;
        outstanding: number; open_invoices: number; overdue_invoices: number; pending_discounts: number;
      }>("/fees/reports/summary/", { date_from: from, date_to: to });
      return {
        billed: r.billed, discounts: r.discounts, collected: r.collected,
        collectedByMethod: Object.fromEntries(Object.entries(r.collected_by_method).map(([k, v]) => [METHOD_LABEL[k] ?? k, v])),
        outstanding: r.outstanding, openInvoices: r.open_invoices, overdueInvoices: r.overdue_invoices,
        pendingDiscounts: r.pending_discounts,
      };
    },
    staleTime: 30_000,
  });
}

export interface FinanceSummary {
  trend: { month: string; income: number; expenses: number; net: number }[];
  paidThisMonth: number; byCategory: Record<string, number>; pendingApproval: number; approvedUnpaid: number;
  payrollDue: number;
}

export function useFinanceSummary(months = 6, enabled = true) {
  return useQuery({
    queryKey: ["billing", "finance-summary", months],
    queryFn: async (): Promise<FinanceSummary> => {
      const r = await get<{
        trend: { month: string; income: number; expenses: number; net: number }[];
        this_month: { paid: number; by_category: Record<string, number>; pending_approval: number; approved_unpaid: number };
        payroll_due: number;
      }>("/finance/summary/", { months });
      return {
        trend: r.trend, paidThisMonth: r.this_month.paid,
        byCategory: Object.fromEntries(Object.entries(r.this_month.by_category).map(([k, v]) => [EXPENSE_CATEGORY[k] ?? k, v])),
        pendingApproval: r.this_month.pending_approval, approvedUnpaid: r.this_month.approved_unpaid,
        payrollDue: r.payroll_due,
      };
    },
    enabled,
    staleTime: 60_000,
  });
}

export interface LedgerEntry { date: string; type: string; reference: string; description: string; debit: number; credit: number; balance: number }

export function useLedger(studentId: string | undefined) {
  return useQuery({
    queryKey: ["billing", "ledger", studentId],
    queryFn: () => get<{ name: string; entries: LedgerEntry[]; balance: number }>("/fees/ledger/", { student: studentId }),
    enabled: !!studentId,
  });
}

export function useDefaulters() {
  return useQuery({
    queryKey: ["billing", "defaulters"],
    queryFn: () => get<{ student: string; name: string; admission_number: string; class_level_name: string;
      section_name: string | null; overdue_amount: number; invoices: number; oldest_due_date: string | null }[]>(
      "/fees/reports/defaulters/"),
    staleTime: 60_000,
  });
}

// ── finance: reads ───────────────────────────────────────────────────────────

export function useExpenses(enabled = true) {
  return useQuery({
    enabled,
    queryKey: ["billing", "expenses"],
    queryFn: async () => (await getAll<Schemas["Expense"]>("/finance/expenses/")).map(mapExpense)
      .sort((a, b) => b.date.localeCompare(a.date) || b.expenseId.localeCompare(a.expenseId)),
    staleTime: 30_000,
  });
}

export function useVendors(enabled = true) {
  return useQuery({
    enabled,
    queryKey: ["billing", "vendors"],
    queryFn: async () => (await getAll<Schemas["Vendor"]>("/finance/vendors/")).map(mapVendor),
    staleTime: 60_000,
  });
}

export function usePayrollRuns(enabled = true) {
  return useQuery({
    enabled,
    queryKey: ["billing", "payroll-runs"],
    queryFn: async () => (await getAll<Schemas["PayrollRun"]>("/finance/payroll-runs/")).map(mapRun)
      .sort((a, b) => b.month.localeCompare(a.month)),
    staleTime: 30_000,
  });
}

export function usePayslips(runId: string | undefined) {
  return useQuery({
    queryKey: ["billing", "payslips", runId],
    queryFn: async () => {
      const r = await get<{ run: Schemas["PayrollRun"]; totals: Record<string, number | string>; payslips: ApiPayslip[] }>(
        `/finance/payroll-runs/${runId}/payslips/`);
      return { run: mapRun(r.run), payslips: r.payslips.map(mapPayslip) };
    },
    enabled: !!runId,
  });
}

// ── writes ───────────────────────────────────────────────────────────────────

function useBillingMutation<V, R>(fn: (v: V) => Promise<R>) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: fn,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["billing"] });
      qc.invalidateQueries({ queryKey: ["students"] });
    },
  });
}

export interface InvoiceDraft {
  student: string; issueDate: string; dueDate: string; billingPeriod: string;
  items: { category: string | null; description: string; quantity: number; unitPrice: string }[];
}

/** Creates the invoice, then its items. */
export function useCreateInvoice() {
  return useBillingMutation(async (d: InvoiceDraft) => {
    const inv = await post<Schemas["Invoice"]>("/fees/invoices/", {
      student: d.student, issue_date: d.issueDate, due_date: d.dueDate || null, billing_period: d.billingPeriod,
    });
    for (const it of d.items) {
      await post("/fees/invoice-items/", {
        invoice: inv.id, category: it.category, description: it.description, quantity: it.quantity, unit_price: it.unitPrice,
      });
    }
    return inv;
  });
}

export function useGenerateInvoices() {
  return useBillingMutation((body: {
    academic_year: string; billing_period: string; issue_date: string; due_date: string | null;
    class_level?: string | null; fee_structures?: string[];
  }) => post<{ created: number; skipped_already_billed: number; no_applicable_fees: number; total_billed: number }>("/fees/invoices/generate/", body));
}

export function useCancelInvoice() {
  return useBillingMutation((v: { id: string; reason: string }) => post(`/fees/invoices/${v.id}/cancel/`, { reason: v.reason }));
}

export function useRecordPayment() {
  return useBillingMutation((v: { invoice: string; amount: string; method: string; paidAt: string; transactionId: string; remarks?: string }) =>
    post<Schemas["Payment"]>("/fees/payments/", {
      invoice: v.invoice, amount: v.amount, method: v.method, paid_at: v.paidAt ? `${v.paidAt}T12:00:00` : undefined,
      transaction_id: v.transactionId, remarks: v.remarks ?? "",
    }));
}

export function useReversePayment() {
  return useBillingMutation((v: { id: string; reason: string }) => post(`/fees/payments/${v.id}/reverse/`, { reason: v.reason }));
}

export function useRequestDiscount() {
  return useBillingMutation((v: { invoice: string; amount: string; reason: string }) => post("/fees/discounts/", v));
}

export function useDecideDiscount() {
  return useBillingMutation((v: { id: string; approve: boolean; note?: string }) =>
    post(`/fees/discounts/${v.id}/${v.approve ? "approve" : "reject"}/`, { note: v.note ?? "" }));
}

export function useSaveStructure() {
  return useBillingMutation((v: { id?: string; body: Record<string, unknown> }) =>
    v.id ? patch(`/fees/fee-structures/${v.id}/`, v.body) : post("/fees/fee-structures/", v.body));
}

export function useDeleteStructure() {
  return useBillingMutation((id: string) => del(`/fees/fee-structures/${id}/`));
}

export function useSaveFeeCategory() {
  return useBillingMutation((v: { id?: string; name: string; code: string }) =>
    v.id ? patch(`/fees/fee-categories/${v.id}/`, { name: v.name, code: v.code })
      : post<Schemas["FeeCategory"]>("/fees/fee-categories/", { name: v.name, code: v.code }));
}

export function useDeleteFeeCategory() {
  return useBillingMutation((id: string) => del(`/fees/fee-categories/${id}/`));
}

export function useSaveExpense() {
  return useBillingMutation((v: { id?: string; body: Record<string, unknown> }) =>
    v.id ? patch(`/finance/expenses/${v.id}/`, v.body) : post("/finance/expenses/", v.body));
}

export function useExpenseAction() {
  return useBillingMutation((v: { id: string; action: "approve" | "reject" | "pay"; remarks?: string; paymentMethod?: string }) =>
    post(`/finance/expenses/${v.id}/${v.action}/`, { remarks: v.remarks, payment_method: v.paymentMethod }));
}

export function useDeleteExpense() {
  return useBillingMutation((id: string) => del(`/finance/expenses/${id}/`));
}

export function useSaveVendor() {
  return useBillingMutation((v: { id?: string; body: Record<string, unknown> }) =>
    v.id ? patch(`/finance/vendors/${v.id}/`, v.body) : post("/finance/vendors/", v.body));
}

export function useDeleteVendor() {
  return useBillingMutation((id: string) => del(`/finance/vendors/${id}/`));
}

export function useCreatePayrollRun() {
  return useBillingMutation((v: { month: string; workingDays?: number }) =>
    post<Schemas["PayrollRun"]>("/finance/payroll-runs/", { month: v.month, ...(v.workingDays ? { working_days: v.workingDays } : {}) }));
}

export function usePayrollAction() {
  return useBillingMutation((v: { id: string; action: "approve" | "pay" | "generate" }) =>
    post(`/finance/payroll-runs/${v.id}/${v.action}/`, {}));
}

export function useDeletePayrollRun() {
  return useBillingMutation((id: string) => del(`/finance/payroll-runs/${id}/`));
}

export function useAdjustPayslip() {
  return useBillingMutation((v: { runId: string; id: string; bonus: string; otherDeduction: string; note: string }) =>
    patch(`/finance/payroll-runs/${v.runId}/payslips/${v.id}/`, { bonus: v.bonus, other_deduction: v.otherDeduction, note: v.note }));
}

export function useSaveFeeSettings() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (patchBody: Partial<FeeSettings>) => patch<FeeSettings>("/settings/fees/", patchBody),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["settings"] }),
  });
}
