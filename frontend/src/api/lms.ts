/** Teacher-side LMS: assignments (with submissions and grading), materials and lesson plans. */
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import type { StoredFile } from "./files";
import { del, get, getAll, patch, post } from "./http";

export interface TeacherAssignment {
  id: string; academic_year: string; class_level: string; class_level_name: string; section: string | null; section_name: string | null;
  subject: string; subject_name: string; kind: string; title: string; instructions: string; due_at: string | null;
  max_marks: string | null; allow_late: boolean; status: string; attachments: StoredFile[]; submissions_count: number;
  graded_count: number; created_at: string;
}
export interface SubmissionRow {
  student: string; name: string; roll_number: string; status: string;
  submission: { id: string; text_answer: string; attachments: StoredFile[]; submitted_at: string; is_late: boolean; marks: string | null; feedback: string } | null;
}
export interface Material {
  id: string; class_level: string; class_level_name: string; section: string | null; section_name: string | null; subject: string;
  subject_name: string; title: string; description: string; type: string; file: StoredFile | null; url: string; is_shared: boolean; created_at: string;
}
export interface LessonPlan {
  id: string; class_level: string; class_level_name: string; section: string | null; subject: string; subject_name: string;
  week_start: string; topic: string; objectives: string[]; materials: string[]; homework: string; status: string; review_note: string;
}

function useLms<V, R>(fn: (v: V) => Promise<R>) {
  const qc = useQueryClient();
  return useMutation({ mutationFn: fn, onSuccess: () => qc.invalidateQueries({ queryKey: ["lms"] }) });
}

export const useTeacherAssignments = () => useQuery({ queryKey: ["lms", "assignments"], queryFn: () => getAll<TeacherAssignment>("/lms/assignments/") });
export const useSubmissions = (id?: string) => useQuery({
  queryKey: ["lms", "submissions", id], queryFn: () => get<{ total: number; submitted: number; rows: SubmissionRow[] }>(`/lms/assignments/${id}/submissions/`), enabled: !!id,
});
export function useAssignmentActions() {
  return {
    save: useLms((v: { id?: string; body: Record<string, unknown> }) => (v.id ? patch(`/lms/assignments/${v.id}/`, v.body) : post<TeacherAssignment>("/lms/assignments/", v.body))),
    publish: useLms((id: string) => post(`/lms/assignments/${id}/publish/`)),
    close: useLms((id: string) => post(`/lms/assignments/${id}/close/`)),
    remove: useLms((id: string) => del(`/lms/assignments/${id}/`)),
    grade: useLms((v: { id: string; submission: string; marks: string; feedback: string }) =>
      post(`/lms/assignments/${v.id}/submissions/${v.submission}/grade/`, { marks: v.marks, feedback: v.feedback })),
  };
}

export const useMaterials = () => useQuery({ queryKey: ["lms", "materials"], queryFn: () => getAll<Material>("/lms/materials/") });
export function useMaterialActions() {
  return {
    save: useLms((body: Record<string, unknown>) => post("/lms/materials/", body)),
    remove: useLms((id: string) => del(`/lms/materials/${id}/`)),
  };
}

export const useLessonPlans = () => useQuery({ queryKey: ["lms", "plans"], queryFn: () => getAll<LessonPlan>("/lms/lesson-plans/") });
export function useLessonPlanActions() {
  return {
    save: useLms((v: { id?: string; body: Record<string, unknown> }) => (v.id ? patch(`/lms/lesson-plans/${v.id}/`, v.body) : post("/lms/lesson-plans/", v.body))),
    submit: useLms((id: string) => post(`/lms/lesson-plans/${id}/submit/`)),
    remove: useLms((id: string) => del(`/lms/lesson-plans/${id}/`)),
  };
}
