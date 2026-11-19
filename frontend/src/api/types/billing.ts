/**
 * Billing view models (fees, invoices, payments, expenses, payroll, vendors),
 * built from the API by `src/api/billing.ts`.
 */
export type FeeStatus = "Paid" | "Partial" | "Due" | "Overdue" | "Waived" | "No Fees";
export const FEE_STATUS_OPTIONS: FeeStatus[] = ["Paid", "Partial", "Due", "Overdue", "Waived", "No Fees"];

export type InvoiceStatus = "Issued" | "Partially Paid" | "Paid" | "Overdue" | "Cancelled" | "Refunded";
export const INVOICE_STATUS_OPTIONS: InvoiceStatus[] = ["Issued", "Partially Paid", "Paid", "Overdue", "Cancelled", "Refunded"];

export type PaymentMethod = "Cash" | "Bank Transfer" | "Card" | "Online Payment" | "Online Wallet" | "Mobile Banking" | "Cheque";
export const PAYMENT_METHOD_OPTIONS: PaymentMethod[] = [
  "Cash", "Bank Transfer", "Card", "Online Payment", "Online Wallet", "Mobile Banking", "Cheque",
];

/** A reversed payment stays on record but no longer counts. */
export type PaymentStatus = "Completed" | "Reversed";
export const PAYMENT_STATUS_OPTIONS: PaymentStatus[] = ["Completed", "Reversed"];

export type ExpenseCategory =
  | "Teacher Salary" | "Staff Salary" | "Stationery" | "Books" | "Furniture" | "Maintenance"
  | "Electricity" | "Internet" | "Rent" | "Transport Fuel" | "Hostel" | "Library"
  | "Lab Materials" | "Events" | "Miscellaneous";
export const EXPENSE_CATEGORY_OPTIONS: ExpenseCategory[] = [
  "Teacher Salary", "Staff Salary", "Stationery", "Books", "Furniture", "Maintenance",
  "Electricity", "Internet", "Rent", "Transport Fuel", "Hostel", "Library",
  "Lab Materials", "Events", "Miscellaneous",
];

export type ExpenseStatus = "Pending" | "Approved" | "Paid" | "Rejected";
export const EXPENSE_STATUS_OPTIONS: ExpenseStatus[] = ["Pending", "Approved", "Paid", "Rejected"];

export type PayrollStatus = "Draft" | "Approved" | "Paid";
export const PAYROLL_STATUS_OPTIONS: PayrollStatus[] = ["Draft", "Approved", "Paid"];

export type VendorCategory =
  | "Stationery Supplier" | "Book Supplier" | "Uniform Supplier" | "Food/Canteen"
  | "Transport" | "Maintenance" | "IT Services" | "Furniture" | "Other";
export const VENDOR_CATEGORY_OPTIONS: VendorCategory[] = [
  "Stationery Supplier", "Book Supplier", "Uniform Supplier", "Food/Canteen",
  "Transport", "Maintenance", "IT Services", "Furniture", "Other",
];

export type VendorStatus = "Active" | "Inactive";
export const VENDOR_STATUS_OPTIONS: VendorStatus[] = ["Active", "Inactive"];

export type FeeFrequency = "One-time" | "Monthly" | "Term" | "Annual";
export const FEE_FREQUENCY_OPTIONS: FeeFrequency[] = ["One-time", "Monthly", "Term", "Annual"];

export interface ReportTypeDef { id: string; label: string; description: string }

export interface InvoiceItem {
  id: string;
  label: string;
  category: string;
  qty: number;
  unitPrice: number;
  amount: number;
}

export interface Invoice {
  id: string;
  invoiceNo: string;
  studentId: string;
  studentName: string;
  admissionNo: string;
  className: string;
  section: string;
  billingPeriod: string;
  /** Category of the invoice's items ("Mixed" when they differ). */
  feeType: string;
  issueDate: string;
  dueDate: string;
  amount: number;
  discount: number;
  paid: number;
  balance: number;
  status: InvoiceStatus;
  cancelledReason: string;
  items: InvoiceItem[];
}

export interface Payment {
  id: string;
  paymentId: string;      // receipt number
  invoiceId: string;
  invoiceNo: string;
  studentName: string;
  amount: number;
  method: PaymentMethod;
  transactionId: string;
  paymentDate: string;
  receivedBy: string;
  status: PaymentStatus;
  remarks: string;
  reversedReason: string;
}

export interface Expense {
  id: string;
  expenseId: string;
  category: ExpenseCategory;
  vendorId: string | null;
  vendor: string;
  description: string;
  amount: number;
  paymentMethod: string;
  date: string;
  recordedBy: string;
  approvedBy: string;
  status: ExpenseStatus;
  attachmentName?: string;
  attachmentId?: string;
  /** The uploaded bill/receipt, for downloading. */
  attachment?: { id: string; original_name: string; download_url: string };
  remarks?: string;
  fromPayroll: boolean;
}

/** One payslip in a payroll run. */
export interface Payroll {
  id: string;
  runId: string;
  employeeId: string;
  staffName: string;
  department: string;
  month: string;          // YYYY-MM
  basicSalary: number;
  allowance: number;
  bonus: number;
  absentDays: number;
  attendanceDeduction: number;
  providentFund: number;
  taxDeduction: number;
  otherDeduction: number;
  deduction: number;      // all deductions together
  netSalary: number;
  status: PayrollStatus;
  paymentMethod: string;
  note: string;
}

export interface PayrollRun {
  id: string;
  month: string;
  workingDays: number;
  status: PayrollStatus;
  approvedBy: string;
  approvedAt: string | null;
  paidAt: string | null;
}

export interface Vendor {
  id: string;
  vendorId: string;
  vendorName: string;
  category: VendorCategory;
  contactPerson: string;
  phone: string;
  email: string;
  address: string;
  taxId: string;
  totalPurchases: number;
  outstandingBalance: number;
  status: VendorStatus;
}

export interface StudentFee {
  id: string;
  studentId: string;
  studentName: string;
  admissionNo: string;
  registrationNo: string;
  className: string;
  section: string;
  totalFee: number;
  paid: number;
  due: number;
  discount: number;
  status: FeeStatus;
  nextDueDate: string | null;
}

export interface FeeStructure {
  id: string;
  name: string;
  categoryId: string;
  category: string;
  classLevelId: string | null;
  className: string;      // "All Classes" when not class-specific
  academicYearId: string;
  amount: number;
  frequency: FeeFrequency;
}

export interface FeeCategoryRef { id: string; name: string; code: string }

export interface FeeDiscount {
  id: string;
  invoiceId: string;
  invoiceNo: string;
  studentName: string;
  amount: number;
  reason: string;
  status: "Pending" | "Approved" | "Rejected";
  requestedBy: string;
  decidedBy: string;
  createdAt: string;
}

export interface BillingActivity {
  id: string;
  action: string;
  by: string;
  at: string;
  amount?: number;
}

export interface MonthlyFinancePoint { month: string; revenue: number; expenses: number }
