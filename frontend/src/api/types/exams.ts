/**
 * Exam view models used by the exam pages (schedule, grades, marks, results,
 * report and admit cards). Built from the API by `src/api/exams.ts`.
 */
export type ExamType   = "Class Test" | "Unit Test" | "Mid Term" | "Final Term" | "Practical Exam" | "Board Exam" | "Mock Test";
/** "published" is shown for a completed exam whose results are out. */
export type ExamStatus = "draft" | "scheduled" | "published" | "completed" | "cancelled";
export type ResultStatus = "Pass" | "Fail" | "Absent" | "Incomplete";

/** An exam (term exam): the container papers belong to. */
export interface Exam {
  id:           string;
  code:         string;
  name:         string;
  term:         string;
  examType:     ExamType;
  status:       ExamStatus;
  academicYear: string;
  academicYearId: string;
  gradeScaleId: string | null;
  startDate:    string | null;
  endDate:      string | null;
  instructions: string;
  isLocked:     boolean;
  isPublished:  boolean;
  publishedAt:  string | null;
}

/** One paper: an exam's subject for one class (all its sections). */
export interface ExamSchedule {
  id:                    string;
  examRecordId:          string;
  examId:                string;          // exam code, e.g. EXM-2026-00001
  examName:              string;
  term:                  string;
  academicYear:          string;
  examType:              ExamType;
  subject:               string;
  subjectId:             string;
  className:             string;
  classLevelId:          string;
  date:                  string;
  startTime:             string;
  endTime:               string;
  duration:              number;          // minutes
  reportingTime:         string;
  room:                  string;
  roomId:                string | null;
  seatCapacity:          number | null;
  invigilator:           string;
  invigilatorId:         string | null;
  assistantInvigilator:  string;
  assistantInvigilatorId: string | null;
  fullMarks:             number;
  passMarks:             number;
  theoryMarks:           number;
  practicalMarks:        number;
  internalMarks:         number;
  status:                ExamStatus;
  marksEntered:          number;
  isLocked:              boolean;
  resultPublished:       boolean;
  instructions:          string;
  notes:                 string;
}

export interface ScheduleClash {
  paperId: string;
  otherPaperId: string;
  exam: string;
  subject: string;
  time: string;
  reason: string;
}

export interface GradeBand {
  id:           string;
  scaleId:      string;
  gradeName:    string;
  gradePoint:   number;
  percentFrom:  number;
  percentUpto:  number;
  resultStatus: "Pass" | "Fail";
  comment:      string;
  colorLabel:   string;
}

export interface GradeScale { id: string; name: string; bands: GradeBand[] }

export interface MarksRow {
  studentId:      string;
  studentName:    string;
  admissionNo:    string;
  registrationNo: string;
  roll:           string;
  section:        string;
  marksObtained:  number | null;
  theoryMarks:    number | null;
  practicalMarks: number | null;
  internalMarks:  number | null;
  remarks:        string;
  isAbsent:       boolean;
}

export interface MarksSheet {
  paper:      ExamSchedule;
  locked:     boolean;
  /** Maximum per component; empty when the paper is marked as a single total. */
  components: Partial<Record<"theory" | "practical" | "internal", number>>;
  rows:       MarksRow[];
}

export interface SubjectResult {
  subject:       string;
  fullMarks:     number;
  obtainedMarks: number | null;
  grade:         string | null;
  gradePoint:    number | null;
  result:        "pass" | "fail" | "absent" | "missing";
}

export interface ExamResult {
  studentId:       string;
  studentName:     string;
  registrationNo:  string;
  admissionNo:     string;
  className:       string;
  section:         string;
  roll:            string;
  examName:        string;
  examTerm:        string;
  academicYear:    string;
  subjectResults:  SubjectResult[];
  totalMarks:      number;
  totalFullMarks:  number;
  percentage:      number | null;
  gpa:             number | null;
  grade:           string | null;
  rank:            number | null;
  sectionRank:     number | null;
  result:          ResultStatus;
  published:       boolean;
  publishedDate:   string;
}

export interface ExamRoom { id: string; roomName: string; capacity: number; building: string; floor: string; facilities: string }

export const EXAM_TYPE_OPTIONS: ExamType[] = [
  "Class Test", "Unit Test", "Mid Term", "Final Term", "Practical Exam", "Board Exam", "Mock Test",
];
export const EXAM_STATUS_OPTIONS: ExamStatus[] = ["draft", "scheduled", "published", "completed", "cancelled"];
