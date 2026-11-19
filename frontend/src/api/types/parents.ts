/** Parent / guardian view models (mapped from the API in api/parents.ts). */

export type ParentStatus = "active" | "inactive" | "blocked";
export type ParentGender = "Male" | "Female" | "Other" | "";
export type ParentRelation = "Father" | "Mother" | "Guardian" | "Uncle" | "Aunt" | "Grandfather" | "Grandmother" | "Sibling" | "Other";

export interface LinkedChild {
  id: string;
  studentId: string;
  name: string;
  admissionNo: string;
  registrationNo: string;
  className: string;
  section: string;
  roll: number | null;
  gender: string;
  status: string;
}

export interface Parent {
  id: string;
  parentId: string;
  guardianCode: string;
  name: string;
  gender: ParentGender;
  relation: ParentRelation;
  occupation: string;
  phone: string;
  alternatePhone: string;
  email: string;
  address: string;
  status: ParentStatus;
  linkedChildren: LinkedChild[];
}

export const RELATION_OPTIONS: ParentRelation[] = ["Father", "Mother", "Guardian", "Uncle", "Aunt", "Grandfather", "Grandmother", "Sibling", "Other"];
export const STATUS_OPTIONS: ParentStatus[] = ["active", "inactive", "blocked"];

export interface ChildAcademic {
  studentId: string;
  name: string;
  className: string;
  section: string;
  attendancePct: number | null;
  classRank: number | null;
  latestExamPct: number | null;
  homeworkStatus: string;
  behaviorNote: string;
  dueFees: number | null;
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
  dueFees: number | null;
  upcomingExams: number;
  resultPublished: number;
  totalExpenses: number;
}

export interface ParentDetailView {
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
