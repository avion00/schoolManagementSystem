// ── Enums / option lists ────────────────────────────────────────────────────────
export type FeeStatus = "Paid" | "Partial" | "Due" | "Overdue" | "Waived";
export const FEE_STATUS_OPTIONS: FeeStatus[] = ["Paid", "Partial", "Due", "Overdue", "Waived"];

export type InvoiceStatus = "Draft" | "Issued" | "Paid" | "Partially Paid" | "Overdue" | "Cancelled";
export const INVOICE_STATUS_OPTIONS: InvoiceStatus[] = [
  "Draft", "Issued", "Paid", "Partially Paid", "Overdue", "Cancelled",
];

export type PaymentMethod = "Cash" | "Bank Transfer" | "Card" | "Online Wallet" | "Mobile Banking" | "Cheque";
export const PAYMENT_METHOD_OPTIONS: PaymentMethod[] = [
  "Cash", "Bank Transfer", "Card", "Online Wallet", "Mobile Banking", "Cheque",
];

export type PaymentStatus = "Completed" | "Pending" | "Failed" | "Refunded" | "Cancelled";
export const PAYMENT_STATUS_OPTIONS: PaymentStatus[] = ["Completed", "Pending", "Failed", "Refunded", "Cancelled"];

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

export type PayrollStatus = "Paid" | "Pending";
export const PAYROLL_STATUS_OPTIONS: PayrollStatus[] = ["Paid", "Pending"];

export type VendorCategory =
  | "Stationery Supplier" | "Book Supplier" | "Uniform Supplier" | "Food/Canteen"
  | "Transport" | "Maintenance" | "IT Services" | "Furniture";
export const VENDOR_CATEGORY_OPTIONS: VendorCategory[] = [
  "Stationery Supplier", "Book Supplier", "Uniform Supplier", "Food/Canteen",
  "Transport", "Maintenance", "IT Services", "Furniture",
];

export type VendorStatus = "Active" | "Inactive";
export const VENDOR_STATUS_OPTIONS: VendorStatus[] = ["Active", "Inactive"];

export type FeeCategory =
  | "Admission Fee" | "Monthly Tuition Fee" | "Exam Fee" | "Library Fee" | "Transport Fee"
  | "Hostel Fee" | "Lab Fee" | "Sports Fee" | "Development Fee" | "Miscellaneous Fee";
export const FEE_CATEGORY_OPTIONS: FeeCategory[] = [
  "Admission Fee", "Monthly Tuition Fee", "Exam Fee", "Library Fee", "Transport Fee",
  "Hostel Fee", "Lab Fee", "Sports Fee", "Development Fee", "Miscellaneous Fee",
];

export const CLASS_OPTIONS = [
  "Grade 1", "Grade 2", "Grade 3", "Grade 4", "Grade 5", "Grade 6",
  "Grade 7", "Grade 8", "Grade 9", "Grade 10",
];

export interface ReportTypeDef {
  id: string;
  label: string;
  description: string;
}
export const REPORT_TYPES: ReportTypeDef[] = [
  { id: "daily-collection",   label: "Daily Collection Report",   description: "Fees collected on a specific day, by method and class." },
  { id: "monthly-collection", label: "Monthly Collection Report", description: "Fees collected across a full month, by category." },
  { id: "outstanding-dues",   label: "Outstanding Dues Report",    description: "Students with unpaid or overdue balances." },
  { id: "expense",            label: "Expense Report",             description: "Outgoing expenses by category, vendor, and date." },
  { id: "payroll",            label: "Payroll Report",              description: "Staff salary payments for a selected month." },
  { id: "profit-loss",        label: "Profit/Loss Summary",         description: "Income vs. expenses for a selected period." },
  { id: "fee-statement",      label: "Student Fee Statement",       description: "Full fee and payment history for one student." },
  { id: "vendor-payment",     label: "Vendor Payment Report",       description: "Purchases and outstanding balances by vendor." },
  { id: "refund",             label: "Refund Report",               description: "All refunded payments in a selected period." },
];

// ── Interfaces ────────────────────────────────────────────────────────────────
export interface InvoiceItem {
  id: number;
  label: string;
  qty: number;
  unitPrice: number;
  amount: number;
}

export interface Invoice {
  id: number;
  invoiceNo: string;
  studentId: number;
  studentName: string;
  admissionNo: string;
  registrationNo: string;
  parentName: string;
  className: string;
  section: string;
  feeType: FeeCategory;
  issueDate: string;
  dueDate: string;
  amount: number;
  discount: number;
  paid: number;
  balance: number;
  status: InvoiceStatus;
  paymentMethod: PaymentMethod | null;
  items: InvoiceItem[];
}

export interface Payment {
  id: number;
  paymentId: string;
  invoiceNo: string;
  studentName: string;
  parentName: string;
  amount: number;
  method: PaymentMethod;
  transactionId: string;
  paymentDate: string;
  receivedBy: string;
  status: PaymentStatus;
}

export interface Expense {
  id: number;
  expenseId: string;
  category: ExpenseCategory;
  vendor: string;
  description: string;
  amount: number;
  paymentMethod: PaymentMethod;
  date: string;
  approvedBy: string;
  status: ExpenseStatus;
  attachmentName?: string;
  remarks?: string;
}

export interface Payroll {
  id: number;
  employeeId: string;
  staffName: string;
  role: string;
  department: string;
  month: string;
  basicSalary: number;
  allowance: number;
  deduction: number;
  netSalary: number;
  status: PayrollStatus;
  paymentDate: string | null;
  paymentMethod?: PaymentMethod;
  attendanceDeduction?: number;
  bonus?: number;
  taxDeduction?: number;
}

export interface Vendor {
  id: number;
  vendorId: string;
  vendorName: string;
  category: VendorCategory;
  contactPerson: string;
  phone: string;
  email: string;
  totalPurchases: number;
  outstandingBalance: number;
  status: VendorStatus;
}

export interface StudentFee {
  id: number;
  studentId: number;
  studentName: string;
  admissionNo: string;
  registrationNo: string;
  className: string;
  section: string;
  feePlan: string;
  totalFee: number;
  paid: number;
  due: number;
  discount: number;
  status: FeeStatus;
  nextDueDate: string | null;
}

export interface FeeStructure {
  id: number;
  category: FeeCategory;
  className: string;
  amount: number;
  frequency: "One-time" | "Monthly" | "Term" | "Annual";
}

export interface BillingActivity {
  id: number;
  action: string;
  by: string;
  at: string;
  amount?: number;
}

// ── Builders ─────────────────────────────────────────────────────────────────
const NOW = Date.now();
function daysAgoIso(days: number): string {
  const d = new Date(NOW - days * 24 * 3600_000);
  return d.toISOString().slice(0, 10);
}
function daysAheadIso(days: number): string {
  return daysAgoIso(-days);
}

// ── Fee structures ───────────────────────────────────────────────────────────
export const FEE_STRUCTURES: FeeStructure[] = [
  { id: 1, category: "Admission Fee",       className: "All Classes", amount: 5000,  frequency: "One-time" },
  { id: 2, category: "Monthly Tuition Fee", className: "Grade 1–5",   amount: 8000,  frequency: "Monthly" },
  { id: 3, category: "Monthly Tuition Fee", className: "Grade 6–10",  amount: 10000, frequency: "Monthly" },
  { id: 4, category: "Exam Fee",            className: "All Classes", amount: 1500,  frequency: "Term" },
  { id: 5, category: "Library Fee",         className: "All Classes", amount: 500,   frequency: "Annual" },
  { id: 6, category: "Transport Fee",       className: "All Classes", amount: 2500,  frequency: "Monthly" },
  { id: 7, category: "Hostel Fee",          className: "All Classes", amount: 9000,  frequency: "Monthly" },
  { id: 8, category: "Lab Fee",             className: "Grade 6–10",  amount: 800,   frequency: "Term" },
  { id: 9, category: "Sports Fee",          className: "All Classes", amount: 600,   frequency: "Annual" },
  { id: 10, category: "Development Fee",    className: "All Classes", amount: 1200,  frequency: "Annual" },
];

// ── Student fee roster ───────────────────────────────────────────────────────
interface StudentSeed {
  name: string; admissionNo: string; className: string; section: string;
  feePlan: string; totalFee: number; paid: number; discount: number; status: FeeStatus; dueInDays: number | null;
}

const STUDENT_SEEDS: StudentSeed[] = [
  { name: "Aarav Khan",       admissionNo: "ADM-2033", className: "Grade 8",  section: "A", feePlan: "Standard Tuition", totalFee: 120000, paid: 120000, discount: 0,    status: "Paid",     dueInDays: null },
  { name: "Priya Thapa",      admissionNo: "ADM-2041", className: "Grade 6",  section: "B", feePlan: "Standard Tuition", totalFee: 96000,  paid: 60000,  discount: 0,    status: "Partial",  dueInDays: 7 },
  { name: "Bishal Rai",       admissionNo: "ADM-2019", className: "Grade 10", section: "C", feePlan: "Standard Tuition", totalFee: 120000, paid: 40000,  discount: 0,    status: "Overdue",  dueInDays: -5 },
  { name: "Sneha Gurung",     admissionNo: "ADM-2052", className: "Grade 9",  section: "A", feePlan: "Standard Tuition", totalFee: 120000, paid: 0,      discount: 0,    status: "Due",      dueInDays: 12 },
  { name: "Karan Malla",      admissionNo: "ADM-2027", className: "Grade 7",  section: "B", feePlan: "Standard Tuition", totalFee: 96000,  paid: 96000,  discount: 12000, status: "Paid",     dueInDays: null },
  { name: "Anjali Karki",     admissionNo: "ADM-2058", className: "Grade 5",  section: "A", feePlan: "Standard Tuition", totalFee: 96000,  paid: 48000,  discount: 0,    status: "Partial",  dueInDays: 10 },
  { name: "Rohan Basnet",     admissionNo: "ADM-2064", className: "Grade 4",  section: "A", feePlan: "Standard Tuition", totalFee: 96000,  paid: 96000,  discount: 0,    status: "Paid",     dueInDays: null },
  { name: "Sabina Lama",      admissionNo: "ADM-2071", className: "Grade 3",  section: "B", feePlan: "Standard Tuition", totalFee: 96000,  paid: 20000,  discount: 0,    status: "Overdue",  dueInDays: -12 },
  { name: "Nabin Tamang",     admissionNo: "ADM-2085", className: "Grade 2",  section: "A", feePlan: "Standard Tuition", totalFee: 96000,  paid: 0,      discount: 96000, status: "Waived",  dueInDays: null },
  { name: "Ishita Sharma",    admissionNo: "ADM-2093", className: "Grade 1",  section: "A", feePlan: "Standard Tuition", totalFee: 96000,  paid: 96000,  discount: 0,    status: "Paid",     dueInDays: null },
  { name: "Dipesh Adhikari",  admissionNo: "ADM-2101", className: "Grade 8",  section: "B", feePlan: "Standard Tuition", totalFee: 120000, paid: 90000,  discount: 0,    status: "Partial",  dueInDays: 5 },
  { name: "Manisha Poudel",   admissionNo: "ADM-2114", className: "Grade 9",  section: "B", feePlan: "Standard Tuition", totalFee: 120000, paid: 0,      discount: 0,    status: "Due",      dueInDays: 18 },
  { name: "Suresh Bhattarai", admissionNo: "ADM-2126", className: "Grade 10", section: "A", feePlan: "Standard Tuition", totalFee: 120000, paid: 60000,  discount: 0,    status: "Overdue",  dueInDays: -3 },
  { name: "Ritika Shrestha",  admissionNo: "ADM-2133", className: "Grade 6",  section: "A", feePlan: "Standard Tuition", totalFee: 96000,  paid: 96000,  discount: 6000,  status: "Paid",     dueInDays: null },
  { name: "Yashoda Rana",     admissionNo: "ADM-2140", className: "Grade 7",  section: "A", feePlan: "Standard Tuition", totalFee: 96000,  paid: 30000,  discount: 0,    status: "Partial",  dueInDays: 9 },
  { name: "Kabir Thapa",      admissionNo: "ADM-2148", className: "Grade 5",  section: "B", feePlan: "Standard Tuition", totalFee: 96000,  paid: 96000,  discount: 0,    status: "Paid",     dueInDays: null },
  { name: "Sonam Gurung",     admissionNo: "ADM-2155", className: "Grade 4",  section: "B", feePlan: "Standard Tuition", totalFee: 96000,  paid: 0,      discount: 0,    status: "Due",      dueInDays: 20 },
  { name: "Prabin Rai",       admissionNo: "ADM-2162", className: "Grade 3",  section: "A", feePlan: "Standard Tuition", totalFee: 96000,  paid: 40000,  discount: 0,    status: "Overdue",  dueInDays: -8 },
  { name: "Alisha Magar",     admissionNo: "ADM-2170", className: "Grade 2",  section: "B", feePlan: "Standard Tuition", totalFee: 96000,  paid: 96000,  discount: 0,    status: "Paid",     dueInDays: null },
  { name: "Bikash Khadka",    admissionNo: "ADM-2178", className: "Grade 1",  section: "B", feePlan: "Standard Tuition", totalFee: 96000,  paid: 50000,  discount: 0,    status: "Partial",  dueInDays: 6 },
  { name: "Nisha Bogati",     admissionNo: "ADM-2185", className: "Grade 8",  section: "A", feePlan: "Standard Tuition", totalFee: 120000, paid: 0,      discount: 0,    status: "Due",      dueInDays: 15 },
  { name: "Rajan Shahi",      admissionNo: "ADM-2192", className: "Grade 9",  section: "A", feePlan: "Standard Tuition", totalFee: 120000, paid: 50000,  discount: 0,    status: "Overdue",  dueInDays: -1 },
  { name: "Puja Baniya",      admissionNo: "ADM-2199", className: "Grade 10", section: "B", feePlan: "Standard Tuition", totalFee: 120000, paid: 120000, discount: 12000, status: "Paid",     dueInDays: null },
  { name: "Amit Chaudhary",   admissionNo: "ADM-2206", className: "Grade 6",  section: "B", feePlan: "Standard Tuition", totalFee: 96000,  paid: 36000,  discount: 0,    status: "Partial",  dueInDays: 14 },
  { name: "Sarita Oli",       admissionNo: "ADM-2213", className: "Grade 7",  section: "B", feePlan: "Standard Tuition", totalFee: 96000,  paid: 0,      discount: 0,    status: "Due",      dueInDays: 22 },
];

export const STUDENT_FEES: StudentFee[] = STUDENT_SEEDS.map((s, i) => ({
  id: i + 1,
  studentId: i + 1,
  studentName: s.name,
  admissionNo: s.admissionNo,
  registrationNo: `REG-2026-${String(i + 1).padStart(4, "0")}`,
  className: s.className,
  section: s.section,
  feePlan: s.feePlan,
  totalFee: s.totalFee,
  paid: s.paid,
  due: Math.max(0, s.totalFee - s.discount - s.paid),
  discount: s.discount,
  status: s.status,
  nextDueDate: s.dueInDays === null ? null : (s.dueInDays >= 0 ? daysAheadIso(s.dueInDays) : daysAgoIso(-s.dueInDays)),
}));

// ── Invoices ─────────────────────────────────────────────────────────────────
interface InvoiceSeed {
  student: StudentSeed & { id: number };
  feeType: FeeCategory;
  amount: number;
  discount: number;
  paid: number;
  status: InvoiceStatus;
  issueDaysAgo: number;
  dueInDays: number;
  paymentMethod: PaymentMethod | null;
}

const studentsById = STUDENT_SEEDS.map((s, i) => ({ ...s, id: i + 1 }));

function pick<T>(arr: T[], i: number): T { return arr[i % arr.length]; }

const INVOICE_SEEDS: InvoiceSeed[] = studentsById.slice(0, 30).map((student, i) => {
  const feeType = pick(FEE_CATEGORY_OPTIONS, i);
  const amount = 8000 + (i % 6) * 1500;
  const patterns: { status: InvoiceStatus; paidRatio: number; discount: number; method: PaymentMethod | null; issueDaysAgo: number; dueInDays: number }[] = [
    { status: "Paid",            paidRatio: 1,    discount: 0,    method: "Cash",           issueDaysAgo: 20, dueInDays: -6  },
    { status: "Partially Paid",  paidRatio: 0.5,  discount: 0,    method: "Bank Transfer",  issueDaysAgo: 10, dueInDays: 4   },
    { status: "Overdue",         paidRatio: 0.2,  discount: 0,    method: null,             issueDaysAgo: 25, dueInDays: -8  },
    { status: "Issued",          paidRatio: 0,    discount: 0,    method: null,             issueDaysAgo: 3,  dueInDays: 11  },
    { status: "Draft",           paidRatio: 0,    discount: 0,    method: null,             issueDaysAgo: 0,  dueInDays: 15  },
    { status: "Cancelled",       paidRatio: 0,    discount: 0,    method: null,             issueDaysAgo: 30, dueInDays: -15 },
    { status: "Paid",            paidRatio: 1,    discount: 1000, method: "Card",           issueDaysAgo: 18, dueInDays: -4  },
  ];
  const p = pick(patterns, i);
  return {
    student,
    feeType,
    amount,
    discount: p.discount,
    paid: Math.round((amount - p.discount) * p.paidRatio),
    status: p.status,
    issueDaysAgo: p.issueDaysAgo,
    dueInDays: p.dueInDays,
    paymentMethod: p.method,
  };
});

export const INVOICES: Invoice[] = INVOICE_SEEDS.map((seed, i) => {
  const balance = Math.max(0, seed.amount - seed.discount - seed.paid);
  return {
    id: i + 1,
    invoiceNo: `INV-2026-${String(i + 1).padStart(4, "0")}`,
    studentId: seed.student.id,
    studentName: seed.student.name,
    admissionNo: seed.student.admissionNo,
    registrationNo: `REG-2026-${String(seed.student.id).padStart(4, "0")}`,
    parentName: `Parent of ${seed.student.name.split(" ")[0]}`,
    className: seed.student.className,
    section: seed.student.section,
    feeType: seed.feeType,
    issueDate: daysAgoIso(seed.issueDaysAgo),
    dueDate: seed.dueInDays >= 0 ? daysAheadIso(seed.dueInDays) : daysAgoIso(-seed.dueInDays),
    amount: seed.amount,
    discount: seed.discount,
    paid: seed.paid,
    balance,
    status: seed.status,
    paymentMethod: seed.paymentMethod,
    items: [
      { id: 1, label: seed.feeType, qty: 1, unitPrice: seed.amount, amount: seed.amount },
    ],
  };
});

// ── Payments ─────────────────────────────────────────────────────────────────
const RECEIVERS = ["Ramesh Shrestha", "Front Office", "Super Admin", "Accounts Team"];

export const PAYMENTS: Payment[] = INVOICES.filter((inv) => inv.paid > 0).map((inv, i) => ({
  id: i + 1,
  paymentId: `PAY-2026-${String(i + 1).padStart(4, "0")}`,
  invoiceNo: inv.invoiceNo,
  studentName: inv.studentName,
  parentName: inv.parentName,
  amount: inv.paid,
  method: inv.paymentMethod ?? pick(PAYMENT_METHOD_OPTIONS, i),
  transactionId: inv.paymentMethod && inv.paymentMethod !== "Cash" ? `TXN${100000 + i * 7}` : "—",
  paymentDate: inv.issueDate,
  receivedBy: pick(RECEIVERS, i),
  status: i % 11 === 0 ? "Pending" : i % 17 === 0 ? "Refunded" : i % 13 === 0 ? "Failed" : "Completed",
}));

// ── Expenses ─────────────────────────────────────────────────────────────────
interface ExpenseSeed {
  category: ExpenseCategory; vendor: string; description: string; amount: number;
  method: PaymentMethod; daysAgo: number; status: ExpenseStatus;
}
const EXPENSE_SEEDS: ExpenseSeed[] = [
  { category: "Stationery",      vendor: "ABC Stationery Supplier", description: "Exam paper and office supplies",       amount: 12500, method: "Bank Transfer", daysAgo: 3,  status: "Paid" },
  { category: "Teacher Salary",  vendor: "Payroll",                 description: "July teacher salary disbursement",     amount: 45000, method: "Bank Transfer", daysAgo: 1,  status: "Approved" },
  { category: "Electricity",     vendor: "Nepal Electricity Authority", description: "Monthly electricity bill",          amount: 18400, method: "Bank Transfer", daysAgo: 5,  status: "Paid" },
  { category: "Internet",        vendor: "WorldLink ISP",            description: "School broadband subscription",       amount: 6200,  method: "Card",          daysAgo: 6,  status: "Paid" },
  { category: "Maintenance",     vendor: "City Facility Services",    description: "Classroom fan repairs",               amount: 8800,  method: "Cash",          daysAgo: 8,  status: "Approved" },
  { category: "Transport Fuel",  vendor: "Nepal Oil Corporation",     description: "Diesel for school bus fleet",         amount: 24500, method: "Cash",          daysAgo: 4,  status: "Paid" },
  { category: "Books",           vendor: "National Book Depot",       description: "Library reference book restock",     amount: 15600, method: "Bank Transfer", daysAgo: 10, status: "Pending" },
  { category: "Furniture",       vendor: "Himal Furniture House",     description: "Replacement desks for Grade 5",       amount: 42000, method: "Cheque",        daysAgo: 15, status: "Approved" },
  { category: "Rent",            vendor: "Property Owner — Bhandari", description: "Monthly hostel building rent",        amount: 65000, method: "Bank Transfer", daysAgo: 2,  status: "Paid" },
  { category: "Lab Materials",   vendor: "SciTech Lab Supplies",      description: "Chemistry lab reagents",              amount: 9200,  method: "Card",          daysAgo: 12, status: "Pending" },
  { category: "Events",          vendor: "Annual Day Committee",      description: "Annual day stage and decoration",     amount: 28000, method: "Cash",          daysAgo: 20, status: "Rejected" },
  { category: "Staff Salary",    vendor: "Payroll",                   description: "July non-teaching staff salary",      amount: 28000, method: "Bank Transfer", daysAgo: 1,  status: "Approved" },
  { category: "Hostel",          vendor: "Hostel Mess Contractor",    description: "Monthly hostel food supply",          amount: 52000, method: "Bank Transfer", daysAgo: 7,  status: "Paid" },
  { category: "Library",         vendor: "National Book Depot",       description: "Library management software renewal", amount: 7500,  method: "Card",          daysAgo: 18, status: "Paid" },
  { category: "Miscellaneous",   vendor: "Petty Cash",                description: "Office miscellaneous supplies",       amount: 3200,  method: "Cash",          daysAgo: 9,  status: "Approved" },
  { category: "Maintenance",     vendor: "City Facility Services",    description: "Water tank cleaning service",         amount: 6400,  method: "Cash",          daysAgo: 22, status: "Paid" },
  { category: "Stationery",      vendor: "ABC Stationery Supplier",   description: "Printer ink and toner cartridges",    amount: 5400,  method: "Card",          daysAgo: 11, status: "Pending" },
  { category: "Transport Fuel",  vendor: "Nepal Oil Corporation",     description: "Diesel refill — mid-month",           amount: 21000, method: "Cash",          daysAgo: 14, status: "Paid" },
  { category: "Events",          vendor: "Sports Meet Organizers",    description: "Annual sports meet equipment rental", amount: 16800, method: "Bank Transfer", daysAgo: 26, status: "Approved" },
  { category: "Internet",        vendor: "WorldLink ISP",             description: "Additional bandwidth upgrade",        amount: 2100,  method: "Card",          daysAgo: 30, status: "Paid" },
];

export const EXPENSES: Expense[] = EXPENSE_SEEDS.map((s, i) => ({
  id: i + 1,
  expenseId: `EXP-2026-${String(i + 1).padStart(4, "0")}`,
  category: s.category,
  vendor: s.vendor,
  description: s.description,
  amount: s.amount,
  paymentMethod: s.method,
  date: daysAgoIso(s.daysAgo),
  approvedBy: s.status === "Pending" ? "—" : "Platform Admin",
  status: s.status,
}));

// ── Payroll ──────────────────────────────────────────────────────────────────
interface PayrollSeed {
  name: string; role: string; department: string; basic: number; allowance: number;
  deduction: number; status: PayrollStatus; paidDaysAgo: number | null; method?: PaymentMethod;
}
const PAYROLL_SEEDS: PayrollSeed[] = [
  { name: "Andrew Martin",    role: "Teacher",     department: "Academics",     basic: 45000, allowance: 5000, deduction: 2000, status: "Pending", paidDaysAgo: null },
  { name: "Laxmi Adhikari",   role: "Teacher",     department: "Academics",     basic: 42000, allowance: 4000, deduction: 1500, status: "Paid",    paidDaysAgo: 2, method: "Bank Transfer" },
  { name: "Deepak Shrestha",  role: "Teacher",     department: "Academics",     basic: 42000, allowance: 4000, deduction: 1800, status: "Paid",    paidDaysAgo: 2, method: "Bank Transfer" },
  { name: "Nisha Poudel",     role: "Teacher",     department: "Academics",     basic: 40000, allowance: 3500, deduction: 1200, status: "Pending", paidDaysAgo: null },
  { name: "Ramesh Shrestha",  role: "Accountant",  department: "Accounts",      basic: 38000, allowance: 3000, deduction: 1000, status: "Paid",    paidDaysAgo: 2, method: "Bank Transfer" },
  { name: "Sita Lama",        role: "Librarian",   department: "Library",       basic: 30000, allowance: 2000, deduction: 800,  status: "Paid",    paidDaysAgo: 2, method: "Bank Transfer" },
  { name: "Transport Manager",role: "Transport Staff", department: "Transport", basic: 32000, allowance: 2500, deduction: 900,  status: "Pending", paidDaysAgo: null },
  { name: "Hostel Warden",    role: "Hostel Staff", department: "Hostel",       basic: 28000, allowance: 2000, deduction: 700,  status: "Paid",    paidDaysAgo: 3, method: "Cash" },
  { name: "Office Assistant", role: "Staff",       department: "Administration", basic: 25000, allowance: 1500, deduction: 500, status: "Pending", paidDaysAgo: null },
  { name: "Principal Office", role: "Principal",   department: "Administration", basic: 65000, allowance: 8000, deduction: 3000, status: "Paid",   paidDaysAgo: 2, method: "Bank Transfer" },
  { name: "Hari Bahadur",     role: "Transport Staff", department: "Transport", basic: 26000, allowance: 1800, deduction: 600,  status: "Paid",    paidDaysAgo: 3, method: "Cash" },
  { name: "Meena Vaidya",     role: "Teacher",     department: "Academics",     basic: 41000, allowance: 3800, deduction: 1300, status: "Pending", paidDaysAgo: null },
  { name: "Kabir Joshi",      role: "Teacher",     department: "Academics",     basic: 43000, allowance: 4200, deduction: 1600, status: "Paid",    paidDaysAgo: 2, method: "Bank Transfer" },
  { name: "Sunil Basnet",     role: "IT Admin",    department: "IT",            basic: 36000, allowance: 3000, deduction: 1100, status: "Pending", paidDaysAgo: null },
  { name: "Radha Devkota",    role: "Exam Controller", department: "Examination", basic: 39000, allowance: 3200, deduction: 1400, status: "Paid",  paidDaysAgo: 2, method: "Bank Transfer" },
];

export const PAYROLL: Payroll[] = PAYROLL_SEEDS.map((s, i) => ({
  id: i + 1,
  employeeId: `EMP-2026-${String(i + 1).padStart(4, "0")}`,
  staffName: s.name,
  role: s.role,
  department: s.department,
  month: "July 2026",
  basicSalary: s.basic,
  allowance: s.allowance,
  deduction: s.deduction,
  netSalary: s.basic + s.allowance - s.deduction,
  status: s.status,
  paymentDate: s.paidDaysAgo === null ? null : daysAgoIso(s.paidDaysAgo),
  paymentMethod: s.method,
  attendanceDeduction: Math.round(s.deduction * 0.6),
  bonus: i % 5 === 0 ? 2000 : 0,
  taxDeduction: Math.round(s.deduction * 0.4),
}));

// ── Vendors ──────────────────────────────────────────────────────────────────
interface VendorSeed {
  name: string; category: VendorCategory; contact: string; phone: string; email: string;
  totalPurchases: number; outstanding: number; status: VendorStatus;
}
const VENDOR_SEEDS: VendorSeed[] = [
  { name: "ABC Stationery Supplier",  category: "Stationery Supplier", contact: "Bikash Shah",    phone: "+977 9801000001", email: "abc.stationery@example.com",  totalPurchases: 145000, outstanding: 5400,  status: "Active" },
  { name: "National Book Depot",      category: "Book Supplier",       contact: "Ganga Rijal",    phone: "+977 9801000002", email: "national.books@example.com",  totalPurchases: 235000, outstanding: 0,     status: "Active" },
  { name: "Himal Uniform House",      category: "Uniform Supplier",    contact: "Deepa Rana",     phone: "+977 9801000003", email: "himal.uniform@example.com",   totalPurchases: 98000,  outstanding: 12000, status: "Active" },
  { name: "Hostel Mess Contractor",   category: "Food/Canteen",        contact: "Kamala Devi",    phone: "+977 9801000004", email: "mess.contractor@example.com", totalPurchases: 620000, outstanding: 0,     status: "Active" },
  { name: "Valley Transport Co.",     category: "Transport",           contact: "Rabin Lama",     phone: "+977 9801000005", email: "valley.transport@example.com", totalPurchases: 310000, outstanding: 21000, status: "Active" },
  { name: "City Facility Services",   category: "Maintenance",         contact: "Sujan Karki",    phone: "+977 9801000006", email: "city.facility@example.com",   totalPurchases: 87000,  outstanding: 6400,  status: "Active" },
  { name: "WorldLink ISP",            category: "IT Services",         contact: "Nabina Shakya",  phone: "+977 9801000007", email: "worldlink@example.com",       totalPurchases: 52000,  outstanding: 0,     status: "Active" },
  { name: "Himal Furniture House",    category: "Furniture",           contact: "Bishnu Thapa",   phone: "+977 9801000008", email: "himal.furniture@example.com", totalPurchases: 168000, outstanding: 42000, status: "Active" },
  { name: "SciTech Lab Supplies",     category: "Stationery Supplier", contact: "Aditi Regmi",    phone: "+977 9801000009", email: "scitech.lab@example.com",     totalPurchases: 41000,  outstanding: 9200,  status: "Inactive" },
  { name: "Nepal Oil Corporation",    category: "Transport",           contact: "NOC Depot",      phone: "+977 9801000010", email: "noc.fuel@example.com",        totalPurchases: 198000, outstanding: 0,     status: "Active" },
];

export const VENDORS: Vendor[] = VENDOR_SEEDS.map((s, i) => ({
  id: i + 1,
  vendorId: `VEN-2026-${String(i + 1).padStart(4, "0")}`,
  vendorName: s.name,
  category: s.category,
  contactPerson: s.contact,
  phone: s.phone,
  email: s.email,
  totalPurchases: s.totalPurchases,
  outstandingBalance: s.outstanding,
  status: s.status,
}));

// ── Billing activity log ────────────────────────────────────────────────────
export const BILLING_ACTIVITIES: BillingActivity[] = [
  { id: 1,  action: "Invoice INV-2026-0001 issued",       by: "Ramesh Shrestha", at: daysAgoIso(20) + "T09:00:00", amount: 8000 },
  { id: 2,  action: "Payment received for INV-2026-0001", by: "Front Office",    at: daysAgoIso(19) + "T14:20:00", amount: 8000 },
  { id: 3,  action: "Expense EXP-2026-0002 approved",      by: "Super Admin",     at: daysAgoIso(1) + "T11:05:00",  amount: 45000 },
  { id: 4,  action: "Payroll for July 2026 processed",     by: "Super Admin",     at: daysAgoIso(2) + "T16:00:00" },
  { id: 5,  action: "Invoice INV-2026-0004 marked overdue", by: "System",          at: daysAgoIso(3) + "T00:00:00" },
  { id: 6,  action: "Refund issued for PAY-2026-0009",     by: "Ramesh Shrestha", at: daysAgoIso(6) + "T10:15:00" },
  { id: 7,  action: "New vendor Valley Transport Co. added", by: "Super Admin",   at: daysAgoIso(30) + "T08:40:00" },
  { id: 8,  action: "Discount applied to Karan Malla's invoice", by: "Super Admin", at: daysAgoIso(14) + "T13:30:00", amount: 12000 },
  { id: 9,  action: "Expense EXP-2026-0011 rejected",       by: "Super Admin",     at: daysAgoIso(20) + "T09:50:00" },
  { id: 10, action: "Fee statement printed for Bishal Rai", by: "Front Office",    at: daysAgoIso(4) + "T12:00:00" },
];

// ── Static reference (backend-ready snapshot) ───────────────────────────────
function sum<T>(arr: T[], get: (t: T) => number): number { return arr.reduce((s, t) => s + get(t), 0); }

export interface MonthlyFinancePoint { month: string; revenue: number; expenses: number; }
export const MONTHLY_FINANCE_TREND: MonthlyFinancePoint[] = [
  { month: "Feb", revenue: 98000,  expenses: 61000 },
  { month: "Mar", revenue: 105000, expenses: 68000 },
  { month: "Apr", revenue: 112000, expenses: 72000 },
  { month: "May", revenue: 109000, expenses: 75000 },
  { month: "Jun", revenue: 118000, expenses: 80000 },
  { month: "Jul", revenue: 125000, expenses: 84000 },
];

export const billingSummary = {
  // Revenue/collections are drawn from the full student fee roster (STUDENT_FEES), which
  // reflects the whole student body's billed & paid amounts — the Invoices/Payments lists
  // are a smaller transactional sample used to demonstrate those features individually.
  totalRevenue: sum(STUDENT_FEES, (f) => f.totalFee - f.discount),
  feesCollected: sum(STUDENT_FEES, (f) => f.paid),
  outstandingDues: sum(STUDENT_FEES, (f) => f.due),
  expensesThisMonth: sum(EXPENSES.filter((e) => e.status === "Paid" || e.status === "Approved"), (e) => e.amount),
  payrollDue: sum(PAYROLL.filter((p) => p.status === "Pending"), (p) => p.netSalary),
  pendingInvoices: INVOICES.filter((i) => i.status === "Issued" || i.status === "Draft").length,
  overduePayments: INVOICES.filter((i) => i.status === "Overdue").length,
};
