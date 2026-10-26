/**
 * Parents / guardians: API access, mapping to page view models, query hooks.
 */
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { del, get, getAll, label, patch, post, type Schemas } from "./http";
import { toGender, toRoll } from "./students";
import type {
  ChildAcademic, FeeRecord, LinkedChild, Parent, ParentDetailView, ParentGender, ParentRelation, ParentStatus,
} from "./types/parents";

type ApiGuardian = Schemas["Guardian"];

export function mapParent(g: ApiGuardian): Parent {
  return {
    id: g.id,
    parentId: g.guardian_code,
    guardianCode: g.guardian_code,
    name: g.full_name,
    gender: toGender(g.gender) as ParentGender,
    relation: label(g.relation) as ParentRelation,
    occupation: g.occupation ?? "",
    phone: g.phone ?? "",
    alternatePhone: g.alternate_phone ?? "",
    email: g.email ?? "",
    address: g.address ?? "",
    status: (g.status ?? "active") as ParentStatus,
    linkedChildren: g.children.map((c): LinkedChild => ({
      id: c.link_id,
      studentId: c.student,
      name: c.name,
      admissionNo: c.admission_number,
      registrationNo: c.registration_number,
      className: c.class_level_name,
      section: c.section_name ?? "",
      roll: toRoll(c.roll_number),
      gender: toGender(c.gender),
      status: c.status,
    })),
  };
}

interface Overview {
  guardian: ApiGuardian;
  children: {
    student: string; name: string; class_level_name: string; section_name: string | null; relation: string;
    attendance_pct: number | null; outstanding_fees: number | null; latest_result_pct: number | null;
    published_exams: number;
  }[];
  total_outstanding_fees: number | null;
}

export async function fetchParentDetail(id: string, canSeeFees: boolean): Promise<ParentDetailView & { parent: Parent; notes: string }> {
  const ov = await get<Overview>(`/guardians/${id}/overview/`);
  const g = ov.guardian;
  const invoices = canSeeFees
    ? (await Promise.all(ov.children.map((c) =>
        getAll<Schemas["Invoice"]>("/fees/invoices/", { student: c.student }).catch(() => [])))).flat()
    : [];
  const childrenAcademic: ChildAcademic[] = ov.children.map((c) => ({
    studentId: c.student, name: c.name, className: c.class_level_name, section: c.section_name ?? "",
    attendancePct: c.attendance_pct, classRank: null, latestExamPct: c.latest_result_pct,
    homeworkStatus: "", behaviorNote: "", dueFees: c.outstanding_fees,
    upcomingExams: 0, resultPublished: c.published_exams,
  }));
  const feeRecords: FeeRecord[] = invoices.map((inv) => ({
    id: inv.number,
    child: inv.student_name,
    feeType: inv.items.map((i) => i.description).join(", ") || inv.billing_period || "Invoice",
    amount: Number(inv.net_amount),
    status: inv.status === "paid" ? "Paid" : inv.status === "overdue" ? "Overdue" : "Due",
    email: g.email ?? "",
    date: inv.issue_date,
  }));
  const paid = invoices.reduce((s, i) => s + Number(i.paid_amount), 0);
  const due = invoices.filter((i) => i.status !== "cancelled").reduce((s, i) => s + Number(i.balance), 0);
  const nextDue = invoices.filter((i) => Number(i.balance) > 0 && i.due_date).map((i) => i.due_date!).sort()[0] ?? "";
  return {
    parent: mapParent(g),
    notes: g.notes ?? "",
    nationality: g.nationality ?? "",
    religion: g.religion ?? "",
    emergencyContact: g.emergency_contact ?? "",
    emergencyRelation: g.emergency_relation ?? "",
    permanentAddress: g.permanent_address ?? "",
    summaryCards: {
      dueFees: ov.total_outstanding_fees,
      upcomingExams: 0,
      resultPublished: ov.children.reduce((s, c) => s + c.published_exams, 0),
      totalExpenses: invoices.filter((i) => i.status !== "cancelled").reduce((s, i) => s + Number(i.net_amount), 0),
    },
    childrenAcademic,
    feesSummary: { totalPaid: paid, totalDue: due, nextDueDate: nextDue },
    feeRecords,
    notices: [],
    activities: [],
    documents: [],
  };
}

export const parentKeys = { all: ["parents"] as const };

export function useParents() {
  return useQuery({
    queryKey: parentKeys.all,
    queryFn: async () => (await getAll<ApiGuardian>("/guardians/")).map(mapParent),
    staleTime: 60_000,
  });
}

export function useParentDetail(id: string | undefined, canSeeFees: boolean) {
  return useQuery({
    queryKey: ["parents", id, canSeeFees],
    queryFn: () => fetchParentDetail(id!, canSeeFees),
    enabled: !!id,
  });
}

export function useParentRecord(id: string | undefined) {
  return useQuery({
    queryKey: ["parents", id, "record"],
    queryFn: () => get<ApiGuardian>(`/guardians/${id}/`),
    enabled: !!id,
  });
}

/** Save a guardian, then make their student links match `studentIds`. */
export async function saveParent(
  id: string | undefined, payload: Record<string, unknown>, studentIds: string[],
): Promise<ApiGuardian> {
  const g = id ? await patch<ApiGuardian>(`/guardians/${id}/`, payload) : await post<ApiGuardian>("/guardians/", payload);
  const linked = new Map(g.children.map((c) => [c.student, c.link_id]));
  const wanted = new Set(studentIds.filter(Boolean));
  for (const sid of wanted) {
    if (!linked.has(sid)) await post("/student-guardians/", { student: sid, guardian: g.id, relation: g.relation });
  }
  for (const [sid, linkId] of linked) {
    if (!wanted.has(sid)) await del(`/student-guardians/${linkId}/`);
  }
  return get<ApiGuardian>(`/guardians/${g.id}/`);
}

export function useSaveParent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (v: { id?: string; payload: Record<string, unknown>; studentIds: string[] }) =>
      saveParent(v.id, v.payload, v.studentIds),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: parentKeys.all });
      qc.invalidateQueries({ queryKey: ["students"] });
    },
  });
}

export async function createParentLogin(id: string, email?: string) {
  return post<{ email: string; temporary_password: string }>(`/guardians/${id}/create-login/`, email ? { email } : {});
}
