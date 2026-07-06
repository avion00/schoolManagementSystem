// ─── Types ───────────────────────────────────────────────────────────────────
export type ExamType   = "Class Test" | "Unit Test" | "Mid Term" | "Final Term" | "Practical Exam" | "Board Exam" | "Mock Test";
export type ExamTerm   = "First Term" | "Mid Term" | "Final Term" | "Annual";
export type ExamStatus = "draft" | "scheduled" | "published" | "completed" | "cancelled";
export type ResultStatus = "Pass" | "Fail" | "Absent";

// ─── Interfaces ───────────────────────────────────────────────────────────────
export interface ExamSchedule {
  id:                    number;
  examId:                string;
  examName:              string;
  term:                  ExamTerm;
  academicYear:          string;
  examType:              ExamType;
  subject:               string;
  className:             string;
  section:               string;
  date:                  string;
  startTime:             string;
  endTime:               string;
  duration:              number;
  reportingTime:         string;
  room:                  string;
  seatCapacity:          number;
  invigilator:           string;
  assistantInvigilator:  string;
  fullMarks:             number;
  passMarks:             number;
  theoryMarks:           number;
  practicalMarks:        number;
  internalMarks:         number;
  subjectTeacher:        string;
  status:                ExamStatus;
  marksEntered:          boolean;
  resultPublished:       boolean;
  instructions:          string;
  notes:                 string;
}

export interface GradeScale {
  id:           number;
  gradeName:    string;
  gradePoint:   number;
  percentFrom:  number;
  percentUpto:  number;
  resultStatus: "Pass" | "Fail";
  comment:      string;
  colorLabel:   string;
  status:       "active" | "inactive";
}

export interface MarksEntry {
  id:             number;
  examId:         number;
  studentId:      number;
  studentName:    string;
  admissionNo:    string;
  registrationNo: string;
  roll:           number;
  theoryMarks:    number | null;
  practicalMarks: number | null;
  internalMarks:  number | null;
  totalMarks:     number | null;
  percentage:     number | null;
  grade:          string | null;
  gradePoint:     number | null;
  result:         "Pass" | "Fail" | null;
  remarks:        string;
  isAbsent:       boolean;
}

export interface SubjectResult {
  subject:       string;
  fullMarks:     number;
  obtainedMarks: number;
  grade:         string;
  gradePoint:    number;
}

export interface ExamResult {
  id:              number;
  studentId:       number;
  studentName:     string;
  registrationNo:  string;
  admissionNo:     string;
  className:       string;
  section:         string;
  roll:            number;
  examTerm:        ExamTerm;
  academicYear:    string;
  subjectResults:  SubjectResult[];
  totalMarks:      number;
  totalFullMarks:  number;
  percentage:      number;
  gpa:             number;
  grade:           string;
  rank:            number;
  result:          ResultStatus;
  published:       boolean;
  publishedDate:   string;
  teacherRemarks:  string;
}

export interface ExamRoom {
  id:         number;
  roomName:   string;
  capacity:   number;
  building:   string;
  floor:      string;
  facilities: string;
}

// ─── Exam Schedules ──────────────────────────────────────────────────────────
export const EXAM_SCHEDULES: ExamSchedule[] = [
  // ── First Term – Grade 6 A (June 2026, Completed) ─────────────────────────
  {
    id: 1, examId: "EXM-2026-001", examName: "First Term Examination 2026",
    term: "First Term", academicYear: "2026/27", examType: "Final Term",
    subject: "Mathematics Primary", className: "Grade 6", section: "A",
    date: "2026-06-10", startTime: "10:00", endTime: "11:30", duration: 90,
    reportingTime: "09:45", room: "Room 101", seatCapacity: 35,
    invigilator: "Kazi Fahim", assistantInvigilator: "Mira Shrestha",
    fullMarks: 100, passMarks: 40, theoryMarks: 80, practicalMarks: 0, internalMarks: 20,
    subjectTeacher: "Kazi Fahim",
    status: "completed", marksEntered: true, resultPublished: true,
    instructions: "Answer all questions. No mobile phones allowed.",
    notes: "First term examination for Grade 6 A",
  },
  {
    id: 2, examId: "EXM-2026-002", examName: "First Term Examination 2026",
    term: "First Term", academicYear: "2026/27", examType: "Final Term",
    subject: "English", className: "Grade 6", section: "A",
    date: "2026-06-11", startTime: "10:00", endTime: "12:00", duration: 120,
    reportingTime: "09:45", room: "Room 101", seatCapacity: 35,
    invigilator: "Sita Rai", assistantInvigilator: "Binod Karki",
    fullMarks: 100, passMarks: 40, theoryMarks: 80, practicalMarks: 0, internalMarks: 20,
    subjectTeacher: "Sita Rai",
    status: "completed", marksEntered: true, resultPublished: true,
    instructions: "Read each question carefully. Write neatly.",
    notes: "",
  },
  {
    id: 3, examId: "EXM-2026-003", examName: "First Term Examination 2026",
    term: "First Term", academicYear: "2026/27", examType: "Final Term",
    subject: "Science Primary", className: "Grade 6", section: "A",
    date: "2026-06-12", startTime: "10:00", endTime: "11:30", duration: 90,
    reportingTime: "09:45", room: "Room 101", seatCapacity: 35,
    invigilator: "Ramesh Adhikari", assistantInvigilator: "Mira Shrestha",
    fullMarks: 100, passMarks: 40, theoryMarks: 70, practicalMarks: 30, internalMarks: 0,
    subjectTeacher: "Ramesh Adhikari",
    status: "completed", marksEntered: true, resultPublished: true,
    instructions: "Practical section must be attempted. Diagrams required.",
    notes: "",
  },
  {
    id: 4, examId: "EXM-2026-004", examName: "First Term Examination 2026",
    term: "First Term", academicYear: "2026/27", examType: "Final Term",
    subject: "Nepali", className: "Grade 6", section: "A",
    date: "2026-06-13", startTime: "10:00", endTime: "11:30", duration: 90,
    reportingTime: "09:45", room: "Room 101", seatCapacity: 35,
    invigilator: "Sunita Gurung", assistantInvigilator: "Kavita Joshi",
    fullMarks: 100, passMarks: 40, theoryMarks: 80, practicalMarks: 0, internalMarks: 20,
    subjectTeacher: "Sunita Gurung",
    status: "completed", marksEntered: true, resultPublished: true,
    instructions: "Write answers in Nepali language only.",
    notes: "",
  },
  {
    id: 5, examId: "EXM-2026-005", examName: "First Term Examination 2026",
    term: "First Term", academicYear: "2026/27", examType: "Final Term",
    subject: "Social Studies", className: "Grade 6", section: "A",
    date: "2026-06-14", startTime: "10:00", endTime: "11:30", duration: 90,
    reportingTime: "09:45", room: "Room 101", seatCapacity: 35,
    invigilator: "Kavita Joshi", assistantInvigilator: "Binod Karki",
    fullMarks: 75, passMarks: 30, theoryMarks: 75, practicalMarks: 0, internalMarks: 0,
    subjectTeacher: "Kavita Joshi",
    status: "completed", marksEntered: true, resultPublished: true,
    instructions: "Attempt all questions from each section.",
    notes: "",
  },
  {
    id: 6, examId: "EXM-2026-006", examName: "First Term Examination 2026",
    term: "First Term", academicYear: "2026/27", examType: "Final Term",
    subject: "Computer Science", className: "Grade 6", section: "A",
    date: "2026-06-16", startTime: "10:00", endTime: "11:00", duration: 60,
    reportingTime: "09:45", room: "Computer Lab", seatCapacity: 25,
    invigilator: "Andrew Martin", assistantInvigilator: "Mira Shrestha",
    fullMarks: 50, passMarks: 20, theoryMarks: 25, practicalMarks: 25, internalMarks: 0,
    subjectTeacher: "Andrew Martin",
    status: "completed", marksEntered: true, resultPublished: true,
    instructions: "Practical exam on computer systems. No internet browsing.",
    notes: "",
  },
  // ── First Term – Grade 7 A (June 2026, Completed) ─────────────────────────
  {
    id: 7, examId: "EXM-2026-007", examName: "First Term Examination 2026",
    term: "First Term", academicYear: "2026/27", examType: "Final Term",
    subject: "Mathematics Middle", className: "Grade 7", section: "A",
    date: "2026-06-10", startTime: "10:00", endTime: "12:00", duration: 120,
    reportingTime: "09:45", room: "Room 201", seatCapacity: 35,
    invigilator: "Kazi Fahim", assistantInvigilator: "Binod Karki",
    fullMarks: 100, passMarks: 40, theoryMarks: 80, practicalMarks: 0, internalMarks: 20,
    subjectTeacher: "Kazi Fahim",
    status: "completed", marksEntered: true, resultPublished: false,
    instructions: "Show all calculation steps.",
    notes: "",
  },
  {
    id: 8, examId: "EXM-2026-008", examName: "First Term Examination 2026",
    term: "First Term", academicYear: "2026/27", examType: "Final Term",
    subject: "Science Middle", className: "Grade 7", section: "A",
    date: "2026-06-11", startTime: "10:00", endTime: "11:30", duration: 90,
    reportingTime: "09:45", room: "Room 201", seatCapacity: 35,
    invigilator: "Ramesh Adhikari", assistantInvigilator: "Sunita Gurung",
    fullMarks: 100, passMarks: 40, theoryMarks: 75, practicalMarks: 25, internalMarks: 0,
    subjectTeacher: "Ramesh Adhikari",
    status: "completed", marksEntered: true, resultPublished: false,
    instructions: "Include labeled diagrams wherever necessary.",
    notes: "",
  },
  {
    id: 9, examId: "EXM-2026-009", examName: "First Term Examination 2026",
    term: "First Term", academicYear: "2026/27", examType: "Final Term",
    subject: "English", className: "Grade 7", section: "A",
    date: "2026-06-12", startTime: "10:00", endTime: "12:00", duration: 120,
    reportingTime: "09:45", room: "Room 201", seatCapacity: 35,
    invigilator: "Sita Rai", assistantInvigilator: "Kavita Joshi",
    fullMarks: 100, passMarks: 40, theoryMarks: 80, practicalMarks: 0, internalMarks: 20,
    subjectTeacher: "Sita Rai",
    status: "completed", marksEntered: false, resultPublished: false,
    instructions: "Writing section carries 40 marks. Plan your time accordingly.",
    notes: "",
  },
  {
    id: 10, examId: "EXM-2026-010", examName: "First Term Examination 2026",
    term: "First Term", academicYear: "2026/27", examType: "Final Term",
    subject: "Optional Mathematics", className: "Grade 7", section: "A",
    date: "2026-06-14", startTime: "10:00", endTime: "12:00", duration: 120,
    reportingTime: "09:45", room: "Room 201", seatCapacity: 35,
    invigilator: "Mira Shrestha", assistantInvigilator: "Andrew Martin",
    fullMarks: 100, passMarks: 40, theoryMarks: 100, practicalMarks: 0, internalMarks: 0,
    subjectTeacher: "Kazi Fahim",
    status: "completed", marksEntered: false, resultPublished: false,
    instructions: "Attempt all questions. Bonus questions at the end.",
    notes: "",
  },
  // ── Mid Term – Grade 6 A (August 2026, Scheduled/Published) ──────────────
  {
    id: 11, examId: "EXM-2026-011", examName: "Mid Term Examination 2026",
    term: "Mid Term", academicYear: "2026/27", examType: "Mid Term",
    subject: "Mathematics Primary", className: "Grade 6", section: "A",
    date: "2026-08-05", startTime: "10:00", endTime: "11:30", duration: 90,
    reportingTime: "09:45", room: "Room 101", seatCapacity: 35,
    // INTENTIONAL CONFLICT: same invigilator + date + time as exam 17
    invigilator: "Kazi Fahim", assistantInvigilator: "Mira Shrestha",
    fullMarks: 100, passMarks: 40, theoryMarks: 80, practicalMarks: 0, internalMarks: 20,
    subjectTeacher: "Kazi Fahim",
    status: "scheduled", marksEntered: false, resultPublished: false,
    instructions: "Bring calculator. Show all working.",
    notes: "",
  },
  {
    id: 12, examId: "EXM-2026-012", examName: "Mid Term Examination 2026",
    term: "Mid Term", academicYear: "2026/27", examType: "Mid Term",
    subject: "English", className: "Grade 6", section: "A",
    date: "2026-08-06", startTime: "10:00", endTime: "12:00", duration: 120,
    reportingTime: "09:45", room: "Room 101", seatCapacity: 35,
    invigilator: "Sita Rai", assistantInvigilator: "Binod Karki",
    fullMarks: 100, passMarks: 40, theoryMarks: 80, practicalMarks: 0, internalMarks: 20,
    subjectTeacher: "Sita Rai",
    status: "published", marksEntered: false, resultPublished: false,
    instructions: "Comprehension passage + essay + grammar sections.",
    notes: "",
  },
  {
    id: 13, examId: "EXM-2026-013", examName: "Mid Term Examination 2026",
    term: "Mid Term", academicYear: "2026/27", examType: "Mid Term",
    subject: "Science Primary", className: "Grade 6", section: "A",
    date: "2026-08-08", startTime: "10:00", endTime: "11:30", duration: 90,
    reportingTime: "09:45", room: "Room 101", seatCapacity: 35,
    invigilator: "Ramesh Adhikari", assistantInvigilator: "Sunita Gurung",
    fullMarks: 100, passMarks: 40, theoryMarks: 70, practicalMarks: 30, internalMarks: 0,
    subjectTeacher: "Ramesh Adhikari",
    status: "published", marksEntered: false, resultPublished: false,
    instructions: "Practical session in Lab A at 2:00 PM same day.",
    notes: "",
  },
  {
    id: 14, examId: "EXM-2026-014", examName: "Mid Term Examination 2026",
    term: "Mid Term", academicYear: "2026/27", examType: "Mid Term",
    subject: "Nepali", className: "Grade 6", section: "A",
    date: "2026-08-09", startTime: "10:00", endTime: "11:30", duration: 90,
    reportingTime: "09:45", room: "Room 101", seatCapacity: 35,
    invigilator: "Sunita Gurung", assistantInvigilator: "Kavita Joshi",
    fullMarks: 100, passMarks: 40, theoryMarks: 80, practicalMarks: 0, internalMarks: 20,
    subjectTeacher: "Sunita Gurung",
    status: "scheduled", marksEntered: false, resultPublished: false,
    instructions: "",
    notes: "",
  },
  // ── Mid Term – Grade 7 A (August 2026) ───────────────────────────────────
  {
    id: 15, examId: "EXM-2026-015", examName: "Mid Term Examination 2026",
    term: "Mid Term", academicYear: "2026/27", examType: "Mid Term",
    subject: "Mathematics Middle", className: "Grade 7", section: "A",
    date: "2026-08-05", startTime: "14:00", endTime: "16:00", duration: 120,
    reportingTime: "13:45", room: "Room 201", seatCapacity: 35,
    invigilator: "Sita Rai", assistantInvigilator: "Binod Karki",
    fullMarks: 100, passMarks: 40, theoryMarks: 80, practicalMarks: 0, internalMarks: 20,
    subjectTeacher: "Kazi Fahim",
    status: "published", marksEntered: false, resultPublished: false,
    instructions: "Coordinate geometry and algebra sections.",
    notes: "",
  },
  {
    id: 16, examId: "EXM-2026-016", examName: "Mid Term Examination 2026",
    term: "Mid Term", academicYear: "2026/27", examType: "Mid Term",
    subject: "Science Middle", className: "Grade 7", section: "A",
    date: "2026-08-07", startTime: "10:00", endTime: "11:30", duration: 90,
    reportingTime: "09:45", room: "Room 201", seatCapacity: 35,
    invigilator: "Ramesh Adhikari", assistantInvigilator: "Andrew Martin",
    fullMarks: 100, passMarks: 40, theoryMarks: 75, practicalMarks: 25, internalMarks: 0,
    subjectTeacher: "Ramesh Adhikari",
    status: "scheduled", marksEntered: false, resultPublished: false,
    instructions: "Chapters 1-6 only.",
    notes: "",
  },
  {
    id: 17, examId: "EXM-2026-017", examName: "Mid Term Examination 2026",
    term: "Mid Term", academicYear: "2026/27", examType: "Mid Term",
    subject: "Mathematics Secondary", className: "Grade 8", section: "A",
    date: "2026-08-05", startTime: "10:00", endTime: "12:00", duration: 120,
    reportingTime: "09:45", room: "Room 202", seatCapacity: 35,
    // INTENTIONAL CONFLICT: same invigilator + date + time as exam 11
    invigilator: "Kazi Fahim", assistantInvigilator: "Mira Shrestha",
    fullMarks: 100, passMarks: 40, theoryMarks: 100, practicalMarks: 0, internalMarks: 0,
    subjectTeacher: "Kazi Fahim",
    status: "scheduled", marksEntered: false, resultPublished: false,
    instructions: "Trigonometry and sets included.",
    notes: "⚠ Invigilator schedule conflict detected.",
  },
  {
    id: 18, examId: "EXM-2026-018", examName: "Mid Term Examination 2026",
    term: "Mid Term", academicYear: "2026/27", examType: "Mid Term",
    subject: "English Advanced", className: "Grade 8", section: "A",
    date: "2026-08-06", startTime: "10:00", endTime: "12:00", duration: 120,
    reportingTime: "09:45", room: "Room 202", seatCapacity: 35,
    invigilator: "Sita Rai", assistantInvigilator: "Kavita Joshi",
    fullMarks: 100, passMarks: 40, theoryMarks: 80, practicalMarks: 0, internalMarks: 20,
    subjectTeacher: "Sita Rai",
    status: "draft", marksEntered: false, resultPublished: false,
    instructions: "",
    notes: "",
  },
  {
    id: 19, examId: "EXM-2026-019", examName: "Mid Term Examination 2026",
    term: "Mid Term", academicYear: "2026/27", examType: "Mid Term",
    subject: "Optional Mathematics", className: "Grade 7", section: "A",
    date: "2026-08-09", startTime: "10:00", endTime: "12:00", duration: 120,
    reportingTime: "09:45", room: "Room 201", seatCapacity: 35,
    invigilator: "Mira Shrestha", assistantInvigilator: "Binod Karki",
    fullMarks: 100, passMarks: 40, theoryMarks: 100, practicalMarks: 0, internalMarks: 0,
    subjectTeacher: "Kazi Fahim",
    status: "scheduled", marksEntered: false, resultPublished: false,
    instructions: "",
    notes: "",
  },
  {
    id: 20, examId: "EXM-2026-020", examName: "Mid Term Examination 2026",
    term: "Mid Term", academicYear: "2026/27", examType: "Mid Term",
    subject: "Computer Science", className: "Grade 6", section: "A",
    date: "2026-08-10", startTime: "10:00", endTime: "11:00", duration: 60,
    reportingTime: "09:45", room: "Computer Lab", seatCapacity: 25,
    invigilator: "Andrew Martin", assistantInvigilator: "Mira Shrestha",
    fullMarks: 50, passMarks: 20, theoryMarks: 25, practicalMarks: 25, internalMarks: 0,
    subjectTeacher: "Andrew Martin",
    status: "draft", marksEntered: false, resultPublished: false,
    instructions: "",
    notes: "",
  },
  // ── Final Term – Grade 6 A (December 2026, Draft) ────────────────────────
  {
    id: 21, examId: "EXM-2026-021", examName: "Final Term Examination 2026",
    term: "Final Term", academicYear: "2026/27", examType: "Final Term",
    subject: "Mathematics Primary", className: "Grade 6", section: "A",
    date: "2026-12-01", startTime: "10:00", endTime: "12:00", duration: 120,
    reportingTime: "09:45", room: "Room 101", seatCapacity: 35,
    invigilator: "Sita Rai", assistantInvigilator: "Mira Shrestha",
    fullMarks: 100, passMarks: 40, theoryMarks: 80, practicalMarks: 0, internalMarks: 20,
    subjectTeacher: "Kazi Fahim",
    status: "draft", marksEntered: false, resultPublished: false,
    instructions: "Full syllabus. All chapters covered.",
    notes: "",
  },
  {
    id: 22, examId: "EXM-2026-022", examName: "Final Term Examination 2026",
    term: "Final Term", academicYear: "2026/27", examType: "Final Term",
    subject: "English", className: "Grade 6", section: "A",
    date: "2026-12-02", startTime: "10:00", endTime: "12:00", duration: 120,
    reportingTime: "09:45", room: "Room 101", seatCapacity: 35,
    invigilator: "Ramesh Adhikari", assistantInvigilator: "Kavita Joshi",
    fullMarks: 100, passMarks: 40, theoryMarks: 80, practicalMarks: 0, internalMarks: 20,
    subjectTeacher: "Sita Rai",
    status: "draft", marksEntered: false, resultPublished: false,
    instructions: "",
    notes: "",
  },
  // ── Final Term – Grade 9 A (December 2026, Draft) ────────────────────────
  {
    id: 23, examId: "EXM-2026-023", examName: "Final Term Examination 2026",
    term: "Final Term", academicYear: "2026/27", examType: "Final Term",
    subject: "Mathematics Secondary", className: "Grade 9", section: "A",
    date: "2026-12-01", startTime: "10:00", endTime: "12:00", duration: 120,
    reportingTime: "09:45", room: "Room 301", seatCapacity: 30,
    invigilator: "Kazi Fahim", assistantInvigilator: "Andrew Martin",
    fullMarks: 100, passMarks: 40, theoryMarks: 100, practicalMarks: 0, internalMarks: 0,
    subjectTeacher: "Kazi Fahim",
    status: "draft", marksEntered: false, resultPublished: false,
    instructions: "Full syllabus including calculus basics.",
    notes: "",
  },
  {
    id: 24, examId: "EXM-2026-024", examName: "Final Term Examination 2026",
    term: "Final Term", academicYear: "2026/27", examType: "Final Term",
    subject: "Account", className: "Grade 9", section: "A",
    date: "2026-12-03", startTime: "10:00", endTime: "12:00", duration: 120,
    reportingTime: "09:45", room: "Room 301", seatCapacity: 30,
    invigilator: "Binod Karki", assistantInvigilator: "Sita Rai",
    fullMarks: 100, passMarks: 40, theoryMarks: 80, practicalMarks: 0, internalMarks: 20,
    subjectTeacher: "Binod Karki",
    status: "draft", marksEntered: false, resultPublished: false,
    instructions: "Financial statements and ledger questions included.",
    notes: "",
  },
  {
    id: 25, examId: "EXM-2026-025", examName: "Final Term Examination 2026",
    term: "Final Term", academicYear: "2026/27", examType: "Final Term",
    subject: "English Advanced", className: "Grade 9", section: "A",
    date: "2026-12-04", startTime: "10:00", endTime: "12:00", duration: 120,
    reportingTime: "09:45", room: "Room 301", seatCapacity: 30,
    invigilator: "Sita Rai", assistantInvigilator: "Mira Shrestha",
    fullMarks: 100, passMarks: 40, theoryMarks: 80, practicalMarks: 0, internalMarks: 20,
    subjectTeacher: "Sita Rai",
    status: "draft", marksEntered: false, resultPublished: false,
    instructions: "Literature, language, and writing sections.",
    notes: "",
  },
];

// ─── Grade Scale ─────────────────────────────────────────────────────────────
export const GRADE_SCALE: GradeScale[] = [
  { id: 1, gradeName: "A+", gradePoint: 4.00, percentFrom: 90, percentUpto: 100, resultStatus: "Pass", comment: "Excellent",    colorLabel: "emerald", status: "active" },
  { id: 2, gradeName: "A",  gradePoint: 3.60, percentFrom: 80, percentUpto:  89, resultStatus: "Pass", comment: "Very Good",    colorLabel: "green",   status: "active" },
  { id: 3, gradeName: "B+", gradePoint: 3.20, percentFrom: 70, percentUpto:  79, resultStatus: "Pass", comment: "Good",         colorLabel: "teal",    status: "active" },
  { id: 4, gradeName: "B",  gradePoint: 2.80, percentFrom: 60, percentUpto:  69, resultStatus: "Pass", comment: "Satisfactory", colorLabel: "blue",    status: "active" },
  { id: 5, gradeName: "C+", gradePoint: 2.40, percentFrom: 50, percentUpto:  59, resultStatus: "Pass", comment: "Acceptable",   colorLabel: "cyan",    status: "active" },
  { id: 6, gradeName: "C",  gradePoint: 2.00, percentFrom: 40, percentUpto:  49, resultStatus: "Pass", comment: "Pass",         colorLabel: "amber",   status: "active" },
  { id: 7, gradeName: "F",  gradePoint: 0.00, percentFrom:  0, percentUpto:  39, resultStatus: "Fail", comment: "Fail",         colorLabel: "rose",    status: "active" },
];

// ─── Grade helper ─────────────────────────────────────────────────────────────
export function getGradeForPercent(pct: number): { grade: string; gradePoint: number; result: "Pass" | "Fail" } {
  const scale = GRADE_SCALE.find((g) => pct >= g.percentFrom && pct <= g.percentUpto);
  if (!scale) return { grade: "F", gradePoint: 0, result: "Fail" };
  return { grade: scale.gradeName, gradePoint: scale.gradePoint, result: scale.resultStatus };
}

// ─── Marks Entries (Exam 1 – Grade 6 A, Math Primary, First Term) ───────────
export const MARKS_ENTRIES: MarksEntry[] = [
  { id: 1, examId: 1, studentId: 101, studentName: "Aarav Sharma",        admissionNo: "ADM-2026-009", registrationNo: "REG-6-009", roll: 1, theoryMarks: 73, practicalMarks: null, internalMarks: 19, totalMarks: 92, percentage: 92, grade: "A+", gradePoint: 4.00, result: "Pass", remarks: "",        isAbsent: false },
  { id: 2, examId: 1, studentId: 102, studentName: "Anisha Karmacharya",  admissionNo: "ADM-2026-001", registrationNo: "REG-6-001", roll: 2, theoryMarks: 72, practicalMarks: null, internalMarks: 18, totalMarks: 90, percentage: 90, grade: "A+", gradePoint: 4.00, result: "Pass", remarks: "",        isAbsent: false },
  { id: 3, examId: 1, studentId: 103, studentName: "Prisha Shrestha",     admissionNo: "ADM-2026-003", registrationNo: "REG-6-003", roll: 3, theoryMarks: 66, practicalMarks: null, internalMarks: 17, totalMarks: 83, percentage: 83, grade: "A",  gradePoint: 3.60, result: "Pass", remarks: "",        isAbsent: false },
  { id: 4, examId: 1, studentId: 104, studentName: "Rohan Thapa",         admissionNo: "ADM-2026-002", registrationNo: "REG-6-002", roll: 4, theoryMarks: 60, practicalMarks: null, internalMarks: 14, totalMarks: 74, percentage: 74, grade: "B+", gradePoint: 3.20, result: "Pass", remarks: "",        isAbsent: false },
  { id: 5, examId: 1, studentId: 105, studentName: "Dipesh Gurung",       admissionNo: "ADM-2026-008", registrationNo: "REG-6-008", roll: 5, theoryMarks: 55, practicalMarks: null, internalMarks: 16, totalMarks: 71, percentage: 71, grade: "B+", gradePoint: 3.20, result: "Pass", remarks: "",        isAbsent: false },
  { id: 6, examId: 1, studentId: 106, studentName: "Sneha Adhikari",      admissionNo: "ADM-2026-010", registrationNo: "REG-6-010", roll: 6, theoryMarks: 48, practicalMarks: null, internalMarks: 12, totalMarks: 60, percentage: 60, grade: "B",  gradePoint: 2.80, result: "Pass", remarks: "",        isAbsent: false },
  { id: 7, examId: 1, studentId: 107, studentName: "Manav Poudel",        admissionNo: "ADM-2026-004", registrationNo: "REG-6-004", roll: 7, theoryMarks: 46, practicalMarks: null, internalMarks: 12, totalMarks: 58, percentage: 58, grade: "C+", gradePoint: 2.40, result: "Pass", remarks: "",        isAbsent: false },
  { id: 8, examId: 1, studentId: 108, studentName: "Nisha Tamang",        admissionNo: "ADM-2026-005", registrationNo: "REG-6-005", roll: 8, theoryMarks: 35, practicalMarks: null, internalMarks: 8,  totalMarks: 43, percentage: 43, grade: "C",  gradePoint: 2.00, result: "Pass", remarks: "",        isAbsent: false },
  { id: 9, examId: 1, studentId: 109, studentName: "Bikash Rai",          admissionNo: "ADM-2026-006", registrationNo: "REG-6-006", roll: 9, theoryMarks: 28, practicalMarks: null, internalMarks: 6,  totalMarks: 34, percentage: 34, grade: "F",  gradePoint: 0.00, result: "Fail", remarks: "Needs improvement", isAbsent: false },
  { id: 10, examId: 1, studentId: 110, studentName: "Sujata Magar",       admissionNo: "ADM-2026-007", registrationNo: "REG-6-007", roll: 10, theoryMarks: null, practicalMarks: null, internalMarks: null, totalMarks: null, percentage: null, grade: null, gradePoint: null, result: null, remarks: "Absent", isAbsent: true },
];

// ─── Exam Results (Grade 6 A – First Term) ───────────────────────────────────
const G6A_SUBJECTS: { subject: string; fullMarks: number }[] = [
  { subject: "Mathematics Primary", fullMarks: 100 },
  { subject: "English",             fullMarks: 100 },
  { subject: "Science Primary",     fullMarks: 100 },
  { subject: "Nepali",              fullMarks: 100 },
  { subject: "Social Studies",      fullMarks: 75  },
  { subject: "Computer Science",    fullMarks: 50  },
];

function mkResult(
  id: number, studentId: number, name: string, regNo: string, admNo: string, roll: number,
  marks: number[], rank: number, remarks: string,
): ExamResult {
  const subjectResults: SubjectResult[] = G6A_SUBJECTS.map((s, i) => {
    const pct = (marks[i] / s.fullMarks) * 100;
    const { grade, gradePoint } = getGradeForPercent(pct);
    return { subject: s.subject, fullMarks: s.fullMarks, obtainedMarks: marks[i], grade, gradePoint };
  });
  const totalFullMarks = G6A_SUBJECTS.reduce((sum, s) => sum + s.fullMarks, 0);
  const totalMarks = marks.reduce((a, b) => a + b, 0);
  const percentage = Math.round((totalMarks / totalFullMarks) * 10000) / 100;
  const gpa = Math.round(subjectResults.reduce((s, r) => s + r.gradePoint, 0) / subjectResults.length * 100) / 100;
  const { grade, result } = getGradeForPercent(percentage);
  return {
    id, studentId, studentName: name, registrationNo: regNo, admissionNo: admNo,
    className: "Grade 6", section: "A", roll,
    examTerm: "First Term", academicYear: "2026/27",
    subjectResults, totalMarks, totalFullMarks, percentage, gpa, grade, rank, result,
    published: true, publishedDate: "2026-07-01", teacherRemarks: remarks,
  };
}

export const EXAM_RESULTS: ExamResult[] = [
  mkResult(1, 101, "Aarav Sharma",       "REG-6-009", "ADM-2026-009", 1, [92, 88, 85, 80, 67, 46], 1, "Excellent performer. Keep it up!"),
  mkResult(2, 102, "Anisha Karmacharya", "REG-6-001", "ADM-2026-001", 2, [90, 85, 78, 82, 62, 44], 2, "Very good. Work on Science."),
  mkResult(3, 103, "Prisha Shrestha",    "REG-6-003", "ADM-2026-003", 3, [83, 80, 76, 74, 60, 42], 3, "Good performance overall."),
  mkResult(4, 104, "Rohan Thapa",        "REG-6-002", "ADM-2026-002", 4, [74, 78, 72, 68, 58, 38], 4, "Satisfactory. Must improve in CS."),
  mkResult(5, 105, "Dipesh Gurung",      "REG-6-008", "ADM-2026-008", 5, [71, 65, 68, 70, 55, 35], 5, "Needs to focus more on English."),
  mkResult(6, 106, "Sneha Adhikari",     "REG-6-010", "ADM-2026-010", 6, [60, 62, 58, 65, 50, 30], 6, "Average performance. Put more effort."),
  mkResult(7, 107, "Manav Poudel",       "REG-6-004", "ADM-2026-004", 7, [58, 55, 52, 60, 45, 28], 7, "Below average. Extra tutoring recommended."),
  mkResult(8, 108, "Nisha Tamang",       "REG-6-005", "ADM-2026-005", 8, [43, 50, 45, 48, 38, 25], 8, "Marginal pass. Needs significant improvement."),
  mkResult(9, 109, "Bikash Rai",         "REG-6-006", "ADM-2026-006", 9, [34, 40, 36, 42, 32, 20], 9, "Failed in some subjects. Urgent attention needed."),
  mkResult(10, 110, "Sujata Magar",      "REG-6-007", "ADM-2026-007", 10, [72, 60, 55, 58, 48, 34], 10, "Absent in main examination. Results based on internal."),
];

// ─── Exam Rooms ──────────────────────────────────────────────────────────────
export const EXAM_ROOMS: ExamRoom[] = [
  { id: 1, roomName: "Room 101",    capacity: 40, building: "Block A", floor: "Ground",      facilities: "Desks, Projector, Whiteboard"    },
  { id: 2, roomName: "Room 102",    capacity: 40, building: "Block A", floor: "Ground",      facilities: "Desks, Whiteboard"               },
  { id: 3, roomName: "Room 201",    capacity: 40, building: "Block A", floor: "First Floor", facilities: "Desks, Projector, AC"            },
  { id: 4, roomName: "Room 202",    capacity: 40, building: "Block A", floor: "First Floor", facilities: "Desks, AC"                       },
  { id: 5, roomName: "Room 301",    capacity: 35, building: "Block B", floor: "Ground",      facilities: "Desks, AC, CCTV"                 },
  { id: 6, roomName: "Lab A",       capacity: 30, building: "Block C", floor: "Ground",      facilities: "Lab Tables, Equipment, Sinks"    },
  { id: 7, roomName: "Computer Lab",capacity: 25, building: "Block C", floor: "First Floor", facilities: "Computers, AC, Projector"        },
  { id: 8, roomName: "Hall A",      capacity: 100,building: "Main",    floor: "Ground",      facilities: "Large Hall, AC, Stage, 100 seats"},
];

// ─── Conflict detection ───────────────────────────────────────────────────────
interface ScheduleConflict {
  id1: number; id2: number;
  type: "room" | "invigilator";
  detail: string;
}

export function detectScheduleConflicts(schedules: ExamSchedule[]): ScheduleConflict[] {
  const conflicts: ScheduleConflict[] = [];
  const active = schedules.filter((s) => s.status !== "cancelled");

  const roomMap   = new Map<string, ExamSchedule[]>();
  const invMap    = new Map<string, ExamSchedule[]>();

  for (const s of active) {
    const roomKey = `${s.date}|${s.startTime}|${s.room}`;
    const invKey  = `${s.date}|${s.startTime}|${s.invigilator}`;
    if (!roomMap.has(roomKey)) roomMap.set(roomKey, []);
    if (!invMap.has(invKey))   invMap.set(invKey, []);
    roomMap.get(roomKey)!.push(s);
    invMap.get(invKey)!.push(s);
  }

  for (const list of roomMap.values()) {
    if (list.length > 1) {
      for (let i = 0; i < list.length - 1; i++) {
        conflicts.push({ id1: list[i].id, id2: list[i + 1].id, type: "room", detail: list[i].room });
      }
    }
  }
  for (const list of invMap.values()) {
    if (list.length > 1) {
      for (let i = 0; i < list.length - 1; i++) {
        conflicts.push({ id1: list[i].id, id2: list[i + 1].id, type: "invigilator", detail: list[i].invigilator });
      }
    }
  }
  return conflicts;
}

const _conflicts = detectScheduleConflicts(EXAM_SCHEDULES);
export const EXAM_CONFLICT_IDS: Set<number> = new Set(_conflicts.flatMap((c) => [c.id1, c.id2]));
export const EXAM_CONFLICT_COUNT = _conflicts.length;

// ─── Stats ────────────────────────────────────────────────────────────────────
export const EXAM_STATS = {
  total:            EXAM_SCHEDULES.length,
  upcoming:         EXAM_SCHEDULES.filter((e) => ["scheduled", "published"].includes(e.status)).length,
  completed:        EXAM_SCHEDULES.filter((e) => e.status === "completed").length,
  resultsPublished: EXAM_SCHEDULES.filter((e) => e.resultPublished).length,
  pendingMarks:     EXAM_SCHEDULES.filter((e) => e.marksEntered === false && e.status === "completed").length,
  passRate:         Math.round(
    (EXAM_RESULTS.filter((r) => r.result === "Pass").length / EXAM_RESULTS.length) * 100,
  ),
  conflicts:        EXAM_CONFLICT_COUNT,
  gradeScales:      GRADE_SCALE.filter((g) => g.status === "active").length,
};

// ─── Options ─────────────────────────────────────────────────────────────────
export const EXAM_TYPE_OPTIONS: ExamType[] = [
  "Class Test", "Unit Test", "Mid Term", "Final Term", "Practical Exam", "Board Exam", "Mock Test",
];
export const EXAM_TERM_OPTIONS: ExamTerm[] = ["First Term", "Mid Term", "Final Term", "Annual"];
export const EXAM_STATUS_OPTIONS: ExamStatus[] = ["draft", "scheduled", "published", "completed", "cancelled"];
export const ACADEMIC_YEAR_OPTIONS = ["2026/27", "2025/26", "2024/25"];
export const CLASS_OPTIONS = [
  "Grade 1","Grade 2","Grade 3","Grade 4","Grade 5",
  "Grade 6","Grade 7","Grade 8","Grade 9","Grade 10",
];
export const SECTION_OPTIONS = ["A", "B", "C", "D"];
export const SUBJECT_OPTIONS = [
  "Mathematics Primary", "Mathematics Middle", "Mathematics Secondary",
  "Optional Mathematics", "English", "English Advanced",
  "Science Primary", "Science Middle", "Physics", "Chemistry", "Biology",
  "Nepali", "Social Studies", "Computer Science", "Account",
  "Economics", "Geography", "History", "Civics",
];
export const INVIGILATOR_OPTIONS = [
  "Andrew Martin", "Kazi Fahim", "Sita Rai", "Ramesh Adhikari",
  "Sunita Gurung", "Kavita Joshi", "Binod Karki", "Mira Shrestha",
];
export const ROOM_OPTIONS = EXAM_ROOMS.map((r) => r.roomName);
