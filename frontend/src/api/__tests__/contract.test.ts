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
