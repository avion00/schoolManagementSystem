/* ─── Types ────────────────────────────────────────────────────────────── */

export type AcademicYearStatus = "Active" | "Upcoming" | "Archived";
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
