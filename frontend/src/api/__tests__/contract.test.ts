/**
 * Contract tests: run the real API module against a live backend.
 *   CONTRACT_API=http://127.0.0.1:8000/api/v1 npx vitest run src/api/__tests__/contract.test.ts
 * Skipped unless CONTRACT_API is set (CI runs unit tests only).
 */
import { beforeAll, describe, expect, it } from "vitest";

const BASE = process.env.CONTRACT_API;
const run = BASE ? describe : describe.skip;

run("contract: students", () => {
  beforeAll(async () => {
    const res = await fetch(`${BASE}/auth/login/`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "principal@demo.school", password: "Passw0rd!2024" }),
    });
    expect(res.status).toBe(200);
    const cookies = res.headers.getSetCookie().map((c) => c.split(";")[0]).join("; ");
    const { api } = await import("@/lib/api");
    api.defaults.baseURL = BASE;
    api.defaults.headers.common.Cookie = cookies;
  });

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
