/** Class routine view models (mapped from the API in api/routine.ts). */

export type Day = "Sunday" | "Monday" | "Tuesday" | "Wednesday" | "Thursday" | "Friday" | "Saturday";
export type Shift = "Morning" | "Day" | "Evening";
export type RoutineStatus = "active" | "inactive" | "suspended";

export interface RoutineEntry {
  id: string;
  routineId: string;
  academicYear: string;
  className: string;
  section: string;
  day: Day;
  subject: string;
  teacher: string;
  room: string;
  startTime: string;
  endTime: string;
  duration: number;
  periodNo: number;
  shift: Shift;
  status: RoutineStatus;
  notes: string;
  // ids for editing
  academicYearId: string;
  sectionId: string;
  periodId: string;
  subjectId: string;
  teacherId: string | null;
  roomId: string | null;
}

export interface PeriodDef {
  id: string;
  period: number;
  start: string;
  end: string;
  duration: number;
  isBreak: boolean;
  shift: Shift;
}

export const SCHOOL_DAYS: Day[] = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
export const SHIFT_OPTIONS: Shift[] = ["Morning", "Day", "Evening"];
export const STATUS_OPTIONS: RoutineStatus[] = ["active", "inactive", "suspended"];
