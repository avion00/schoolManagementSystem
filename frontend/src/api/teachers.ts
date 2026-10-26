/**
 * Teachers: API access, mapping to page view models, query hooks.
 */
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { del, get, getAll, label, patch, post, type Schemas } from "./http";
import { toGender } from "./students";
import type {
  AttendanceMonth, EmploymentType, ScheduleEntry, Teacher, TeacherDetailView, TeacherStatus,
} from "./types/teachers";

type ApiTeacher = Schemas["Teacher"];
type ApiAssignment = Schemas["TeacherAssignment"];
type ApiSalary = Schemas["SalaryStructure"];
interface ApiPayslip {
  id: string; teacher: string; month: string; basic: string; allowances: string; bonus: string;
  attendance_deduction: string; provident_fund: string; tax: string; other_deduction: string; net: string;
}

const EMPLOYMENT: Record<string, EmploymentType> = {
  full_time: "Full-time", part_time: "Part-time", contract: "Contract", substitute: "Substitute",
};
export const EMPLOYMENT_VALUE: Record<string, string> = {
  "Full-time": "full_time", "Part-time": "part_time", Contract: "contract", Substitute: "substitute",
};
const STATUS: Record<string, TeacherStatus> = {
  active: "active", on_leave: "on leave", inactive: "inactive", resigned: "resigned", terminated: "terminated",
};
export const STATUS_VALUE: Record<string, string> = {
  active: "active", "on leave": "on_leave", inactive: "inactive", resigned: "resigned", terminated: "terminated",
};

export function splitList(text: string | undefined | null): string[] {
  return (text ?? "").split(/[\n,]/).map((x) => x.trim()).filter(Boolean);
}

export function mapTeacher(t: ApiTeacher, salary?: ApiSalary): Teacher {
  return {
    id: t.id,
    employeeId: t.employee_id,
    staffCode: t.employee_id,
    name: t.full_name,
    gender: toGender(t.gender),
    department: t.department ?? "",
    subject: t.primary_subject_name ?? t.subjects[0] ?? "",
    secondarySubjects: t.subjects.filter((s) => s !== t.primary_subject_name),
    assignedClasses: t.assigned_classes,
    phone: t.phone ?? "",
    email: t.email ?? "",
    dateOfBirth: t.date_of_birth ?? "",
    joiningDate: t.joining_date ?? "",
    qualification: t.qualification ?? "",
    experienceYears: t.experience_years ?? 0,
    employmentType: EMPLOYMENT[t.employment_type ?? ""] ?? "",
    address: t.address ?? "",
    status: STATUS[t.status ?? "active"] ?? "inactive",
    designation: t.designation ?? "",
    salary: salary ? Number(salary.basic) : null,
  };
}

interface Overview {
  teacher: ApiTeacher;
  assignments: ApiAssignment[];
  attendance: Record<string, number | null>;
  attendance_this_month: Record<string, number | null>;
  attendance_by_month: { month: number; status: string; count: number }[];
}

interface GridRow {
  period_no: number; start_time: string; end_time: string; subject: string; section: string; room: string | null;
  is_break: boolean;
}

/** The teacher's payslips in the six most recent payroll runs. */
async function recentPayslips(teacherId: string) {
  try {
    const runs = (await getAll<Schemas["PayrollRun"]>("/finance/payroll-runs/")).slice(0, 6);
    const rows = await Promise.all(runs.map(async (run) => {
      const d = await get<{ payslips: ApiPayslip[] }>(`/finance/payroll-runs/${run.id}/payslips/`);
      return { run, slip: d.payslips.find((p) => p.teacher === teacherId) };
    }));
    return rows.filter((x) => x.slip);
  } catch {
    return [];
  }
}

export async function fetchTeacherDetail(
  id: string, canSeePayroll: boolean,
): Promise<TeacherDetailView & { teacher: Teacher; record: ApiTeacher; assignments: ApiAssignment[] }> {
  const ov = await get<Overview>(`/teachers/${id}/overview/`);
  const t = ov.teacher;
  const today = new Date().toLocaleDateString("en-US", { weekday: "long" }).toLowerCase();
  const [grid, salary, payslips, duties] = await Promise.all([
    get<{ days: Record<string, GridRow[]> }>("/timetable/entries/grid/", { teacher: id })
      .catch((): { days: Record<string, GridRow[]> } => ({ days: {} })),
    canSeePayroll
      ? getAll<ApiSalary>("/finance/salary-structures/", { teacher: id }).then((r) => r[0]).catch(() => undefined)
      : Promise.resolve(undefined),
    canSeePayroll ? recentPayslips(id) : Promise.resolve([]),
    getAll<Schemas["ExamSubject"]>("/exams/exam-subjects/", { invigilator: id }).catch(() => []),
  ]);

  const weekly = Object.values(grid.days).flat();
  const todaySchedule: ScheduleEntry[] = (grid.days[today] ?? []).map((r) => ({
    period: r.period_no, time: `${r.start_time.slice(0, 5)} – ${r.end_time.slice(0, 5)}`,
    subject: r.subject, className: r.section, room: r.room ?? "—", isBreak: r.is_break,
  }));

  const monthly = new Map<number, AttendanceMonth>();
  for (const row of ov.attendance_by_month) {
    const m = monthly.get(row.month) ?? {
      month: new Date(2000, row.month - 1, 1).toLocaleDateString("en-US", { month: "short" }),
      present: 0, absent: 0, total: 0,
    };
    if (["present", "late", "half_day"].includes(row.status)) m.present += row.count;
    if (row.status === "absent") m.absent += row.count;
    if (row.status !== "holiday") m.total += row.count;
    monthly.set(row.month, m);
  }
  const a = ov.attendance;
  const classTeacher = ov.assignments.find((x) => x.is_class_teacher);
  const latest = payslips[0];

  return {
    teacher: mapTeacher(t, salary),
    record: t,
    assignments: ov.assignments,
    personalExtra: {
      nationality: t.nationality ?? "", bloodGroup: t.blood_group ?? "", maritalStatus: label(t.marital_status),
      spouseName: t.spouse_name ?? "", emergencyContact: t.emergency_contact ?? "",
      emergencyRelation: t.emergency_relation ?? "", permanentAddress: t.permanent_address ?? "",
      religion: t.religion ?? "",
    },
    employmentExtra: {
      secondarySubjects: t.subjects.filter((s) => s !== t.primary_subject_name),
      classTeacherOf: classTeacher
        ? `${classTeacher.class_level_name}${classTeacher.section_name ? ` - ${classTeacher.section_name}` : ""}` : "",
      weeklyPeriods: weekly.filter((r) => !r.is_break).length,
      examDuties: duties.map((d) => `${d.exam_name} · ${d.subject_name} (${d.class_level_name})`),
      clubs: [],
      skills: splitList(t.skills),
      previousSchools: splitList(t.previous_schools),
      certifications: splitList(t.certifications),
    },
    attendanceSummary: {
      presentDays: (a.present ?? 0) + (a.late ?? 0) + (a.half_day ?? 0),
      absentDays: a.absent ?? 0, leaveDays: a.leave ?? 0,
      totalWorkingDays: a.total ?? 0, percentage: a.percentage ?? 0,
    },
    attendanceMonthly: [...monthly.entries()].sort(([x], [y]) => x - y).map(([, v]) => v),
    performance: null,
    payroll: salary ? {
      basicSalary: Number(salary.basic), houseAllowance: Number(salary.house_allowance ?? 0),
      transportAllowance: Number(salary.transport_allowance ?? 0), otherAllowance: Number(salary.other_allowance ?? 0),
      providentFundDeduction: latest ? Number(latest.slip!.provident_fund) : 0,
      taxDeduction: latest ? Number(latest.slip!.tax) : 0,
      otherDeduction: Number(salary.other_deduction ?? 0),
      netSalary: latest ? Number(latest.slip!.net) : 0,
      lastPaidDate: latest?.run.paid_at?.slice(0, 10) ?? "",
      paymentStatus: latest ? label(latest.run.status) : "",
      paymentMethod: label(salary.payment_method),
      bankName: salary.bank_name ?? "", accountNo: salary.account_number ?? "",
    } : null,
    monthlyPayHistory: payslips.map((p) => ({
      month: p.run.month, amount: Number(p.slip!.net), status: p.run.status === "paid" ? "Paid" as const : "Pending" as const,
    })),
    documents: [],
    activities: [],
    todaySchedule,
  };
}

export const teacherKeys = { all: ["teachers"] as const };

export function useTeachers(canSeePayroll: boolean) {
  return useQuery({
    queryKey: [...teacherKeys.all, canSeePayroll],
    queryFn: async () => {
      const [teachers, salaries] = await Promise.all([
        getAll<ApiTeacher>("/teachers/"),
        canSeePayroll ? getAll<ApiSalary>("/finance/salary-structures/").catch(() => []) : Promise.resolve([]),
      ]);
      const byTeacher = new Map(salaries.map((s) => [s.teacher, s]));
      return teachers.map((t) => mapTeacher(t, byTeacher.get(t.id)));
    },
    staleTime: 60_000,
  });
}

export function useTeacherDetail(id: string | undefined, canSeePayroll: boolean) {
  return useQuery({
    queryKey: ["teachers", id, canSeePayroll],
    queryFn: () => fetchTeacherDetail(id!, canSeePayroll),
    enabled: !!id,
  });
}

export function useSubjects() {
  return useQuery({
    queryKey: ["academics", "subjects"],
    queryFn: () => getAll<Schemas["Subject"]>("/academics/subjects/"),
    staleTime: 5 * 60_000,
  });
}

export interface TeacherSave {
  id?: string;
  payload: Record<string, unknown>;
  salary?: Record<string, unknown> | null; // null = leave unchanged
}

export async function saveTeacher({ id, payload, salary }: TeacherSave): Promise<ApiTeacher> {
  const t = id ? await patch<ApiTeacher>(`/teachers/${id}/`, payload) : await post<ApiTeacher>("/teachers/", payload);
  if (salary) {
    const existing = await getAll<ApiSalary>("/finance/salary-structures/", { teacher: t.id });
    if (existing[0]) await patch(`/finance/salary-structures/${existing[0].id}/`, salary);
    else await post("/finance/salary-structures/", { ...salary, teacher: t.id });
  }
  return t;
}

export function useSaveTeacher() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: saveTeacher,
    onSuccess: () => qc.invalidateQueries({ queryKey: teacherKeys.all }),
  });
}

export function useAssignmentActions(teacherId: string) {
  const qc = useQueryClient();
  const refresh = () => {
    qc.invalidateQueries({ queryKey: ["teachers"] });
    qc.invalidateQueries({ queryKey: ["teacher-assignments", teacherId] });
  };
  return {
    add: useMutation({
      mutationFn: (body: Record<string, unknown>) => post<ApiAssignment>("/teacher-assignments/", { ...body, teacher: teacherId }),
      onSuccess: refresh,
    }),
    remove: useMutation({ mutationFn: (id: string) => del(`/teacher-assignments/${id}/`), onSuccess: refresh }),
  };
}

export function useTeacherAssignments(teacherId: string | undefined) {
  return useQuery({
    queryKey: ["teacher-assignments", teacherId],
    queryFn: () => getAll<ApiAssignment>("/teacher-assignments/", { teacher: teacherId }),
    enabled: !!teacherId,
  });
}

export function useTeacherRecord(id: string | undefined) {
  return useQuery({
    queryKey: ["teachers", id, "record"],
    queryFn: async () => {
      const t = await get<ApiTeacher>(`/teachers/${id}/`);
      const salary = await getAll<ApiSalary>("/finance/salary-structures/", { teacher: id }).then((r) => r[0]).catch(() => undefined);
      return { teacher: t, salary };
    },
    enabled: !!id,
  });
}
