/* ─── Types ────────────────────────────────────────────────────────────── */

export type AcademicYearStatus = "Active" | "Upcoming" | "Archived";
export type UserStatus         = "Active" | "Inactive" | "Suspended";
export type BackupStatus       = "Success" | "Running" | "Failed" | "Pending";

/* ─── School Profile ─────────────────────────────────────────────────── */

export interface SchoolProfile {
  name:               string;
  code:               string;
  logo:               string;
  principalName:      string;
  email:              string;
  phone:              string;
  website:            string;
  address:            string;
  city:               string;
  state:              string;
  country:            string;
  postalCode:         string;
  registrationNumber: string;
  taxNumber:          string;
  tagline:            string;
  establishedYear:    number;
}

export const SCHOOL_PROFILE: SchoolProfile = {
  name:               "SchoolOS International Academy",
  code:               "SOIA-2026",
  logo:               "",
  principalName:      "Dr. Rajesh Kumar Sharma",
  email:              "admin@schoolos.np",
  phone:              "+977-1-4567890",
  website:            "https://www.schoolos.np",
  address:            "Kamaladi Road, Kathmandu",
  city:               "Kathmandu",
  state:              "Bagmati Province",
  country:            "Nepal",
  postalCode:         "44600",
  registrationNumber: "EDU-2005-KTM-0042",
  taxNumber:          "500-12-34567",
  tagline:            "Empowering Minds, Building Futures",
  establishedYear:    2005,
};

/* ─── Academic Years ─────────────────────────────────────────────────── */

export interface AcademicYear {
  id:              number;
  year:            string;
  startDate:       string;
  endDate:         string;
  status:          AcademicYearStatus;
  admissionOpen:   boolean;
  resultPublished: boolean;
  attendanceLock:  string;
}

export const ACADEMIC_YEARS: AcademicYear[] = [
  { id: 1, year: "2026–2027", startDate: "2026-04-01", endDate: "2027-03-31", status: "Active",   admissionOpen: true,  resultPublished: false, attendanceLock: "2027-03-25" },
  { id: 2, year: "2025–2026", startDate: "2025-04-01", endDate: "2026-03-31", status: "Archived", admissionOpen: false, resultPublished: true,  attendanceLock: "2026-03-25" },
  { id: 3, year: "2024–2025", startDate: "2024-04-01", endDate: "2025-03-31", status: "Archived", admissionOpen: false, resultPublished: true,  attendanceLock: "2025-03-25" },
  { id: 4, year: "2027–2028", startDate: "2027-04-01", endDate: "2028-03-31", status: "Upcoming", admissionOpen: false, resultPublished: false, attendanceLock: "2028-03-25" },
];

/* ─── Admin Users ────────────────────────────────────────────────────── */

export interface AdminUser {
  id:        number;
  name:      string;
  email:     string;
  role:      string;
  status:    UserStatus;
  lastLogin: string;
  avatar?:   string;
}

export const ADMIN_USERS: AdminUser[] = [
  { id: 1, name: "Platform Admin",       email: "admin@schoolos.np",       role: "Super Admin",   status: "Active",    lastLogin: "2026-07-06 09:15 AM" },
  { id: 2, name: "Dr. Rajesh Sharma",    email: "principal@schoolos.np",   role: "Principal",     status: "Active",    lastLogin: "2026-07-06 08:30 AM" },
  { id: 3, name: "Sunita Gurung",        email: "accounts@schoolos.np",    role: "Accountant",    status: "Active",    lastLogin: "2026-07-05 03:45 PM" },
  { id: 4, name: "Kazi Fahim",           email: "kffahim@schoolos.np",     role: "Teacher",       status: "Active",    lastLogin: "2026-07-06 07:55 AM" },
  { id: 5, name: "Mira Shrestha",        email: "mshrestha@schoolos.np",   role: "Receptionist",  status: "Active",    lastLogin: "2026-07-04 12:00 PM" },
  { id: 6, name: "Binod Karki",          email: "bkarki@schoolos.np",      role: "Teacher",       status: "Inactive",  lastLogin: "2026-06-28 10:20 AM" },
  { id: 7, name: "Kavita Joshi",         email: "kjoshi@schoolos.np",      role: "HR Manager",    status: "Active",    lastLogin: "2026-07-06 09:00 AM" },
  { id: 8, name: "Ramesh Adhikari",      email: "radhikari@schoolos.np",   role: "Teacher",       status: "Suspended", lastLogin: "2026-06-15 09:30 AM" },
];

/* ─── Roles & Permissions ────────────────────────────────────────────── */

export interface Role {
  id:             number;
  name:           string;
  description:    string;
  userCount:      number;
  permissionCount:number;
  color:          string;
  isSystem:       boolean;
}

export const ROLES: Role[] = [
  { id: 1, name: "Super Admin",   description: "Full system access, all settings", userCount: 1,  permissionCount: 78, color: "rose",    isSystem: true  },
  { id: 2, name: "Principal",     description: "School management, reports, staff", userCount: 1,  permissionCount: 62, color: "violet",  isSystem: true  },
  { id: 3, name: "Teacher",       description: "Classes, attendance, marks entry",  userCount: 28, permissionCount: 34, color: "blue",    isSystem: true  },
  { id: 4, name: "Accountant",    description: "Fees, payments, invoices, reports", userCount: 3,  permissionCount: 28, color: "emerald", isSystem: true  },
  { id: 5, name: "Receptionist",  description: "Admissions, queries, notices",      userCount: 4,  permissionCount: 18, color: "amber",   isSystem: false },
  { id: 6, name: "HR Manager",    description: "Staff records, payroll, leaves",    userCount: 2,  permissionCount: 22, color: "cyan",    isSystem: false },
  { id: 7, name: "Parent",        description: "Student info, fees, results view",  userCount: 580,permissionCount: 8,  color: "slate",   isSystem: true  },
  { id: 8, name: "Student",       description: "Own profile, attendance, results",  userCount: 780,permissionCount: 6,  color: "neutral", isSystem: true  },
];

export type PermModule = "Dashboard"|"Students"|"Teachers"|"Parents"|"Classes"|"Subjects"|"Attendance"|"Exams"|"Fees"|"Notices"|"Messages"|"Reports"|"Settings";
export type PermAction = "view"|"create"|"edit"|"delete"|"export"|"approve";

export const PERM_MODULES: PermModule[] = ["Dashboard","Students","Teachers","Parents","Classes","Subjects","Attendance","Exams","Fees","Notices","Messages","Reports","Settings"];
export const PERM_ACTIONS: PermAction[] = ["view","create","edit","delete","export","approve"];

export type PermMatrix = Record<PermModule, Record<PermAction, boolean>>;

export const SUPER_ADMIN_PERMS: PermMatrix = Object.fromEntries(
  PERM_MODULES.map((m) => [m, Object.fromEntries(PERM_ACTIONS.map((a) => [a, true]))])
) as PermMatrix;

export const TEACHER_PERMS: PermMatrix = {
  Dashboard:  { view:true,  create:false, edit:false,  delete:false, export:false, approve:false },
  Students:   { view:true,  create:false, edit:false,  delete:false, export:false, approve:false },
  Teachers:   { view:true,  create:false, edit:false,  delete:false, export:false, approve:false },
  Parents:    { view:true,  create:false, edit:false,  delete:false, export:false, approve:false },
  Classes:    { view:true,  create:false, edit:false,  delete:false, export:false, approve:false },
  Subjects:   { view:true,  create:false, edit:false,  delete:false, export:false, approve:false },
  Attendance: { view:true,  create:true,  edit:true,   delete:false, export:true,  approve:false },
  Exams:      { view:true,  create:false, edit:true,   delete:false, export:false, approve:false },
  Fees:       { view:false, create:false, edit:false,  delete:false, export:false, approve:false },
  Notices:    { view:true,  create:false, edit:false,  delete:false, export:false, approve:false },
  Messages:   { view:true,  create:true,  edit:false,  delete:false, export:false, approve:false },
  Reports:    { view:true,  create:false, edit:false,  delete:false, export:true,  approve:false },
  Settings:   { view:false, create:false, edit:false,  delete:false, export:false, approve:false },
};

/* ─── Notification Settings ──────────────────────────────────────────── */

export interface NotificationSettings {
  channels: { inApp:boolean; email:boolean; sms:boolean; push:boolean };
  events: {
    admissionCreated:    boolean;
    attendanceAlert:     boolean;
    feeDueReminder:      boolean;
    examScheduled:       boolean;
    resultPublished:     boolean;
    noticePublished:     boolean;
    messageReceived:     boolean;
    paymentReceived:     boolean;
    lowAttendanceAlert:  boolean;
    leaveApproved:       boolean;
  };
  audiences: { parents:boolean; teachers:boolean; students:boolean; staff:boolean };
  emailFooter: string;
  smsFrom:     string;
}

export const NOTIFICATION_SETTINGS: NotificationSettings = {
  channels:   { inApp:true, email:true, sms:false, push:false },
  events: {
    admissionCreated:   true,
    attendanceAlert:    true,
    feeDueReminder:     true,
    examScheduled:      true,
    resultPublished:    true,
    noticePublished:    true,
    messageReceived:    true,
    paymentReceived:    true,
    lowAttendanceAlert: true,
    leaveApproved:      false,
  },
  audiences:  { parents:true, teachers:true, students:true, staff:false },
  emailFooter: "SchoolOS International Academy | Kathmandu, Nepal",
  smsFrom:     "SCHOOLOS",
};

/* ─── Fee Settings ───────────────────────────────────────────────────── */

export interface FeeCategory {
  id:       number;
  name:     string;
  amount:   number;
  isActive: boolean;
}

export interface FeeSettings {
  currency:          string;
  currencySymbol:    string;
  lateFeeEnabled:    boolean;
  lateFeeAmount:     number;
  lateFeeType:       "Fixed" | "Percentage";
  gracePeriodDays:   number;
  invoicePrefix:     string;
  receiptPrefix:     string;
  paymentMethods:    { cash:boolean; bankTransfer:boolean; card:boolean; online:boolean };
  categories:        FeeCategory[];
}

export const FEE_SETTINGS: FeeSettings = {
  currency:        "NPR",
  currencySymbol:  "Rs.",
  lateFeeEnabled:  true,
  lateFeeAmount:   100,
  lateFeeType:     "Fixed",
  gracePeriodDays: 5,
  invoicePrefix:   "INV",
  receiptPrefix:   "RCP",
  paymentMethods:  { cash:true, bankTransfer:true, card:false, online:false },
  categories: [
    { id:1, name:"Tuition Fee",   amount:4500, isActive:true  },
    { id:2, name:"Admission Fee", amount:2000, isActive:true  },
    { id:3, name:"Exam Fee",      amount:800,  isActive:true  },
    { id:4, name:"Library Fee",   amount:200,  isActive:true  },
    { id:5, name:"Transport Fee", amount:1200, isActive:true  },
    { id:6, name:"Hostel Fee",    amount:8500, isActive:true  },
    { id:7, name:"Sports Fee",    amount:150,  isActive:true  },
    { id:8, name:"Lab Fee",       amount:300,  isActive:false },
  ],
};

/* ─── Attendance Settings ─────────────────────────────────────────────── */

export interface AttendanceSettings {
  attendanceType:       "Daily" | "Period-wise";
  allowLateMarking:     boolean;
  lateThresholdMinutes: number;
  halfDayThreshold:     number;
  autoNotifyParents:    boolean;
  lockAfterDays:        number;
  weekendDays:          string[];
  workingHoursStart:    string;
  workingHoursEnd:      string;
  countHolidaysAbsent:  boolean;
}

export const ATTENDANCE_SETTINGS: AttendanceSettings = {
  attendanceType:       "Daily",
  allowLateMarking:     true,
  lateThresholdMinutes: 15,
  halfDayThreshold:     240,
  autoNotifyParents:    true,
  lockAfterDays:        3,
  weekendDays:          ["Saturday", "Sunday"],
  workingHoursStart:    "07:00",
  workingHoursEnd:      "16:00",
  countHolidaysAbsent:  false,
};

/* ─── Exam / Grading Settings ─────────────────────────────────────────── */

export interface GradeRow {
  grade:      string;
  point:      number;
  from:       number;
  to:         number;
  comment:    string;
}

export interface ExamSettings {
  defaultPassPercentage:   number;
  gpaEnabled:              boolean;
  resultApprovalRequired:  boolean;
  admitCardRequired:       boolean;
  practicalMarksEnabled:   boolean;
  internalAssessmentEnabled:boolean;
  absentMark:              number;
  gradeScale:              GradeRow[];
}

export const EXAM_SETTINGS: ExamSettings = {
  defaultPassPercentage:    40,
  gpaEnabled:               true,
  resultApprovalRequired:   true,
  admitCardRequired:        true,
  practicalMarksEnabled:    true,
  internalAssessmentEnabled:true,
  absentMark:               0,
  gradeScale: [
    { grade:"A+", point:4.0, from:90, to:100, comment:"Outstanding"     },
    { grade:"A",  point:3.6, from:80, to:89,  comment:"Excellent"       },
    { grade:"B+", point:3.2, from:70, to:79,  comment:"Very Good"       },
    { grade:"B",  point:2.8, from:60, to:69,  comment:"Good"            },
    { grade:"C+", point:2.4, from:50, to:59,  comment:"Satisfactory"    },
    { grade:"C",  point:2.0, from:40, to:49,  comment:"Acceptable"      },
    { grade:"D",  point:1.6, from:30, to:39,  comment:"Partial"         },
    { grade:"F",  point:0.0, from:0,  to:29,  comment:"Not Satisfactory"},
  ],
};

/* ─── Security Settings ──────────────────────────────────────────────── */

export interface SecuritySettings {
  minPasswordLength:    number;
  requireUppercase:     boolean;
  requireNumber:        boolean;
  requireSpecialChar:   boolean;
  sessionTimeoutMins:   number;
  loginAlertsEnabled:   boolean;
  autoLogoutInactive:   boolean;
  maxLoginAttempts:     number;
  lockoutDurationMins:  number;
  twoFactorEnabled:     boolean;
  allowedDomains:       string[];
  ipWhitelistEnabled:   boolean;
}

export const SECURITY_SETTINGS: SecuritySettings = {
  minPasswordLength:    8,
  requireUppercase:     true,
  requireNumber:        true,
  requireSpecialChar:   false,
  sessionTimeoutMins:   60,
  loginAlertsEnabled:   true,
  autoLogoutInactive:   true,
  maxLoginAttempts:     5,
  lockoutDurationMins:  30,
  twoFactorEnabled:     false,
  allowedDomains:       ["schoolos.np", "gmail.com"],
  ipWhitelistEnabled:   false,
};

/* ─── Backup & Export ─────────────────────────────────────────────────── */

export interface BackupRecord {
  id:        number;
  date:      string;
  size:      string;
  status:    BackupStatus;
  type:      "Manual" | "Automatic";
  createdBy: string;
}

export interface BackupInfo {
  lastBackup:    string;
  status:        BackupStatus;
  storageUsed:   string;
  storageTotal:  string;
  autoBackup:    boolean;
  backupFreq:    "Daily" | "Weekly" | "Monthly";
  retainDays:    number;
  history:       BackupRecord[];
}

export const BACKUP_INFO: BackupInfo = {
  lastBackup:   "2026-07-05 11:00 PM",
  status:       "Success",
  storageUsed:  "2.4 GB",
  storageTotal: "10 GB",
  autoBackup:   true,
  backupFreq:   "Daily",
  retainDays:   30,
  history: [
    { id:1, date:"2026-07-05 11:00 PM", size:"2.4 GB", status:"Success", type:"Automatic", createdBy:"System"         },
    { id:2, date:"2026-07-04 11:00 PM", size:"2.3 GB", status:"Success", type:"Automatic", createdBy:"System"         },
    { id:3, date:"2026-07-03 03:15 PM", size:"2.3 GB", status:"Success", type:"Manual",    createdBy:"Platform Admin"  },
    { id:4, date:"2026-07-02 11:00 PM", size:"2.2 GB", status:"Failed",  type:"Automatic", createdBy:"System"         },
    { id:5, date:"2026-07-01 02:00 PM", size:"2.2 GB", status:"Success", type:"Manual",    createdBy:"Platform Admin"  },
  ],
};

/* ─── Audit Logs ─────────────────────────────────────────────────────── */

export interface AuditLog {
  id:        number;
  date:      string;
  user:      string;
  role:      string;
  action:    string;
  module:    string;
  ipAddress: string;
  status:    "Success" | "Failed" | "Warning";
}

export const AUDIT_LOGS: AuditLog[] = [
  { id:1,  date:"2026-07-06 09:15 AM", user:"Platform Admin",    role:"Super Admin",  action:"Updated school profile",         module:"Settings",   ipAddress:"192.168.1.10", status:"Success" },
  { id:2,  date:"2026-07-06 09:00 AM", user:"Kavita Joshi",      role:"HR Manager",   action:"Added new staff record",         module:"Teachers",   ipAddress:"192.168.1.15", status:"Success" },
  { id:3,  date:"2026-07-06 08:45 AM", user:"Kazi Fahim",        role:"Teacher",      action:"Marked attendance – Grade 6A",   module:"Attendance", ipAddress:"192.168.1.22", status:"Success" },
  { id:4,  date:"2026-07-06 08:30 AM", user:"Dr. Rajesh Sharma", role:"Principal",    action:"Approved exam results",          module:"Exams",      ipAddress:"192.168.1.12", status:"Success" },
  { id:5,  date:"2026-07-05 04:00 PM", user:"Sunita Gurung",     role:"Accountant",   action:"Generated fee invoice INV-0245", module:"Fees",       ipAddress:"192.168.1.18", status:"Success" },
  { id:6,  date:"2026-07-05 03:45 PM", user:"Sunita Gurung",     role:"Accountant",   action:"Fee payment failed (gateway)",   module:"Fees",       ipAddress:"192.168.1.18", status:"Failed"  },
  { id:7,  date:"2026-07-05 02:00 PM", user:"Platform Admin",    role:"Super Admin",  action:"Created manual backup",          module:"Settings",   ipAddress:"192.168.1.10", status:"Success" },
  { id:8,  date:"2026-07-05 01:30 PM", user:"Mira Shrestha",     role:"Receptionist", action:"Created new student admission",  module:"Students",   ipAddress:"192.168.1.30", status:"Success" },
  { id:9,  date:"2026-07-05 11:00 AM", user:"Platform Admin",    role:"Super Admin",  action:"Updated notification settings",  module:"Settings",   ipAddress:"192.168.1.10", status:"Success" },
  { id:10, date:"2026-07-04 09:30 AM", user:"Unknown",           role:"—",            action:"Failed login attempt (3 tries)", module:"Auth",       ipAddress:"103.22.45.12", status:"Warning" },
  { id:11, date:"2026-07-04 08:00 AM", user:"Kazi Fahim",        role:"Teacher",      action:"Published exam schedule",        module:"Exams",      ipAddress:"192.168.1.22", status:"Success" },
  { id:12, date:"2026-07-03 04:45 PM", user:"Dr. Rajesh Sharma", role:"Principal",    action:"Sent school-wide notice",        module:"Notices",    ipAddress:"192.168.1.12", status:"Success" },
  { id:13, date:"2026-07-03 02:30 PM", user:"Platform Admin",    role:"Super Admin",  action:"Changed user role – Receptionist→HR", module:"Settings", ipAddress:"192.168.1.10", status:"Success" },
  { id:14, date:"2026-07-02 10:00 AM", user:"Sunita Gurung",     role:"Accountant",   action:"Exported fee report (PDF)",      module:"Fees",       ipAddress:"192.168.1.18", status:"Success" },
  { id:15, date:"2026-07-01 09:00 AM", user:"Platform Admin",    role:"Super Admin",  action:"System auto-backup completed",   module:"System",     ipAddress:"127.0.0.1",    status:"Success" },
];

/* ─── Appearance Settings (defaults) ─────────────────────────────────── */

export interface AppearanceSettings {
  accentColor:   string;
  sidebarDensity:"comfortable" | "compact";
  tableDensity:  "comfortable" | "compact";
  animationLevel:"full" | "reduced" | "none";
  cardRadius:    "small" | "medium" | "large";
  fontSize:      "small" | "default" | "large";
}

export const DEFAULT_APPEARANCE: AppearanceSettings = {
  accentColor:    "#6366f1",
  sidebarDensity: "comfortable",
  tableDensity:   "comfortable",
  animationLevel: "full",
  cardRadius:     "medium",
  fontSize:       "default",
};
