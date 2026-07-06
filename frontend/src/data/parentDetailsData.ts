export interface ChildAcademic {
  studentId: number;
  name: string;
  className: string;
  section: string;
  attendancePct: number;
  classRank: number;
  latestExamPct: number;
  homeworkStatus: "Up to date" | "1 pending" | "2 pending" | "3+ pending";
  behaviorNote: string;
  dueFees: number;
  upcomingExams: number;
  resultPublished: number;
}

export interface FeeRecord {
  id: string;
  child: string;
  feeType: string;
  amount: number;
  status: "Paid" | "Due" | "Overdue";
  email: string;
  date: string;
}

export interface ParentNotice {
  id: string;
  title: string;
  author: string;
  category: "Academic" | "Fee" | "Event" | "Exam" | "Holiday" | "Meeting";
  date: string;
  timeAgo: string;
  text: string;
}

export interface ParentActivity {
  id: string;
  type: "attendance" | "payment" | "result" | "notice" | "message" | "document" | "meeting";
  message: string;
  timestamp: string;
}

export interface ParentDocument {
  id: string;
  name: string;
  type: string;
  uploadedOn: string;
  size: string;
  status: "Verified" | "Pending" | "Expired";
}

export interface SummaryCards {
  dueFees: number;
  upcomingExams: number;
  resultPublished: number;
  totalExpenses: number;
}

export interface ParentDetailMock {
  nationality: string;
  religion: string;
  emergencyContact: string;
  emergencyRelation: string;
  permanentAddress: string;
  summaryCards: SummaryCards;
  childrenAcademic: ChildAcademic[];
  feesSummary: { totalPaid: number; totalDue: number; nextDueDate: string };
  feeRecords: FeeRecord[];
  notices: ParentNotice[];
  activities: ParentActivity[];
  documents: ParentDocument[];
}

export const PARENT_DETAIL_MOCK: ParentDetailMock = {
  nationality: "Nepali",
  religion: "Islam",
  emergencyContact: "+977-9841111222",
  emergencyRelation: "Brother",
  permanentAddress: "Dharan, Sunsari, Province 1",

  summaryCards: {
    dueFees:        1500,
    upcomingExams:  15,
    resultPublished: 8,
    totalExpenses:  10000,
  },

  childrenAcademic: [
    {
      studentId: 1,
      name: "Richi Hassan",
      className: "Grade 2",
      section: "A",
      attendancePct: 94,
      classRank: 3,
      latestExamPct: 88,
      homeworkStatus: "Up to date",
      behaviorNote: "Excellent student, participates actively.",
      dueFees: 0,
      upcomingExams: 2,
      resultPublished: 3,
    },
    {
      studentId: 2,
      name: "Mark Willy",
      className: "Grade 6",
      section: "B",
      attendancePct: 87,
      classRank: 12,
      latestExamPct: 76,
      homeworkStatus: "1 pending",
      behaviorNote: "Good performance; needs improvement in punctuality.",
      dueFees: 1500,
      upcomingExams: 3,
      resultPublished: 2,
    },
  ],

  feesSummary: {
    totalPaid: 45000,
    totalDue:  1500,
    nextDueDate: "2026-07-15",
  },

  feeRecords: [
    { id: "f1", child: "Richi Hassan",  feeType: "Tuition Fee",  amount: 8000,  status: "Paid",    email: "kazi.fahim@example.com", date: "2026-06-01" },
    { id: "f2", child: "Mark Willy",    feeType: "Tuition Fee",  amount: 8000,  status: "Paid",    email: "kazi.fahim@example.com", date: "2026-06-01" },
    { id: "f3", child: "Mark Willy",    feeType: "Exam Fee",     amount: 500,   status: "Due",     email: "kazi.fahim@example.com", date: "2026-07-10" },
    { id: "f4", child: "Richi Hassan",  feeType: "Library Fee",  amount: 300,   status: "Paid",    email: "kazi.fahim@example.com", date: "2026-05-15" },
    { id: "f5", child: "Mark Willy",    feeType: "Transport Fee",amount: 1500,  status: "Overdue", email: "kazi.fahim@example.com", date: "2026-06-30" },
    { id: "f6", child: "Richi Hassan",  feeType: "Activity Fee", amount: 300,   status: "Paid",    email: "kazi.fahim@example.com", date: "2026-04-20" },
  ],

  notices: [
    { id: "n1", title: "Annual Exam Routine Published", author: "Admin Office", category: "Exam",    date: "2026-06-28", timeAgo: "3 days ago", text: "The annual examination schedule has been published. Please download the routine from the portal." },
    { id: "n2", title: "Fee Payment Reminder",          author: "Accounts",    category: "Fee",     date: "2026-06-25", timeAgo: "6 days ago", text: "This is a reminder that Q3 fees are due by July 15. Please clear dues to avoid late penalties." },
    { id: "n3", title: "Parent-Teacher Meeting",        author: "Principal",   category: "Meeting", date: "2026-06-20", timeAgo: "11 days ago",text: "A parent-teacher meeting is scheduled for July 5, 2026 at 10:00 AM. Your attendance is mandatory." },
    { id: "n4", title: "Grade 6 Result Published",      author: "Exam Office", category: "Academic",date: "2026-06-15", timeAgo: "16 days ago",text: "Results for Grade 6 Mid-Term Examination have been published. Login to view detailed marksheet." },
    { id: "n5", title: "Summer Holiday Notice",         author: "Admin Office", category: "Holiday", date: "2026-06-10", timeAgo: "21 days ago",text: "School will remain closed from July 14–21, 2026 for summer holidays. Regular classes resume July 22." },
  ],

  activities: [
    { id: "a1", type: "payment",    message: "Tuition fee of NPR 8,000 paid for Mark Willy — June 2026.",     timestamp: "2026-06-01T10:00:00Z" },
    { id: "a2", type: "attendance", message: "Richi Hassan marked present — attendance 94% (June).",           timestamp: "2026-06-28T09:00:00Z" },
    { id: "a3", type: "result",     message: "Mid-term result published for Mark Willy — 76% overall.",        timestamp: "2026-06-15T14:00:00Z" },
    { id: "a4", type: "notice",     message: "New notice received: Annual Exam Routine Published.",             timestamp: "2026-06-28T11:00:00Z" },
    { id: "a5", type: "meeting",    message: "Parent-Teacher Meeting scheduled for July 5, 2026.",             timestamp: "2026-06-20T09:00:00Z" },
    { id: "a6", type: "payment",    message: "Library fee NPR 300 paid for Richi Hassan.",                     timestamp: "2026-05-15T10:30:00Z" },
    { id: "a7", type: "document",   message: "Citizenship certificate uploaded and verified.",                  timestamp: "2026-04-01T14:00:00Z" },
    { id: "a8", type: "message",    message: "Message sent to Class Teacher of Grade 6B.",                     timestamp: "2026-03-18T16:00:00Z" },
  ],

  documents: [
    { id: "d1", name: "Parent Citizenship Certificate", type: "PDF", uploadedOn: "2026-01-10", size: "680 KB", status: "Verified" },
    { id: "d2", name: "Guardian Photo",                  type: "JPG", uploadedOn: "2026-01-10", size: "340 KB", status: "Verified" },
    { id: "d3", name: "Address Proof",                   type: "PDF", uploadedOn: "2026-01-12", size: "520 KB", status: "Verified" },
    { id: "d4", name: "Relationship Proof",              type: "PDF", uploadedOn: "2026-01-15", size: "290 KB", status: "Pending"  },
    { id: "d5", name: "Emergency Contact Form",          type: "PDF", uploadedOn: "2026-02-01", size: "180 KB", status: "Verified" },
  ],
};
