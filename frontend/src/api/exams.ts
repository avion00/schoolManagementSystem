/**
 * Exams: API access, mapping to the exam pages' view models, query hooks.
 *
 * The backend splits an exam (term, type, status, lock/publish) from its papers
 * (`exam-subjects`: one subject for one class). The schedule pages list papers,
 * each carrying its exam's details.
 */
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { del, get, getAll, patch, post, type Schemas } from "./http";
import type {
  Exam, ExamResult, ExamRoom, ExamSchedule, ExamStatus, ExamType, GradeBand, GradeScale,
  MarksRow, MarksSheet, ResultStatus, ScheduleClash,
} from "./types/exams";

type ApiExam = Schemas["Exam"];
type ApiPaper = Schemas["ExamSubject"];
type ApiScale = Schemas["GradeScale"];
type ApiBand = Schemas["GradeBand"];

export const TYPE_LABEL: Record<string, ExamType> = {
  class_test: "Class Test", unit_test: "Unit Test", mid_term: "Mid Term", final_term: "Final Term",
  practical: "Practical Exam", board: "Board Exam", mock: "Mock Test",
};
export const TYPE_VALUE: Record<string, string> = Object.fromEntries(Object.entries(TYPE_LABEL).map(([k, v]) => [v, k]));

const num = (v: string | number | null | undefined): number => (v === null || v === undefined || v === "" ? 0 : Number(v));
const optNum = (v: string | number | null | undefined): number | null => (v === null || v === undefined || v === "" ? null : Number(v));
const hhmm = (t: string | null | undefined) => (t ? t.slice(0, 5) : "");

function minutesBetween(start: string, end: string): number {
  if (!start || !end) return 0;
  const [sh, sm] = start.split(":").map(Number);
  const [eh, em] = end.split(":").map(Number);
  return eh * 60 + em - (sh * 60 + sm);
}

export function mapExam(e: ApiExam): Exam {
  const status: ExamStatus = e.is_published ? "published" : ((e.status ?? "draft") as ExamStatus);
  return {
    id: e.id, code: e.code, name: e.name, term: e.term ?? "", examType: TYPE_LABEL[e.exam_type ?? "final_term"] ?? "Final Term",
    status, academicYear: e.academic_year_name, academicYearId: e.academic_year,
    gradeScaleId: e.grade_scale ?? null, startDate: e.start_date ?? null, endDate: e.end_date ?? null,
    instructions: e.instructions ?? "", isLocked: e.is_locked, isPublished: e.is_published,
    publishedAt: e.published_at ?? null,
  };
}

export function mapPaper(p: ApiPaper, exam: Exam | undefined, rooms: Map<string, Schemas["ExamRoom"]>): ExamSchedule {
  const start = hhmm(p.start_time), end = hhmm(p.end_time);
  return {
    id: p.id, examRecordId: p.exam, examId: exam?.code ?? "", examName: p.exam_name, term: exam?.term ?? "",
    academicYear: exam?.academicYear ?? "", examType: exam?.examType ?? "Final Term",
    subject: p.subject_name, subjectId: p.subject, className: p.class_level_name, classLevelId: p.class_level,
    date: p.exam_date ?? "", startTime: start, endTime: end, duration: Math.max(0, minutesBetween(start, end)),
    reportingTime: hhmm(p.reporting_time), room: p.room_name ?? "", roomId: p.room ?? null,
    seatCapacity: p.room ? rooms.get(p.room)?.capacity ?? null : null,
    invigilator: p.invigilator_name ?? "", invigilatorId: p.invigilator ?? null,
    assistantInvigilator: p.assistant_invigilator_name ?? "", assistantInvigilatorId: p.assistant_invigilator ?? null,
    fullMarks: num(p.full_marks), passMarks: num(p.pass_marks), theoryMarks: num(p.theory_marks),
    practicalMarks: num(p.practical_marks), internalMarks: num(p.internal_marks),
    status: exam?.status ?? "draft", marksEntered: p.marks_entered ?? 0, isLocked: exam?.isLocked ?? false,
    resultPublished: exam?.isPublished ?? false, instructions: p.instructions ?? "", notes: p.notes ?? "",
  };
}

export function mapBand(b: ApiBand): GradeBand {
  return {
    id: b.id, scaleId: b.scale, gradeName: b.grade, gradePoint: num(b.gpa),
    percentFrom: num(b.min_percent), percentUpto: num(b.max_percent),
    resultStatus: b.is_pass === false ? "Fail" : "Pass", comment: b.comment ?? "", colorLabel: b.color ?? "",
  };
}

export function mapScale(s: ApiScale): GradeScale {
  return {
    id: s.id, name: s.name,
    bands: s.bands.map(mapBand).sort((a, b) => b.percentFrom - a.percentFrom),
  };
}

// ── exams & papers ───────────────────────────────────────────────────────────

export function useExams() {
  return useQuery({
    queryKey: ["exams", "list"],
    queryFn: async () => (await getAll<ApiExam>("/exams/exams/")).map(mapExam)
      .sort((a, b) => (b.startDate ?? "").localeCompare(a.startDate ?? "")),
    staleTime: 60_000,
  });
}

async function fetchSchedule() {
  const [exams, papers, rooms] = await Promise.all([
    getAll<ApiExam>("/exams/exams/").then((r) => r.map(mapExam)),
    getAll<ApiPaper>("/exams/exam-subjects/"),
    getAll<Schemas["ExamRoom"]>("/exams/rooms/"),
  ]);
  const byExam = new Map(exams.map((e) => [e.id, e]));
  const byRoom = new Map(rooms.map((r) => [r.id, r]));
  const schedule = papers.map((p) => mapPaper(p, byExam.get(p.exam), byRoom))
    .sort((a, b) => (a.date || "9999").localeCompare(b.date || "9999") || a.startTime.localeCompare(b.startTime));
  // Clashes only matter while an exam is still being planned (draft/scheduled).
  const planning = exams.filter((e) => e.status === "draft" || e.status === "scheduled");
  const clashes: ScheduleClash[] = (await Promise.all(planning.map((e) =>
    get<{ conflicts: { exam_subject: string; clash: { exam_subject: string; exam: string; subject: string; start_time: string; end_time: string; reason: string } }[] }>(
      "/exams/exam-subjects/conflicts/", { exam: e.id }),
  ))).flatMap((r) => r.conflicts.map((c) => ({
    paperId: c.exam_subject, otherPaperId: c.clash.exam_subject, exam: c.clash.exam, subject: c.clash.subject,
    time: `${hhmm(c.clash.start_time)}–${hhmm(c.clash.end_time)}`, reason: c.clash.reason,
  })));
  return { exams, schedule, clashes, rooms: rooms.map(mapRoom) };
}

export function mapRoom(r: Schemas["ExamRoom"]): ExamRoom {
  return {
    id: r.id, roomName: r.name, capacity: r.capacity ?? 0, building: r.building ?? "",
    floor: r.floor ?? "", facilities: r.facilities ?? "",
  };
}

export function useExamSchedule() {
  return useQuery({ queryKey: ["exams", "schedule"], queryFn: fetchSchedule, staleTime: 30_000 });
}

export function usePaperRecord(id: string | undefined) {
  return useQuery({
    queryKey: ["exams", "paper", id],
    queryFn: () => get<ApiPaper>(`/exams/exam-subjects/${id}/`),
    enabled: !!id,
  });
}

/** Server-side clash messages from a rejected paper save, if that's what failed. */
export function clashMessages(error: unknown): string[] | null {
  const data = (error as { response?: { data?: { schedule?: { subject: string; exam: string; start_time: string; end_time: string; reason: string }[] } } })
    ?.response?.data;
  if (!data?.schedule || !Array.isArray(data.schedule)) return null;
  return data.schedule.map((c) =>
    `Clashes with ${c.subject} (${c.exam}) ${hhmm(c.start_time)}–${hhmm(c.end_time)}: ${c.reason}.`);
}

export interface ExamDraft {
  name: string; term: string; exam_type: string; status: string; academic_year: string;
  grade_scale: string | null; start_date: string | null; end_date: string | null; instructions: string;
}

export function useSaveExam() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (v: { id?: string; body: Partial<ExamDraft> }) =>
      v.id ? patch<ApiExam>(`/exams/exams/${v.id}/`, v.body) : post<ApiExam>("/exams/exams/", v.body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["exams"] }),
  });
}

export function useSavePaper() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (v: { id?: string; body: Record<string, unknown> }) =>
      v.id ? patch<ApiPaper>(`/exams/exam-subjects/${v.id}/`, v.body) : post<ApiPaper>("/exams/exam-subjects/", v.body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["exams"] }),
  });
}

export function useDeletePaper() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => del(`/exams/exam-subjects/${id}/`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["exams"] }),
  });
}

/** Lock / unlock marks and publish / unpublish results for an exam. */
export function useExamTransition() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (v: { id: string; action: "lock" | "unlock" | "publish" | "unpublish"; force?: boolean }) =>
      post<ApiExam>(`/exams/exams/${v.id}/${v.action}/`, v.force ? { force: true } : {}),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["exams"] }),
  });
}

/** Papers still missing marks, from a refused publish. */
export function missingMarks(error: unknown): { subject: string; className: string; missing: number }[] | null {
  const data = (error as { response?: { data?: { missing?: Record<string, unknown>[] } } })?.response?.data;
  if (!data?.missing) return null;
  return data.missing.map((m) => ({
    subject: String(m.subject ?? ""), className: String(m.class_level_name ?? ""),
    missing: Number(m.total ?? 0) - Number(m.entered ?? 0),
  }));
}

// ── grade scales ─────────────────────────────────────────────────────────────

export function useGradeScales() {
  return useQuery({
    queryKey: ["exams", "grade-scales"],
    queryFn: async () => (await getAll<ApiScale>("/exams/grade-scales/")).map(mapScale),
    staleTime: 5 * 60_000,
  });
}

export function useSaveScale() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (name: string) => post<ApiScale>("/exams/grade-scales/", { name }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["exams", "grade-scales"] }),
  });
}

export function useSaveBand() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (v: { id?: string; body: Record<string, unknown> }) =>
      v.id ? patch<ApiBand>(`/exams/grade-bands/${v.id}/`, v.body) : post<ApiBand>("/exams/grade-bands/", v.body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["exams", "grade-scales"] }),
  });
}

export function useDeleteBand() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => del(`/exams/grade-bands/${id}/`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["exams", "grade-scales"] }),
  });
}

/** Grade for a percentage on a scale (used to preview marks before saving). */
export function gradeFor(scale: GradeScale | undefined, pct: number): GradeBand | undefined {
  return scale?.bands.find((b) => pct >= b.percentFrom && pct <= b.percentUpto + 0.009);
}

// ── marks ────────────────────────────────────────────────────────────────────

interface ApiSheet {
  exam_subject: ApiPaper;
  locked: boolean;
  components: Record<string, number>;
  rows: {
    student: string; name: string; roll_number: string; admission_number: string; registration_number: string;
    section_name: string | null; mark: Schemas["Mark"] | null;
  }[];
}

export function useMarksSheet(paperId: string | undefined) {
  return useQuery({
    queryKey: ["exams", "marks", paperId],
    queryFn: async (): Promise<MarksSheet> => {
      const s = await get<ApiSheet>("/exams/marks/sheet/", { exam_subject: paperId });
      return {
        paper: mapPaper(s.exam_subject, undefined, new Map()),
        locked: s.locked,
        components: s.components,
        rows: s.rows.map((r): MarksRow => ({
          studentId: r.student, studentName: r.name, admissionNo: r.admission_number,
          registrationNo: r.registration_number, roll: r.roll_number ?? "", section: r.section_name ?? "",
          marksObtained: optNum(r.mark?.marks_obtained), theoryMarks: optNum(r.mark?.theory_marks),
          practicalMarks: optNum(r.mark?.practical_marks), internalMarks: optNum(r.mark?.internal_marks),
          remarks: r.mark?.remarks ?? "", isAbsent: !!r.mark?.is_absent,
        })),
      };
    },
    enabled: !!paperId,
  });
}

export function useSaveMarks() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (v: { paperId: string; rows: MarksRow[]; components: string[] }) =>
      post<{ saved: number; created: number }>("/exams/marks/bulk/", {
        exam_subject: v.paperId,
        records: v.rows.map((r) => r.isAbsent
          ? { student: r.studentId, is_absent: true, remarks: r.remarks }
          : v.components.length
            ? {
              student: r.studentId, remarks: r.remarks,
              ...Object.fromEntries(v.components.map((c) => [`${c}_marks`, r[`${c}Marks` as "theoryMarks"]])),
            }
            : { student: r.studentId, marks_obtained: r.marksObtained, remarks: r.remarks }),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["exams"] }),
  });
}

// ── results ──────────────────────────────────────────────────────────────────

const RESULT_LABEL: Record<string, ResultStatus> = {
  pass: "Pass", fail: "Fail", absent: "Absent", incomplete: "Incomplete",
};

interface ApiResults {
  class_level_name: string;
  papers: { exam_subject: string; subject: string; full_marks: number }[];
  rows: {
    student: string; name: string; admission_number: string; registration_number: string; roll_number: string;
    section_name: string | null; total_obtained: number; total_full: number; percentage: number | null;
    grade: string | null; gpa: number | null; result: string; rank: number | null; section_rank: number | null;
    subjects: { subject: string; full_marks: number; marks_obtained: number | null; grade: string | null;
                grade_point: number | null; result: SubjectResultValue }[];
  }[];
}
type SubjectResultValue = "pass" | "fail" | "absent" | "missing";

export function useExamResults(exam: Exam | undefined, classLevelId: string | undefined, sectionId?: string) {
  return useQuery({
    queryKey: ["exams", "results", exam?.id, classLevelId, sectionId],
    queryFn: async () => {
      const r = await get<ApiResults>(`/exams/exams/${exam!.id}/results/`, { class_level: classLevelId, section: sectionId });
      const rows = r.rows.map((x): ExamResult => ({
        studentId: x.student, studentName: x.name, registrationNo: x.registration_number,
        admissionNo: x.admission_number, className: r.class_level_name, section: x.section_name ?? "",
        roll: x.roll_number ?? "", examName: exam!.name, examTerm: exam!.term, academicYear: exam!.academicYear,
        subjectResults: x.subjects.map((s) => ({
          subject: s.subject, fullMarks: s.full_marks, obtainedMarks: s.marks_obtained, grade: s.grade,
          gradePoint: s.grade_point, result: s.result,
        })),
        totalMarks: x.total_obtained, totalFullMarks: x.total_full, percentage: x.percentage, gpa: x.gpa,
        grade: x.grade, rank: x.rank, sectionRank: x.section_rank, result: RESULT_LABEL[x.result] ?? "Incomplete",
        published: exam!.isPublished, publishedDate: exam!.publishedAt?.slice(0, 10) ?? "",
      }));
      return { papers: r.papers, rows };
    },
    enabled: !!exam && !!classLevelId,
  });
}

// ── admit cards ──────────────────────────────────────────────────────────────

export interface AdmitCard {
  studentId: string; name: string; admissionNo: string; registrationNo: string; roll: string;
  className: string; section: string; dob: string; symbolNumber: string;
}
export interface AdmitPaper { subject: string; date: string; startTime: string; endTime: string; reportingTime: string; room: string }

export function useAdmitCards(examId: string | undefined, classLevelId: string | undefined, sectionId?: string) {
  return useQuery({
    queryKey: ["exams", "admit-cards", examId, classLevelId, sectionId],
    queryFn: async () => {
      const r = await get<{
        schedule: { subject: string; date: string | null; start_time: string | null; end_time: string | null; reporting_time: string | null; room: string | null }[];
        cards: { student: string; name: string; admission_number: string; registration_number: string; roll_number: string;
                 class_level_name: string; section_name: string | null; date_of_birth: string | null; symbol_number: string }[];
      }>(`/exams/exams/${examId}/admit-cards/`, { class_level: classLevelId, section: sectionId });
      return {
        schedule: r.schedule.map((s): AdmitPaper => ({
          subject: s.subject, date: s.date ?? "", startTime: hhmm(s.start_time), endTime: hhmm(s.end_time),
          reportingTime: hhmm(s.reporting_time), room: s.room ?? "",
        })).sort((a, b) => (a.date || "9999").localeCompare(b.date || "9999") || a.startTime.localeCompare(b.startTime)),
        cards: r.cards.map((c): AdmitCard => ({
          studentId: c.student, name: c.name, admissionNo: c.admission_number, registrationNo: c.registration_number,
          roll: c.roll_number ?? "", className: c.class_level_name, section: c.section_name ?? "",
          dob: c.date_of_birth ?? "", symbolNumber: c.symbol_number,
        })),
      };
    },
    enabled: !!examId && !!classLevelId,
  });
}

// ── rooms ────────────────────────────────────────────────────────────────────

export function useSaveRoom() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (v: { id?: string; body: Record<string, unknown> }) =>
      v.id ? patch(`/exams/rooms/${v.id}/`, v.body) : post("/exams/rooms/", v.body),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["exams"] }); qc.invalidateQueries({ queryKey: ["rooms"] }); },
  });
}

// ── report card extras ───────────────────────────────────────────────────────

/** Attendance and class size for a student's report card. */
export function useReportCardExtras(examId: string | undefined, studentId: string | undefined) {
  return useQuery({
    queryKey: ["exams", "report-card", examId, studentId],
    queryFn: async () => {
      const r = await get<{
        class_size: number;
        student: { guardian: string | null; date_of_birth: string | null };
        attendance: { total: number; present_pct: number | null };
      }>(`/exams/exams/${examId}/report-card/`, { student: studentId });
      return {
        classSize: r.class_size, guardian: r.student.guardian ?? "", dob: r.student.date_of_birth ?? "",
        attendanceDays: r.attendance.total, attendancePct: r.attendance.present_pct,
      };
    },
    enabled: !!examId && !!studentId,
  });
}

// ── dashboard ────────────────────────────────────────────────────────────────

export interface ClassPerformance { className: string; passRate: number | null; avgGpa: number | null; students: number }

/** Per-class performance and top students for the latest published exam. */
export function useLatestResults(exam: Exam | undefined, classLevels: { id: string; name: string }[]) {
  return useQuery({
    queryKey: ["exams", "latest-results", exam?.id, classLevels.map((c) => c.id).join(",")],
    queryFn: async () => {
      const perClass = await Promise.all(classLevels.map(async (c) => ({
        className: c.name,
        rows: (await get<ApiResults>(`/exams/exams/${exam!.id}/results/`, { class_level: c.id })).rows,
      })));
      const performance: ClassPerformance[] = perClass.map(({ className, rows }) => {
        const graded = rows.filter((r) => r.result === "pass" || r.result === "fail");
        const gpas = graded.map((r) => r.gpa).filter((g): g is number => g !== null);
        return {
          className, students: rows.length,
          passRate: graded.length ? Math.round((graded.filter((r) => r.result === "pass").length / graded.length) * 100) : null,
          avgGpa: gpas.length ? Math.round((gpas.reduce((s, g) => s + g, 0) / gpas.length) * 100) / 100 : null,
        };
      });
      const top = perClass.flatMap(({ className, rows }) => rows.filter((r) => r.percentage !== null && r.result === "pass")
        .map((r) => ({ studentId: r.student, name: r.name, className, percentage: r.percentage!, gpa: r.gpa, grade: r.grade })))
        .sort((a, b) => b.percentage - a.percentage).slice(0, 5);
      return { performance, top };
    },
    enabled: !!exam && classLevels.length > 0,
    staleTime: 60_000,
  });
}
