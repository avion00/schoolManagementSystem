import { api } from "./api";
import type { Paginated } from "./students";

export interface MyProfile {
  id: string;
  full_name: string;
  first_name: string;
  middle_name: string;
  last_name: string;
  date_of_birth: string | null;
  gender: string;
  blood_group: string;
  nationality: string;
  religion: string;
  address: string;
  phone: string;
  email: string;
  admission_number: string;
  roll_number: string;
  class_level_name: string | null;
  section_name: string | null;
  academic_year_name: string | null;
  guardian_name: string | null;
  status: string;
}

export interface AttendanceSummary {
  total: number;
  by_status: Record<string, number>;
  present_pct: number | null;
}

export interface ExamSubjectMark {
  subject: string;
  marks_obtained: number | null;
  full_marks: number;
  pass_marks: number;
  is_absent: boolean;
}

export interface ExamResult {
  exam_id: string;
  exam: string;
  percentage: number | null;
  obtained: number;
  full: number;
  subjects: ExamSubjectMark[];
}

export interface FeesSummary {
  billed: number;
  paid: number;
  outstanding: number;
}

export interface MyInvoice {
  id: string;
  number: string;
  status: string;
  total_amount: string;
  paid_amount: string;
  balance: string;
  issue_date: string;
  due_date: string | null;
}

export interface MyAttendanceRow {
  id: string;
  date: string;
  status: string;
  remark: string;
}

export interface MyDashboard {
  profile: MyProfile;
  attendance: AttendanceSummary;
  fees: FeesSummary;
  published_exams: number;
  latest_result: ExamResult | null;
}

export const getMyDashboard = async () =>
  (await api.get<MyDashboard>("/me/dashboard/")).data;

export const getMyProfile = async () =>
  (await api.get<MyProfile>("/me/profile/")).data;

export const updateMyProfile = async (
  patch: Partial<Pick<MyProfile, "phone" | "email" | "address">>,
) => (await api.patch<MyProfile>("/me/profile/", patch)).data;

export const getMyAttendanceSummary = async () =>
  (await api.get<AttendanceSummary>("/me/attendance/summary/")).data;

export const getMyAttendance = async (page = 1) =>
  (await api.get<Paginated<MyAttendanceRow>>("/me/attendance/", { params: { page } })).data;

export const getMyResults = async () =>
  (await api.get<ExamResult[]>("/me/results/")).data;

export const getMyFees = async () =>
  (await api.get<{ summary: FeesSummary; invoices: MyInvoice[] }>("/me/fees/")).data;
