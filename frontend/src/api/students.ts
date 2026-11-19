/**
 * Students: API access, mapping to page view models, and query hooks.
 */
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";

import { del, get, getAll, label, patch, post, type Schemas } from "./http";
import type {
  ActivityItem,
  AttendanceMonth,
  ExamMeta,
  ExamScore,
  GuardianInfo,
  Payment,
  RankInfo,
  Student,
  StudentDetailView,
  StudentGender,
  StudentStatus,
  TimetableEntry,
} from "./types/students";

type ApiStudentList = Schemas["StudentList"];
type ApiStudent = Schemas["Student"];
type ApiGuardian = Schemas["GuardianMini"];

const API_ORIGIN = (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/api\/v1\/?$/, "")
  ?? "http://127.0.0.1:8000";

export function fileUrl(file: { download_url: string } | null | undefined): string | null {
  return file ? `${API_ORIGIN}${file.download_url}` : null;
}

// ── mappers ────────────────────────────────────────────────────────────────

export function toGender(g: string | undefined | null): StudentGender {
  return g === "male" ? "Male" : g === "female" ? "Female" : g === "other" ? "Other" : "";
}

export function fromGender(g: StudentGender | string): string {
  return g ? g.toLowerCase() : "";
}

export function toRoll(roll: string | undefined | null): number | null {
  const n = Number.parseInt(roll ?? "", 10);
  return Number.isFinite(n) ? n : null;
}

export function mapStudent(s: ApiStudentList | ApiStudent): Student {
  return {
    id: s.id,
    admissionNo: s.admission_number,
    registrationNo: s.registration_number ?? "",
    name: s.full_name,
    gender: toGender(s.gender),
    className: s.class_level_name,
    classId: s.class_level,
    section: s.section_name ?? null,
    sectionId: s.section ?? null,
    roll: toRoll(s.roll_number),
    parentName: s.primary_guardian_name ?? "",
    mobile: s.phone ?? "",
    email: s.email ?? "",
    address: s.address ?? "",
    dateOfBirth: s.date_of_birth ?? "",
    status: s.status as StudentStatus,
    photoUrl: fileUrl(s.photo),
  };
}

/** Father / mother / other guardian from the student's guardian links. */
export function guardianInfo(guardians: readonly ApiGuardian[], emergency: string): GuardianInfo {
  const by = (rel: string) => guardians.find((g) => g.relation === rel);
  const father = by("father");
  const mother = by("mother");
  const other = guardians.find((g) => g !== father && g !== mother);
  return {
    fatherName: father?.full_name ?? "", fatherOccupation: father?.occupation ?? "",
    fatherPhone: father?.phone ?? "", fatherEmail: father?.email ?? "",
    motherName: mother?.full_name ?? "", motherOccupation: mother?.occupation ?? "",
    motherPhone: mother?.phone ?? "", motherEmail: mother?.email ?? "",
    guardianName: other?.full_name ?? "", guardianRelation: label(other?.relation),
    guardianPhone: other?.phone ?? "", emergencyContact: emergency,
  };
}

// ── overview (one round-trip for the details page) ───────────────────────────

export interface ResultSubject {
  subject: string;
  full_marks: number;
  marks_obtained: number | null;
  grade: string | null;
  grade_point: number | null;
  result: string;
}

export interface ExamResult {
  exam_id: string;
  exam: string;
  is_published: boolean;
  subjects: ResultSubject[];
  obtained: number;
  full: number;
  percentage: number | null;
  grade: string | null;
  gpa: number | null;
  result: string;
  rank: number | null;
  section_rank: number | null;
}

interface Overview {
  student: ApiStudent;
  attendance: { total: number; by_status: Record<string, number>; present_pct: number | null };
  fees: { billed: number; paid: number; outstanding: number } | null;
  results: ExamResult[];
  history: {
    id: string; kind: string; effective_date: string; reason: string; from_status: string; to_status: string;
    from_class_level_name: string | null; to_class_level_name: string | null; actor: string | null;
    created_at: string;
  }[];
}

function remarkFor(pct: number): ExamScore["remarks"] {
  return pct >= 85 ? "Excellent" : pct >= 70 ? "Good" : pct >= 50 ? "Satisfactory" : "Needs Improvement";
}

export function examView(r: ExamResult | undefined): { meta: ExamMeta | null; scores: ExamScore[]; rank: RankInfo | null } {
  if (!r) return { meta: null, scores: [], rank: null };
  const scores = r.subjects.map((s) => ({
    subject: s.subject,
    fullMarks: s.full_marks,
    obtained: s.marks_obtained ?? 0,
    grade: s.grade ?? (s.result === "absent" ? "AB" : "—"),
    gradePoint: s.grade_point ?? 0,
    remarks: remarkFor(s.marks_obtained !== null ? (s.marks_obtained / s.full_marks) * 100 : 0),
  }));
  const pct = r.percentage ?? 0;
  const meta: ExamMeta = {
    name: r.exam, term: "", year: "", totalMarks: r.full, obtained: r.obtained, percentage: pct,
    gpa: r.gpa ?? 0, result: r.result === "pass" ? "Pass" : "Fail",
  };
  const ranked = [...scores].sort((a, b) => b.obtained / b.fullMarks - a.obtained / a.fullMarks);
  const rank: RankInfo | null = r.rank === null ? null : {
    classRank: r.rank, classTotalStudents: 0, sectionRank: r.section_rank ?? 0, sectionTotalStudents: 0,
    overallPerformance: pct >= 85 ? "Excellent" : pct >= 70 ? "Good" : pct >= 50 ? "Average" : "Below Average",
    averageScore: pct,
    strengths: ranked.slice(0, 2).map((s) => s.subject),
    improvements: ranked.slice(-2).reverse().filter((s) => s.obtained / s.fullMarks < 0.7).map((s) => s.subject),
  };
  return { meta, scores, rank };
}

function historyActivity(h: Overview["history"][number]): ActivityItem {
  const at = new Date(h.created_at);
  const promotion = h.kind === "promotion";
  return {
    id: h.id,
    icon: promotion ? "graduation" : "status",
    title: promotion
      ? `Promoted to ${h.to_class_level_name ?? "new class"}`
      : `Status changed to ${label(h.to_status)}`,
    description: [h.reason, h.actor ? `by ${h.actor}` : ""].filter(Boolean).join(" · "),
    date: h.effective_date,
    time: at.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    color: promotion ? "emerald" : "amber",
  };
}

interface LedgerEntry { date: string; type: string; reference: string; description: string; credit: number }
interface GridRow { period_no: number; start_time: string; end_time: string; subject: string; teacher: string | null; room: string | null }
interface StudentReport { months: { month: string; present: number; absent: number }[] }

const PALETTE = ["blue", "emerald", "amber", "violet", "rose", "sky"];

export async function fetchStudentDetail(id: string, canSeeFees: boolean): Promise<StudentDetailView & { student: Student }> {
  const ov = await get<Overview>(`/students/${id}/overview/`);
  const s = ov.student;
  const today = new Date().toLocaleDateString("en-US", { weekday: "long" }).toLowerCase();
  type Grid = { days: Record<string, GridRow[]> };
  const [report, grid, ledger, section, classLevel] = await Promise.all([
    get<StudentReport>("/attendance/student-report/", { student: id }).catch(() => ({ months: [] })),
    s.section
      ? get<Grid>("/timetable/entries/grid/", { section: s.section }).catch((): Grid => ({ days: {} }))
      : Promise.resolve<Grid>({ days: {} }),
    canSeeFees
      ? get<{ entries: LedgerEntry[] }>("/fees/ledger/", { student: id }).catch(() => ({ entries: [] }))
      : Promise.resolve({ entries: [] as LedgerEntry[] }),
    s.section ? get<Schemas["Section"]>(`/academics/sections/${s.section}/`).catch(() => null) : Promise.resolve(null),
    get<Schemas["ClassLevel"]>(`/academics/class-levels/${s.class_level}/`).catch(() => null),
  ]);

  const a = ov.attendance.by_status;
  const exam = examView(ov.results[0]);
  const fees = ov.fees;
  const attendanceMonthly: AttendanceMonth[] = report.months.map((m) => ({
    month: new Date(`${m.month}-01`).toLocaleDateString("en-US", { month: "short" }),
    present: m.present, absent: m.absent,
  }));
  const timetable: TimetableEntry[] = (grid.days[today] ?? []).map((row, i) => ({
    period: row.period_no,
    time: `${row.start_time.slice(0, 5)} – ${row.end_time.slice(0, 5)}`,
    subject: row.subject, teacher: row.teacher ?? "—", room: row.room ?? "—",
    color: PALETTE[i % PALETTE.length],
  }));
  const payments: Payment[] = ledger.entries
    .filter((e) => e.type === "payment")
    .map((e) => ({ receiptNo: e.reference, date: e.date, amount: e.credit, method: e.description.split(" for ")[0],
                   status: "Paid" as const, description: e.description }));

  return {
    student: mapStudent(s),
    guardian: guardianInfo(s.guardians, [s.emergency_contact_name, s.emergency_contact_phone].filter(Boolean).join(" · ")),
    contact: {
      email: s.email ?? "", mobile: s.phone ?? "", currentAddress: s.address ?? "",
      permanentAddress: s.permanent_address ?? "", city: s.city ?? "", state: s.state ?? "",
      country: s.country ?? "", postalCode: s.postal_code ?? "",
    },
    academicExtra: {
      house: s.house ?? "", previousSchool: s.previous_school ?? "",
      classTeacher: section?.class_teacher_name ?? "", session: s.academic_year_name,
      medium: label(classLevel?.medium), shift: label(classLevel?.shift),
      subjectsCount: exam.scores.length,
    },
    personalExtra: {
      bloodGroup: s.blood_group ?? "", nationality: s.nationality ?? "", religion: s.religion ?? "",
      studentType: label(s.student_type),
    },
    attendanceSummary: {
      present: (a.present ?? 0) + (a.late ?? 0), absent: a.absent ?? 0, late: a.late ?? 0,
      halfDay: a.half_day ?? 0, totalDays: ov.attendance.total, presentPercent: ov.attendance.present_pct ?? 0,
    },
    attendanceMonthly,
    scores: exam.scores,
    examMeta: exam.meta,
    rank: exam.rank,
    awards: [],
    fees: fees && {
      totalFee: fees.billed, paid: fees.paid, due: fees.outstanding, discount: 0, nextDueDate: "",
      status: fees.outstanding <= 0 ? "Paid" : fees.paid > 0 ? "Partial" : "Due",
    },
    payments,
    documents: [],
    timetable,
    remarks: [],
    activities: ov.history.map(historyActivity),
    health: {
      bloodGroup: s.blood_group ?? "",
      height: s.height_cm ? `${s.height_cm} cm` : "",
      weight: s.weight_kg ? `${s.weight_kg} kg` : "",
      allergies: (s.allergies ?? "").split(",").map((x) => x.trim()).filter(Boolean),
      medicalNotes: [s.medical_conditions, s.medical_note].filter(Boolean).join(" · "),
      doctorName: s.doctor_name ?? "", doctorPhone: s.doctor_phone ?? "",
    },
    transport: null,
    hostel: null,
  };
}

// ── hooks ────────────────────────────────────────────────────────────────────

export const studentKeys = {
  all: ["students"] as const,
  detail: (id: string) => ["students", id] as const,
};

export function useStudents() {
  return useQuery({
    queryKey: studentKeys.all,
    queryFn: async () => (await getAll<ApiStudentList>("/students/")).map(mapStudent),
    staleTime: 60_000,
  });
}

export function useStudentDetail(id: string | undefined, canSeeFees: boolean) {
  return useQuery({
    queryKey: [...studentKeys.detail(id ?? ""), canSeeFees],
    queryFn: () => fetchStudentDetail(id!, canSeeFees),
    enabled: !!id,
  });
}

export function useStudentRecord(id: string | undefined) {
  return useQuery({
    queryKey: ["students", id, "record"],
    queryFn: () => get<ApiStudent>(`/students/${id}/`),
    enabled: !!id,
  });
}

// ── academics options (used by filters and the form) ─────────────────────────

export interface ClassOption { id: string; name: string; order: number }
export interface SectionOption { id: string; name: string; classId: string; className: string }
export interface YearOption { id: string; name: string; isCurrent: boolean }

export function useAcademicOptions() {
  return useQuery({
    queryKey: ["academics", "options"],
    queryFn: async () => {
      const [years, classes, sections] = await Promise.all([
        getAll<Schemas["AcademicYear"]>("/academics/academic-years/"),
        getAll<Schemas["ClassLevel"]>("/academics/class-levels/"),
        getAll<Schemas["Section"]>("/academics/sections/"),
      ]);
      return {
        years: years.map((y): YearOption => ({ id: y.id, name: y.name, isCurrent: !!y.is_current })),
        classes: classes.map((c): ClassOption => ({ id: c.id, name: c.name, order: c.order ?? 0 }))
          .sort((a, b) => a.order - b.order),
        sections: sections.map((s): SectionOption => ({
          id: s.id, name: s.name, classId: s.class_level, className: s.class_level_name,
        })),
      };
    },
    staleTime: 5 * 60_000,
  });
}

// ── writes ───────────────────────────────────────────────────────────────────

export type StudentPayload = Partial<Record<keyof ApiStudent, unknown>>;

export interface GuardianInput {
  relation: "father" | "mother" | "guardian" | "other" | string;
  full_name: string;
  phone?: string;
  email?: string;
  occupation?: string;
  is_primary?: boolean;
}

/**
 * Create or update a student, then make their guardian links match the form:
 * existing guardians with the same relation are updated, new ones created and linked.
 */
export async function saveStudent(
  id: string | undefined, payload: StudentPayload, guardians: GuardianInput[],
): Promise<ApiStudent> {
  const student = id
    ? await patch<ApiStudent>(`/students/${id}/`, payload)
    : await post<ApiStudent>("/students/", payload);

  for (const g of guardians.filter((x) => x.full_name.trim())) {
    const existing = student.guardians.find((link) => link.relation === g.relation);
    const body = { full_name: g.full_name, phone: g.phone ?? "", email: g.email ?? "",
                   occupation: g.occupation ?? "", relation: g.relation };
    if (existing) {
      await patch(`/guardians/${existing.guardian}/`, body);
    } else {
      const created = await post<{ id: string }>("/guardians/", body);
      await post("/student-guardians/", {
        student: student.id, guardian: created.id, relation: g.relation,
        is_primary: !!g.is_primary && !student.guardians.some((l) => l.is_primary),
      });
    }
  }
  return get<ApiStudent>(`/students/${student.id}/`);
}

export function useSaveStudent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (v: { id?: string; payload: StudentPayload; guardians: GuardianInput[] }) =>
      saveStudent(v.id, v.payload, v.guardians),
    onSuccess: () => qc.invalidateQueries({ queryKey: studentKeys.all }),
  });
}

export function useDeleteStudent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => del(`/students/${id}/`),
    onSuccess: () => qc.invalidateQueries({ queryKey: studentKeys.all }),
  });
}

/** Download the filtered CSV export through the authenticated client. */
export async function exportStudentsCsv(params: Record<string, string>): Promise<void> {
  const { api } = await import("@/lib/api");
  const res = await api.get("/students/export/", { params, responseType: "blob" });
  const url = URL.createObjectURL(res.data as Blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `students-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

// ── documents ────────────────────────────────────────────────────────────────

export interface StudentDocumentRecord {
  id: string;
  kind: string;
  kind_label: string;
  file: Schemas["StoredFile"];
  verified_at: string | null;
  verified_by_name: string | null;
  created_at: string;
}

export function useStudentDocuments(id: string | undefined) {
  return useQuery({
    queryKey: ["students", id, "documents"],
    queryFn: () => get<StudentDocumentRecord[]>(`/students/${id}/documents/`),
    enabled: !!id,
  });
}

export function useDocumentActions(id: string) {
  const qc = useQueryClient();
  const refresh = () => qc.invalidateQueries({ queryKey: ["students", id] });
  return {
    add: useMutation({
      mutationFn: (v: { kind: string; fileId: string }) =>
        post<StudentDocumentRecord>(`/students/${id}/documents/`, { kind: v.kind, file_id: v.fileId }),
      onSuccess: refresh,
    }),
    verify: useMutation({
      mutationFn: (docId: string) => post<StudentDocumentRecord>(`/students/${id}/documents/${docId}/`),
      onSuccess: refresh,
    }),
    remove: useMutation({
      mutationFn: (docId: string) => del(`/students/${id}/documents/${docId}/`),
      onSuccess: refresh,
    }),
  };
}

export async function changeStudentStatus(id: string, status: string, reason: string) {
  return post(`/students/${id}/change-status/`, { status, reason });
}
