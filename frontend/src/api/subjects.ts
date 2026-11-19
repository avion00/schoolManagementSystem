/**
 * Subjects: API access, mapping to page view models, query hooks.
 */
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { del, get, getAll, patch, post, type Schemas } from "./http";
import type {
  SubjectCategory, SubjectData, SubjectDetailView, SubjectStatus, SubjectType, SyllabusUnit,
} from "./types/subjects";

type ApiSubject = Schemas["Subject"];
type ApiClassSubject = Schemas["ClassSubject"];
type ApiAssignment = Schemas["TeacherAssignment"];

export const TYPE_LABEL: Record<string, SubjectType> = {
  theory: "Theory", practical: "Practical", theory_practical: "Theory + Practical",
};
export const TYPE_VALUE: Record<string, string> = Object.fromEntries(Object.entries(TYPE_LABEL).map(([k, v]) => [v, k]));
export const CATEGORY_LABEL: Record<string, SubjectCategory> = {
  compulsory: "Compulsory", optional: "Optional", language: "Language", science: "Science",
  commerce: "Commerce", technical: "Technical", extra_curricular: "Extra-curricular",
};
export const CATEGORY_VALUE: Record<string, string> = Object.fromEntries(Object.entries(CATEGORY_LABEL).map(([k, v]) => [v, k]));

export function minutesLabel(m: number | null | undefined): string {
  if (!m) return "";
  const h = Math.floor(m / 60);
  const r = m % 60;
  return [h ? `${h} hr${h > 1 ? "s" : ""}` : "", r ? `${r} min` : ""].filter(Boolean).join(" ");
}

export function mapSubject(
  s: ApiSubject, curriculum: ApiClassSubject[], assignments: ApiAssignment[], year: string,
): SubjectData {
  const mine = curriculum.filter((c) => c.subject === s.id);
  const teachers = assignments.filter((a) => a.subject === s.id);
  const first = teachers[0];
  const others = [...new Set(teachers.slice(1).map((t) => t.teacher_name))].filter((n) => n !== first?.teacher_name);
  return {
    id: s.id,
    subjectCode: s.code,
    subjectName: s.name,
    type: TYPE_LABEL[s.type ?? "theory"] ?? "Theory",
    category: CATEGORY_LABEL[s.category ?? "compulsory"] ?? "Compulsory",
    status: (s.status ?? "active") as SubjectStatus,
    description: s.description ?? "",
    assignedClasses: [...new Set(mine.map((c) => c.class_level_name))],
    sections: [...new Set(teachers.map((t) => t.section_name).filter((x): x is string => !!x))],
    academicYear: year,
    primaryTeacher: first ? { id: first.teacher, name: first.teacher_name, employeeId: "" } : null,
    assistantTeacher: others.join(", "),
    department: s.department ?? "",
    weeklyPeriods: mine.reduce((n, c) => n + (c.weekly_periods ?? 0), 0),
    room: "",
    fullMarks: Number(s.full_marks ?? 100),
    passMarks: Number(s.pass_marks ?? 40),
    theoryMarks: Number(s.theory_marks ?? 0),
    practicalMarks: Number(s.practical_marks ?? 0),
    internalMarks: Number(s.internal_marks ?? 0),
    creditHours: Number(s.credit_hours ?? 0),
    examDuration: minutesLabel(s.exam_duration_minutes),
    gpaEnabled: !!s.gpa_enabled,
    practicalRequired: !!s.practical_required,
    projectRequired: !!s.project_required,
    vivaRequired: !!s.viva_required,
    assignmentRequired: !!s.assignment_required,
  };
}

async function context() {
  const years = await getAll<Schemas["AcademicYear"]>("/academics/academic-years/");
  const year = years.find((y) => y.is_current) ?? years[0];
  const [curriculum, assignments] = await Promise.all([
    year ? getAll<ApiClassSubject>("/academics/class-subjects/", { academic_year: year.id }) : Promise.resolve([]),
    year ? getAll<ApiAssignment>("/teacher-assignments/", { academic_year: year.id }).catch(() => []) : Promise.resolve([]),
  ]);
  return { year, curriculum, assignments };
}

export function useSubjectList() {
  return useQuery({
    queryKey: ["subjects"],
    queryFn: async () => {
      const [subjects, ctx] = await Promise.all([getAll<ApiSubject>("/academics/subjects/"), context()]);
      return subjects.map((s) => mapSubject(s, ctx.curriculum, ctx.assignments, ctx.year?.name ?? ""));
    },
    staleTime: 60_000,
  });
}

interface Overview {
  subject: ApiSubject;
  classes: (ApiClassSubject & { students: number })[];
  teachers: { teacher: string; name: string; employee_id: string; department: string; email: string; phone: string; classes: string[] }[];
  syllabus: { units: Schemas["SyllabusUnit"][]; completion_pct: number | null };
  performance: { results: number; average_pct: number | null; pass_rate_pct: number | null; highest_pct: number | null; lowest_pct: number | null };
}

const SYLLABUS_STATUS: Record<string, SyllabusUnit["status"]> = {
  completed: "Completed", in_progress: "In Progress", not_started: "Not Started",
};

export async function fetchSubjectDetail(id: string): Promise<SubjectDetailView & { subject: SubjectData; completionPct: number | null }> {
  const [ov, ctx] = await Promise.all([get<Overview>(`/academics/subjects/${id}/overview/`), context()]);
  const p = ov.performance;
  return {
    subject: mapSubject(ov.subject, ctx.curriculum, ctx.assignments, ctx.year?.name ?? ""),
    completionPct: ov.syllabus.completion_pct,
    classMappings: ov.classes.map((c) => {
      const t = ctx.assignments.filter((a) => a.subject === id && a.class_level === c.class_level);
      return {
        id: c.id, className: c.class_level_name, section: [...new Set(t.map((x) => x.section_name ?? "All"))].join(", ") || "All",
        teacher: [...new Set(t.map((x) => x.teacher_name))].join(", ") || "—", room: "",
        weeklyPeriods: c.weekly_periods ?? 0, students: c.students, status: c.is_active ? "active" as const : "inactive" as const,
      };
    }),
    teachers: ov.teachers.map((t) => ({
      id: t.teacher, name: t.name, employeeId: t.employee_id, department: t.department, classes: t.classes.join(", "),
      weeklyLoad: 0, email: t.email, contact: t.phone,
    })),
    syllabusUnits: ov.syllabus.units.map((u) => ({
      id: u.id, unitNo: u.unit_no, title: u.title, topics: u.topics ?? [],
      estimatedPeriods: u.estimated_periods ?? 0, status: SYLLABUS_STATUS[u.status ?? "not_started"] ?? "Not Started",
    })),
    performance: p.results > 0 ? {
      averageScore: p.average_pct ?? 0, passRate: p.pass_rate_pct ?? 0, highestMarks: p.highest_pct ?? 0,
      lowestMarks: p.lowest_pct ?? 0, needsImprovement: 0, classWise: [], topStudents: [],
    } : null,
    documents: [],
    activities: [],
  };
}

export function useSubjectDetail(id: string | undefined) {
  return useQuery({ queryKey: ["subjects", id], queryFn: () => fetchSubjectDetail(id!), enabled: !!id });
}

export function useSubjectRecord(id: string | undefined) {
  return useQuery({
    queryKey: ["subjects", id, "record"],
    queryFn: async () => {
      const [subject, ctx] = await Promise.all([get<ApiSubject>(`/academics/subjects/${id}/`), context()]);
      return { subject, mappings: ctx.curriculum.filter((c) => c.subject === id), year: ctx.year };
    },
    enabled: !!id,
  });
}

export interface MappingDraft { id?: string; classLevel: string; weeklyPeriods: string }

export async function saveSubject(id: string | undefined, payload: Record<string, unknown>, mappings: MappingDraft[]) {
  const subject = id ? await patch<ApiSubject>(`/academics/subjects/${id}/`, payload)
    : await post<ApiSubject>("/academics/subjects/", payload);
  const { year, curriculum } = await context();
  if (year) {
    const current = curriculum.filter((c) => c.subject === subject.id);
    const keep = new Set(mappings.filter((m) => m.id).map((m) => m.id));
    for (const m of mappings.filter((x) => x.classLevel)) {
      const body = { academic_year: year.id, class_level: m.classLevel, subject: subject.id,
                     weekly_periods: Number(m.weeklyPeriods) || 0 };
      if (m.id) await patch(`/academics/class-subjects/${m.id}/`, body);
      else await post("/academics/class-subjects/", body);
    }
    for (const c of current) if (!keep.has(c.id)) await del(`/academics/class-subjects/${c.id}/`);
  }
  return subject;
}

export function useSaveSubject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (v: { id?: string; payload: Record<string, unknown>; mappings: MappingDraft[] }) =>
      saveSubject(v.id, v.payload, v.mappings),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["subjects"] });
      qc.invalidateQueries({ queryKey: ["classes"] });
      qc.invalidateQueries({ queryKey: ["academics"] });
    },
  });
}
