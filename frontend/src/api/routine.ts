/**
 * Class routine: entries, bell schedule (period slots), conflicts and stats.
 */
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { del, get, getAll, label, patch, post, type Schemas } from "./http";
import type { Day, PeriodDef, RoutineEntry, RoutineStatus, Shift } from "./types/routine";

type ApiEntry = Schemas["RoutineEntry"];
type ApiSlot = Schemas["PeriodSlot"];

export function to12h(hhmm: string): string {
  const [h, m] = hhmm.split(":").map(Number);
  const suffix = h >= 12 ? "PM" : "AM";
  return `${((h + 11) % 12) + 1}:${String(m).padStart(2, "0")} ${suffix}`;
}

export function mapSlot(s: ApiSlot): PeriodDef {
  return {
    id: s.id, period: s.period_no, start: to12h(s.start_time), end: to12h(s.end_time),
    duration: s.duration_minutes, isBreak: !!s.is_break, shift: label(s.shift) as Shift,
  };
}

export function mapEntry(e: ApiEntry): RoutineEntry {
  const start = e.start_time.slice(0, 5);
  const end = e.end_time.slice(0, 5);
  const [sh, sm] = start.split(":").map(Number);
  const [eh, em] = end.split(":").map(Number);
  return {
    id: e.id,
    routineId: `${e.class_level_name}-${e.section_name}-${e.day.slice(0, 3).toUpperCase()}-P${e.period_no}`,
    academicYear: "",
    className: e.class_level_name,
    section: e.section_name,
    day: label(e.day) as Day,
    subject: e.subject_name,
    teacher: e.teacher_name ?? "",
    room: e.room_name ?? "",
    startTime: start,
    endTime: end,
    duration: eh * 60 + em - (sh * 60 + sm),
    periodNo: e.period_no,
    shift: label(e.shift) as Shift,
    status: (e.status ?? "active") as RoutineStatus,
    notes: e.notes ?? "",
    academicYearId: e.academic_year,
    sectionId: e.section,
    periodId: e.period,
    subjectId: e.subject,
    teacherId: e.teacher ?? null,
    roomId: e.room ?? null,
  };
}

export interface RoutineData {
  entries: RoutineEntry[];
  periods: PeriodDef[];
  conflictIds: Set<string>;
  periodsFor: (shift: Shift) => PeriodDef[];
}

export function useRoutineData() {
  const q = useQuery({
    queryKey: ["routine"],
    queryFn: async () => {
      const [entries, slots, conflicts] = await Promise.all([
        getAll<ApiEntry>("/timetable/entries/"),
        getAll<ApiSlot>("/timetable/periods/"),
        get<{ conflicts: { entry: string; clash: { entry: string } }[] }>("/timetable/entries/conflicts/")
          .catch(() => ({ conflicts: [] })),
      ]);
      const conflictIds = new Set<string>();
      for (const c of conflicts.conflicts) { conflictIds.add(c.entry); conflictIds.add(c.clash.entry); }
      return { entries: entries.map(mapEntry), periods: slots.map(mapSlot), conflictIds };
    },
    staleTime: 30_000,
  });
  const data: RoutineData = {
    entries: q.data?.entries ?? [],
    periods: q.data?.periods ?? [],
    conflictIds: q.data?.conflictIds ?? new Set(),
    periodsFor: (shift) => (q.data?.periods ?? []).filter((p) => p.shift === shift).sort((a, b) => a.period - b.period),
  };
  return { ...q, routine: data };
}

export function routineStats(entries: RoutineEntry[], conflictIds: Set<string>) {
  const active = entries.filter((r) => r.status === "active");
  return {
    total: entries.length,
    activeClasses: new Set(active.map((r) => `${r.className}${r.section}`)).size,
    teachers: new Set(entries.map((r) => r.teacher).filter(Boolean)).size,
    weeklyPeriods: active.length,
    freePeriods: 0,
    conflicts: Math.floor(conflictIds.size / 2),
  };
}

function invalidate(qc: ReturnType<typeof useQueryClient>) {
  qc.invalidateQueries({ queryKey: ["routine"] });
}

export function useSaveEntry() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (v: { id?: string; body: Record<string, unknown> }) =>
      v.id ? patch<ApiEntry>(`/timetable/entries/${v.id}/`, v.body) : post<ApiEntry>("/timetable/entries/", v.body),
    onSuccess: () => invalidate(qc),
  });
}

export function useDeleteEntry() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: (id: string) => del(`/timetable/entries/${id}/`), onSuccess: () => invalidate(qc) });
}

export function useSlotActions() {
  const qc = useQueryClient();
  return {
    add: useMutation({
      mutationFn: (body: Record<string, unknown>) => post<ApiSlot>("/timetable/periods/", body),
      onSuccess: () => invalidate(qc),
    }),
    remove: useMutation({ mutationFn: (id: string) => del(`/timetable/periods/${id}/`), onSuccess: () => invalidate(qc) }),
  };
}

export function useRooms() {
  return useQuery({
    queryKey: ["rooms"],
    queryFn: () => getAll<Schemas["ExamRoom"]>("/exams/rooms/"),
    staleTime: 5 * 60_000,
  });
}

export function useTeacherOptions() {
  return useQuery({
    queryKey: ["teachers", "options"],
    queryFn: async () => (await getAll<Schemas["Teacher"]>("/teachers/")).map((t) => ({ id: t.id, name: t.full_name })),
    staleTime: 5 * 60_000,
  });
}
