/**
 * Classes (class levels + sections + curriculum): API access, mapping, hooks.
 */
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { del, get, getAll, label, patch, post, type Schemas } from "./http";
import { toGender, toRoll } from "./students";
import type {
  ClassData, ClassDetailView, ClassExam, ClassMedium, ClassSection, ClassShift, ClassStatus, ClassSubject,
  DetailStudent, DetailTeacher, PerformanceSummary, TimetableRow,
} from "./types/classes";

type ApiClass = Schemas["ClassLevel"];
type ApiSection = Schemas["Section"];
type ApiClassSubject = Schemas["ClassSubject"];
type ApiAssignment = Schemas["TeacherAssignment"];

const SUBJECT_COLORS = [
  "bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300",
  "bg-violet-100 text-violet-700 dark:bg-violet-950/60 dark:text-violet-300",
  "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300",
  "bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300",
  "bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300",
  "bg-orange-100 text-orange-700 dark:bg-orange-950/60 dark:text-orange-300",
  "bg-pink-100 text-pink-700 dark:bg-pink-950/60 dark:text-pink-300",
];

export function colorFor(subject: string): string {
  let h = 0;
  for (const ch of subject) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return SUBJECT_COLORS[h % SUBJECT_COLORS.length];
}

export function mapSection(s: ApiSection): ClassSection {
  return {
    id: s.id, sectionName: s.name, sectionCode: s.code ?? "", classTeacher: s.class_teacher_name ?? "",
    room: s.room ?? "", capacity: s.capacity ?? 0, totalStudents: s.students_count ?? 0,
    maleStudents: s.male_count ?? 0, femaleStudents: s.female_count ?? 0, attendanceAverage: null,
    status: s.is_active ? "active" : "inactive",
  };
}

export function mapClassSubject(cs: ApiClassSubject, assignments: ApiAssignment[]): ClassSubject {
  const teachers = assignments.filter((a) => a.subject === cs.subject && a.class_level === cs.class_level);
  return {
    id: cs.id, subjectId: cs.subject, subjectCode: cs.subject_code, subjectName: cs.subject_name,
    teacher: [...new Set(teachers.map((t) => t.teacher_name))].join(", "),
    weeklyPeriods: cs.weekly_periods ?? 0, fullMarks: Number(cs.effective_full_marks),
    passMarks: Number(cs.effective_pass_marks), type: cs.is_optional ? "Optional" : "Compulsory",
    status: cs.is_active ? "active" : "inactive",
  };
}

export function mapClass(
  c: ApiClass, sections: ApiSection[], subjects: ApiClassSubject[], assignments: ApiAssignment[], year: string,
): ClassData {
  const mine = sections.filter((s) => s.class_level === c.id).map(mapSection);
  const ct = assignments.find((a) => a.class_level === c.id && a.is_class_teacher);
  return {
    id: c.id,
    classId: c.code || c.name,
    className: c.name,
    gradeLevel: c.order ?? 0,
    academicYear: year,
    medium: label(c.medium) as ClassMedium,
    shift: label(c.shift) as ClassShift,
    status: (c.status ?? "active") as ClassStatus,
    building: c.building ?? "",
    mainRoom: c.main_room ?? "",
    description: c.description ?? "",
    mainClassTeacher: ct ? { id: ct.teacher, name: ct.teacher_name, employeeId: "" } : null,
    totalStudents: c.students_count ?? 0,
    totalCapacity: c.total_capacity ?? null,
    sections: mine,
    subjects: subjects.filter((s) => s.class_level === c.id).map((s) => mapClassSubject(s, assignments)),
  };
}

async function currentYear() {
  const years = await getAll<Schemas["AcademicYear"]>("/academics/academic-years/");
  return years.find((y) => y.is_current) ?? years[0];
}

export function useClasses() {
  return useQuery({
    queryKey: ["classes"],
    queryFn: async () => {
      const year = await currentYear();
      const [classes, sections, subjects, assignments] = await Promise.all([
        getAll<ApiClass>("/academics/class-levels/"),
        getAll<ApiSection>("/academics/sections/"),
        year ? getAll<ApiClassSubject>("/academics/class-subjects/", { academic_year: year.id }) : Promise.resolve([]),
        year ? getAll<ApiAssignment>("/teacher-assignments/", { academic_year: year.id }).catch(() => []) : Promise.resolve([]),
      ]);
      return classes.map((c) => mapClass(c, sections, subjects, assignments, year?.name ?? ""));
    },
    staleTime: 60_000,
  });
}

// ── details ──────────────────────────────────────────────────────────────

interface ResultsRow {
  student: string; name: string; section_name: string | null; percentage: number | null; result: string;
  subjects: { subject: string; marks_obtained: number | null; full_marks: number }[];
}

export function performanceFrom(rows: ResultsRow[]): PerformanceSummary | null {
  const scored = rows.filter((r) => r.percentage !== null && (r.result === "pass" || r.result === "fail"));
  if (scored.length === 0) return null;
  const pcts = scored.map((r) => r.percentage!);
  const subjects = new Map<string, number[]>();
  for (const r of scored) {
    for (const s of r.subjects) {
      if (s.marks_obtained === null) continue;
      subjects.set(s.subject, [...(subjects.get(s.subject) ?? []), (s.marks_obtained / s.full_marks) * 100]);
    }
  }
  const avg = (xs: number[]) => Math.round((xs.reduce((a, b) => a + b, 0) / xs.length) * 10) / 10;
  return {
    classAverage: avg(pcts),
    highestScore: Math.max(...pcts),
    lowestScore: Math.min(...pcts),
    passPct: Math.round((scored.filter((r) => r.result === "pass").length / scored.length) * 1000) / 10,
    subjectWise: [...subjects.entries()].map(([subject, xs]) => ({ subject, average: avg(xs) })),
    top5Students: [...scored].sort((a, b) => b.percentage! - a.percentage!).slice(0, 5)
      .map((r) => ({ name: r.name, score: r.percentage!, section: r.section_name ?? "" })),
    needsImprovement: scored.filter((r) => r.percentage! < 40).length,
  };
}

interface GridRow { start_time: string; end_time: string; subject: string; teacher: string | null; is_break: boolean }

export function timetableFrom(days: Record<string, GridRow[]>): TimetableRow[] {
  const slots = new Map<string, TimetableRow>();
  const week = ["monday", "tuesday", "wednesday", "thursday", "friday"] as const;
  for (const day of week) {
    for (const r of days[day] ?? []) {
      const time = `${r.start_time.slice(0, 5)} – ${r.end_time.slice(0, 5)}`;
      const row = slots.get(time) ?? { time, isBreak: r.is_break, monday: null, tuesday: null, wednesday: null, thursday: null, friday: null };
      row[day] = { subject: r.subject, teacher: r.teacher ?? "", color: colorFor(r.subject) };
      slots.set(time, row);
    }
  }
  return [...slots.values()].sort((a, b) => a.time.localeCompare(b.time));
}

export async function fetchClassDetail(id: string, canSeeFees: boolean): Promise<ClassDetailView & { cls: ClassData }> {
  const year = await currentYear();
  const ov = await get<{
    class_level: ApiClass; sections: ApiSection[]; subjects: (ApiClassSubject & { teachers: { teacher: string; name: string; section_name: string | null }[] })[];
    totals: { students: number; attendance_rate_30d: number | null };
  }>(`/academics/class-levels/${id}/overview/`);
  const today = new Date();
  const from = new Date(today.getTime() - 29 * 86400000).toISOString().slice(0, 10);

  const [students, assignments, feeRows, papers, classReport] = await Promise.all([
    getAll<Schemas["StudentList"]>("/students/", { class_level: id, status: "active" }),
    year ? getAll<ApiAssignment>("/teacher-assignments/", { class_level: id, academic_year: year.id }).catch(() => []) : Promise.resolve([]),
    canSeeFees ? getAll<{ student: string; status: string; billed: number; paid: number; due: number; discount: number; section_name: string | null }>(
      "/fees/student-fees/", { class_level: id }).catch(() => []) : Promise.resolve([]),
    getAll<Schemas["ExamSubject"]>("/exams/exam-subjects/", { class_level: id }).catch(() => []),
    get<{ rows: { section_name: string | null; class_level: string; rate: number | null }[] }>(
      "/attendance/class-report/", { date_from: from }).catch(() => ({ rows: [] })),
  ]);

  const firstSection = ov.sections[0];
  const grid = firstSection
    ? await get<{ days: Record<string, GridRow[]> }>("/timetable/entries/grid/", { section: firstSection.id }).catch(() => ({ days: {} }))
    : { days: {} };

  // Latest exam with papers for this class → performance.
  const examIds = [...new Set(papers.map((p) => p.exam))];
  let performance: PerformanceSummary | null = null;
  for (const examId of examIds.slice(0, 3)) {
    const res = await get<{ rows: ResultsRow[] }>(`/exams/exams/${examId}/results/`, { class_level: id }).catch(() => null);
    performance = res ? performanceFrom(res.rows) : null;
    if (performance) break;
  }

  const fees = new Map(feeRows.map((f) => [f.student, f]));
  const detailStudents: DetailStudent[] = students.map((s) => {
    const f = fees.get(s.id);
    return {
      id: s.id, admissionNo: s.admission_number, registrationNo: s.registration_number ?? "", name: s.full_name,
      section: s.section_name ?? "", roll: toRoll(s.roll_number), gender: toGender(s.gender), attendancePct: null,
      feeStatus: !f ? "—" : f.status === "overdue" ? "Overdue" : f.due > 0 ? "Due" : "Paid",
      resultStatus: "N/A",
    };
  });

  const teachers: DetailTeacher[] = assignments.map((a) => ({
    id: a.teacher, name: a.teacher_name, employeeId: "", subject: a.subject_name ?? "—",
    weeklyPeriods: 0, section: a.section_name ?? "All",
    role: a.is_class_teacher ? "Class Teacher" : "Subject Teacher", contact: "",
  }));

  const now = new Date().toISOString().slice(0, 10);
  const exams: ClassExam[] = papers.map((p) => ({
    id: p.id, name: p.exam_name, subject: p.subject_name, date: p.exam_date ?? "",
    time: p.start_time ? `${p.start_time.slice(0, 5)}${p.end_time ? ` – ${p.end_time.slice(0, 5)}` : ""}` : "",
    fullMarks: Number(p.full_marks), status: p.exam_date && p.exam_date < now ? "Completed" : "Upcoming",
  }));

  const sectionRates = classReport.rows.filter((r) => r.class_level === id);
  const sum = (xs: number[]) => xs.reduce((a, b) => a + b, 0);
  const sectionMap = new Map<string, { collected: number; due: number }>();
  for (const f of feeRows) {
    const key = f.section_name ?? "—";
    const cur = sectionMap.get(key) ?? { collected: 0, due: 0 };
    sectionMap.set(key, { collected: cur.collected + f.paid, due: cur.due + f.due });
  }

  const sections = ov.sections.map((s) => ({
    ...mapSection(s),
    attendanceAverage: sectionRates.find((r) => r.section_name === s.name)?.rate ?? null,
  }));
  const cls = mapClass(ov.class_level, ov.sections, ov.subjects, assignments, year?.name ?? "");
  cls.sections = sections;

  return {
    cls,
    students: detailStudents,
    teachers,
    timetable: timetableFrom(grid.days),
    attendance: {
      presentPct: ov.totals.attendance_rate_30d, absentPct: 0, latePct: 0, halfDayPct: 0, totalDays: 30,
      last7Days: [],
      sectionWise: sections.map((s) => ({ section: s.sectionName, pct: s.attendanceAverage ?? 0 })),
    },
    performance,
    fees: canSeeFees ? {
      totalExpected: sum(feeRows.map((f) => f.billed)), collected: sum(feeRows.map((f) => f.paid)),
      due: sum(feeRows.map((f) => f.due)),
      overdue: sum(feeRows.filter((f) => f.status === "overdue").map((f) => f.due)),
      scholarship: sum(feeRows.map((f) => f.discount)),
      sectionWise: [...sectionMap.entries()].map(([section, v]) => ({ section, ...v })),
    } : null,
    exams,
    documents: [],
    activities: [],
  };
}

export function useClassDetail(id: string | undefined, canSeeFees: boolean) {
  return useQuery({
    queryKey: ["classes", id, canSeeFees],
    queryFn: () => fetchClassDetail(id!, canSeeFees),
    enabled: !!id,
  });
}

// ── writes ───────────────────────────────────────────────────────────────

export interface SectionDraft { id?: string; name: string; code: string; room: string; capacity: string }
export interface SubjectDraft { id?: string; subject: string; weeklyPeriods: string; isOptional: boolean }

export async function saveClass(
  id: string | undefined, payload: Record<string, unknown>, sections: SectionDraft[], subjects: SubjectDraft[],
): Promise<ApiClass> {
  const cls = id ? await patch<ApiClass>(`/academics/class-levels/${id}/`, payload)
    : await post<ApiClass>("/academics/class-levels/", payload);

  const existing = await getAll<ApiSection>("/academics/sections/", { class_level: cls.id });
  const keep = new Set(sections.filter((s) => s.id).map((s) => s.id));
  for (const s of sections.filter((x) => x.name.trim())) {
    const body = { class_level: cls.id, name: s.name, code: s.code, room: s.room,
                   capacity: s.capacity.trim() ? Number(s.capacity) : null };
    if (s.id) await patch(`/academics/sections/${s.id}/`, body);
    else await post("/academics/sections/", body);
  }
  for (const s of existing) if (!keep.has(s.id)) await del(`/academics/sections/${s.id}/`);

  const year = await currentYear();
  if (year) {
    const current = await getAll<ApiClassSubject>("/academics/class-subjects/", { class_level: cls.id, academic_year: year.id });
    const keepSubjects = new Set(subjects.filter((s) => s.id).map((s) => s.id));
    for (const s of subjects.filter((x) => x.subject)) {
      const body = { academic_year: year.id, class_level: cls.id, subject: s.subject,
                     weekly_periods: Number(s.weeklyPeriods) || 0, is_optional: s.isOptional };
      if (s.id) await patch(`/academics/class-subjects/${s.id}/`, body);
      else await post("/academics/class-subjects/", body);
    }
    for (const s of current) if (!keepSubjects.has(s.id)) await del(`/academics/class-subjects/${s.id}/`);
  }
  return cls;
}

export function useSaveClass() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (v: { id?: string; payload: Record<string, unknown>; sections: SectionDraft[]; subjects: SubjectDraft[] }) =>
      saveClass(v.id, v.payload, v.sections, v.subjects),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["classes"] });
      qc.invalidateQueries({ queryKey: ["academics"] });
    },
  });
}

export function useClassRecord(id: string | undefined) {
  return useQuery({
    queryKey: ["classes", id, "record"],
    queryFn: async () => {
      const year = await currentYear();
      const [cls, sections, subjects] = await Promise.all([
        get<ApiClass>(`/academics/class-levels/${id}/`),
        getAll<ApiSection>("/academics/sections/", { class_level: id }),
        year ? getAll<ApiClassSubject>("/academics/class-subjects/", { class_level: id, academic_year: year.id }) : Promise.resolve([]),
      ]);
      return { cls, sections, subjects };
    },
    enabled: !!id,
  });
}

export function useSchools() {
  return useQuery({
    queryKey: ["schools"],
    queryFn: () => get<Schemas["SchoolProfile"]>("/settings/school/"),
    staleTime: 10 * 60_000,
  });
}
