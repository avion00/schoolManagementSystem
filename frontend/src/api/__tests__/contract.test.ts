/**
 * Contract tests: run the real API module against a live backend.
 *   CONTRACT_API=http://127.0.0.1:8000/api/v1 npx vitest run src/api/__tests__/contract.test.ts
 * Skipped unless CONTRACT_API is set (CI runs unit tests only).
 */
import { beforeAll, describe, expect, it } from "vitest";

const BASE = process.env.CONTRACT_API;
const run = BASE ? describe : describe.skip;

async function signIn(email = "principal@demo.school") {
  const res = await fetch(`${BASE}/auth/login/`, {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password: "Passw0rd!2024" }),
  });
  if (res.status !== 200) throw new Error(`login ${res.status}`);
  const cookies = res.headers.getSetCookie().map((c) => c.split(";")[0]).join("; ");
  const { api } = await import("@/lib/api");
  api.defaults.baseURL = BASE;
  api.defaults.headers.common.Cookie = cookies;
}

run("contract: students", () => {
  beforeAll(() => signIn());

  it("lists and maps students", async () => {
    const { getAll } = await import("../http");
    const { mapStudent } = await import("../students");
    const rows = (await getAll<never>("/students/")).map(mapStudent);
    expect(rows.length).toBeGreaterThan(0);
    for (const s of rows) {
      expect(typeof s.id).toBe("string");
      expect(s.name).toBeTruthy();
      expect(s.className).toBeTruthy();
    }
  });

  it("builds a full student detail view", async () => {
    const { getAll } = await import("../http");
    const { fetchStudentDetail } = await import("../students");
    const [first] = await getAll<{ id: string }>("/students/");
    const d = await fetchStudentDetail(first.id, true);
    expect(d.student.id).toBe(first.id);
    expect(d.attendanceSummary.totalDays).toBeGreaterThanOrEqual(0);
    expect(d.fees).not.toBeNull();
    expect(Array.isArray(d.activities)).toBe(true);
  });
});

run("contract: parents", () => {
  beforeAll(() => signIn());

  it("lists parents with linked children and builds a detail view", async () => {
    const { getAll } = await import("../http");
    const { fetchParentDetail, mapParent } = await import("../parents");
    const parents = (await getAll<never>("/guardians/")).map(mapParent);
    expect(parents.length).toBeGreaterThan(0);
    const withKids = parents.find((p) => p.linkedChildren.length > 0)!;
    expect(withKids.linkedChildren[0].studentId).toBeTruthy();
    const d = await fetchParentDetail(withKids.id, true);
    expect(d.childrenAcademic.length).toBe(withKids.linkedChildren.length);
    expect(d.summaryCards.dueFees).not.toBeNull();
  });
});

run("contract: teachers", () => {
  beforeAll(() => signIn());

  it("lists teachers with salary data for payroll users and builds a detail view", async () => {
    const { getAll } = await import("../http");
    const { fetchTeacherDetail, mapTeacher } = await import("../teachers");
    const teachers = (await getAll<never>("/teachers/")).map((t) => mapTeacher(t));
    expect(teachers.length).toBeGreaterThan(0);
    const demo = teachers.find((t) => t.employeeId === "EMP-001") ?? teachers[0];
    const d = await fetchTeacherDetail(demo.id, true);
    expect(d.teacher.id).toBe(demo.id);
    expect(d.attendanceSummary.totalWorkingDays).toBeGreaterThanOrEqual(0);
    expect(Array.isArray(d.todaySchedule)).toBe(true);
    expect(d.assignments.length).toBeGreaterThan(0);
  });
});

run("contract: classes", () => {
  beforeAll(() => signIn());

  it("lists classes with sections/curriculum and builds a class detail view", async () => {
    const { getAll } = await import("../http");
    const { fetchClassDetail } = await import("../classes");
    const classes = await getAll<{ id: string; name: string }>("/academics/class-levels/");
    const grade8 = classes.find((c) => c.name === "Grade 8") ?? classes[0];
    const d = await fetchClassDetail(grade8.id, true);
    expect(d.cls.className).toBe(grade8.name);
    expect(d.cls.sections.length).toBeGreaterThan(0);
    expect(d.students.length).toBe(d.cls.totalStudents);
    expect(d.fees).not.toBeNull();
    expect(Array.isArray(d.timetable)).toBe(true);
  });
});

run("contract: subjects", () => {
  beforeAll(() => signIn());

  it("lists subjects and builds a subject detail view", async () => {
    const { fetchSubjectDetail } = await import("../subjects");
    const { getAll } = await import("../http");
    const subjects = await getAll<{ id: string; code: string }>("/academics/subjects/");
    const d = await fetchSubjectDetail(subjects[0].id);
    expect(d.subject.subjectCode).toBe(subjects[0].code);
    expect(Array.isArray(d.classMappings)).toBe(true);
  });
});

run("contract: class routine", () => {
  beforeAll(() => signIn());

  it("maps timetable entries and period slots", async () => {
    const { getAll } = await import("../http");
    const { mapEntry, mapSlot } = await import("../routine");
    const entries = (await getAll<never>("/timetable/entries/")).map(mapEntry);
    const slots = (await getAll<never>("/timetable/periods/")).map(mapSlot);
    expect(entries.length).toBeGreaterThan(0);
    expect(slots.some((s) => s.isBreak)).toBe(true);
    expect(entries[0].startTime).toMatch(/^\d\d:\d\d$/);
    expect(["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]).toContain(entries[0].day);
  });
});

run("contract: attendance", () => {
  beforeAll(() => signIn());

  it("serves the shapes the attendance hooks read", async () => {
    const { get, getAll } = await import("../http");
    const { toStatus } = await import("../attendance");
    const stats = await get<{ today: Record<string, number>; monthly_trend: { month: string; rate: number | null }[] }>("/attendance/stats/");
    expect(stats.monthly_trend).toHaveLength(6);
    expect(typeof stats.today.present).toBe("number");
    const classes = await get<{ rows: { class_level_name: string; students: number }[] }>("/attendance/class-report/");
    expect(classes.rows.length).toBeGreaterThan(0);
    const summary = await get<{ by_status: Record<string, number>; rows: { marked: number; rate: number }[] }>(
      "/attendance/student-summary/", { date_from: "2020-01-01" });
    for (const r of summary.rows) expect(r.marked).toBeGreaterThan(0);
    for (const k of Object.keys(summary.by_status)) expect(toStatus(k)).toBeDefined();
    const staff = await get<{ days: number; rows: unknown[] }>("/staff-attendance/monthly/", { year: 2026, month: 10 });
    expect(staff.days).toBe(31);
    await getAll("/holidays/", { start_date__lte: "2026-12-31", end_date__gte: "2026-01-01" });
  });
});

run("contract: exams", () => {
  beforeAll(() => signIn());

  it("maps exams, papers, scales, marks sheet, results and admit cards", async () => {
    const { get, getAll } = await import("../http");
    const { mapExam, mapPaper, mapScale } = await import("../exams");
    const exams = (await getAll<never>("/exams/exams/")).map(mapExam);
    expect(exams.length).toBeGreaterThan(0);
    const papers = (await getAll<never>("/exams/exam-subjects/")).map((p) => mapPaper(p, exams[0], new Map()));
    expect(papers[0].fullMarks).toBeGreaterThan(0);
    expect(papers[0].startTime === "" || /^\d\d:\d\d$/.test(papers[0].startTime)).toBe(true);
    const scales = (await getAll<never>("/exams/grade-scales/")).map(mapScale);
    expect(scales[0].bands.every((b) => b.percentUpto >= b.percentFrom)).toBe(true);
    const sheet = await get<{ rows: unknown[]; components: object }>("/exams/marks/sheet/", { exam_subject: papers[0].id });
    expect(Array.isArray(sheet.rows)).toBe(true);
    const paper = papers[0];
    const results = await get<{ rows: { result: string }[] }>(`/exams/exams/${paper.examRecordId}/results/`, { class_level: paper.classLevelId });
    for (const r of results.rows) expect(["pass", "fail", "absent", "incomplete"]).toContain(r.result);
    const admit = await get<{ cards: { symbol_number: string; date_of_birth: string | null }[] }>(
      `/exams/exams/${paper.examRecordId}/admit-cards/`, { class_level: paper.classLevelId });
    expect(admit.cards.every((c) => "date_of_birth" in c)).toBe(true);
    await get(`/exams/exam-subjects/conflicts/`, { exam: paper.examRecordId });
  });
});

run("contract: billing", () => {
  beforeAll(() => signIn());

  it("maps invoices, payments, fee roster, structures, expenses, vendors and payroll", async () => {
    const { get, getAll } = await import("../http");
    const b = await import("../billing");
    const invoices = (await getAll<never>("/fees/invoices/")).map(b.mapInvoice);
    expect(invoices.length).toBeGreaterThan(0);
    expect(invoices.every((i) => Math.abs(i.amount - i.discount - i.paid - i.balance) < 0.01)).toBe(true);
    const payments = (await getAll<never>("/fees/payments/")).map(b.mapPayment);
    expect(payments.every((p) => p.paymentId && p.method)).toBe(true);
    const roster = await get<{ results: { status: string }[] }>("/fees/student-fees/", { page_size: 5 });
    for (const r of roster.results) expect(["paid", "partial", "due", "overdue", "waived", "no_fees"]).toContain(r.status);
    expect((await getAll<never>("/fees/fee-structures/")).map(b.mapStructure).length).toBeGreaterThan(0);
    const summary = await get<{ collected_by_method: object; outstanding: number }>("/fees/reports/summary/");
    expect(typeof summary.outstanding).toBe("number");
    const finance = await get<{ trend: unknown[]; payroll_due: number }>("/finance/summary/", { months: 6 });
    expect(finance.trend).toHaveLength(6);
    expect((await getAll<never>("/finance/expenses/")).map(b.mapExpense).length).toBeGreaterThan(0);
    expect((await getAll<never>("/finance/vendors/")).map(b.mapVendor).length).toBeGreaterThan(0);
    const runs = (await getAll<never>("/finance/payroll-runs/")).map(b.mapRun);
    const slips = await get<{ payslips: never[] }>(`/finance/payroll-runs/${runs[0].id}/payslips/`);
    expect(slips.payslips.map(b.mapPayslip).every((p) => p.netSalary >= 0)).toBe(true);
    const fees = await get<{ currency_symbol: string; payment_methods: Record<string, boolean> }>("/settings/fees/");
    expect(fees.payment_methods).toHaveProperty("cheque");
  });
});
