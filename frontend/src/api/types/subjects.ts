/** Subject view models (mapped from the API in api/subjects.ts). */

export type SubjectType     = "Theory" | "Practical" | "Theory + Practical";
export type SubjectCategory = "Compulsory" | "Optional" | "Language" | "Science" | "Commerce" | "Technical" | "Extra-curricular";
export type SubjectStatus   = "active" | "inactive" | "draft" | "archived";

export interface TeacherRef {
  id: string;
  name: string;
  employeeId: string;
}

export interface SubjectData {
  id: string;
  subjectCode: string;
  subjectName: string;
  type: SubjectType;
  category: SubjectCategory;
  status: SubjectStatus;
  description: string;
  assignedClasses: string[];
  sections: string[];
  academicYear: string;
  primaryTeacher: TeacherRef | null;
  assistantTeacher: string;
  department: string;
  weeklyPeriods: number;
  room: string;
  fullMarks: number;
  passMarks: number;
  theoryMarks: number;
  practicalMarks: number;
  internalMarks: number;
  creditHours: number;
  examDuration: string;
  gpaEnabled: boolean;
  practicalRequired: boolean;
  projectRequired: boolean;
  vivaRequired: boolean;
  assignmentRequired: boolean;
}

export const SUBJECT_TYPE_OPTIONS: SubjectType[]         = ["Theory", "Practical", "Theory + Practical"];
export const SUBJECT_CATEGORY_OPTIONS: SubjectCategory[] = ["Compulsory", "Optional", "Language", "Science", "Commerce", "Technical", "Extra-curricular"];
export const SUBJECT_STATUS_OPTIONS: SubjectStatus[]     = ["active", "inactive", "draft", "archived"];

export interface SubjectClassMapping {
  id: string;
  className: string;
  section: string;
  teacher: string;
  room: string;
  weeklyPeriods: number;
  students: number;
  status: "active" | "inactive";
}

export interface SubjectTeacher {
  id: string;
  name: string;
  employeeId: string;
  department: string;
  classes: string;
  weeklyLoad: number;
  email: string;
  contact: string;
}

export type SyllabusStatus = "Completed" | "In Progress" | "Not Started";

export interface SyllabusUnit {
  id: string;
  unitNo: number;
  title: string;
  topics: string[];
  estimatedPeriods: number;
  status: SyllabusStatus;
}

export interface SubjectPerformance {
  averageScore: number;
  passRate: number;
  highestMarks: number;
  lowestMarks: number;
  needsImprovement: number;
  classWise: { className: string; average: number }[];
  topStudents: { name: string; marks: number; className: string; section: string }[];
}

export interface SubjectDocument {
  id: string;
  name: string;
  type: "PDF" | "DOC" | "XLS" | "JPG" | "PNG";
  size: string;
  uploadedOn: string;
  status: "Available" | "Draft" | "Archived";
}

export type SubjectActivityType =
  | "create" | "teacher" | "syllabus" | "exam" | "document" | "marks" | "update" | "mapping";

export interface SubjectActivity {
  id: string;
  type: SubjectActivityType;
  message: string;
  user: string;
  timestamp: string;
}

export interface SubjectDetailView {
  classMappings: SubjectClassMapping[];
  teachers: SubjectTeacher[];
  syllabusUnits: SyllabusUnit[];
  performance: SubjectPerformance | null; // null until published results exist
  documents: SubjectDocument[];
  activities: SubjectActivity[];
}
