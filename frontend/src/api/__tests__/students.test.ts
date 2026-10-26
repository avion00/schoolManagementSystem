import { describe, expect, it } from "vitest";

import { examView, guardianInfo, mapStudent, toGender, toRoll } from "../students";

const apiStudent = {
  id: "8b1f", first_name: "Asha", last_name: "Rai", full_name: "Asha Rai", gender: "female",
  date_of_birth: "2012-03-10", phone: "98", email: "a@x.test", address: "Ktm",
  admission_number: "ADM-1", registration_number: "REG-1", roll_number: "07",
  academic_year: "y1", academic_year_name: "2026-2027", class_level: "c1", class_level_name: "Grade 8",
  section: "s1", section_name: "A", primary_guardian_name: "Hari Rai", has_login: true,
  photo: null, status: "active", is_active: true,
} as const;

describe("student mapping", () => {
  it("maps list rows to the page model", () => {
    const s = mapStudent(apiStudent as never);
    expect(s).toMatchObject({
      id: "8b1f", name: "Asha Rai", gender: "Female", className: "Grade 8", classId: "c1",
      section: "A", roll: 7, parentName: "Hari Rai", registrationNo: "REG-1", photoUrl: null,
    });
  });

  it("handles blanks", () => {
    expect(toGender("")).toBe("");
    expect(toRoll("")).toBeNull();
    expect(toRoll(undefined)).toBeNull();
  });

  it("splits guardians by relation", () => {
    const g = guardianInfo([
      { link_id: "1", guardian: "g1", full_name: "Hari", relation: "father", phone: "1", email: "", occupation: "Farmer" },
      { link_id: "2", guardian: "g2", full_name: "Kiran", relation: "uncle", phone: "2", email: "", occupation: "" },
    ] as never, "Hari 1");
    expect(g.fatherName).toBe("Hari");
    expect(g.guardianName).toBe("Kiran");
    expect(g.guardianRelation).toBe("Uncle");
    expect(g.motherName).toBe("");
  });

  it("builds exam view and rank from a result", () => {
    const v = examView({
      exam_id: "e", exam: "Term 1", is_published: true, obtained: 150, full: 200, percentage: 75,
      grade: "B", gpa: 3, result: "pass", rank: 2, section_rank: 1,
      subjects: [
        { subject: "Maths", full_marks: 100, marks_obtained: 90, grade: "A", grade_point: 4, result: "pass" },
        { subject: "Science", full_marks: 100, marks_obtained: 60, grade: "B", grade_point: 3, result: "pass" },
      ],
    });
    expect(v.meta).toMatchObject({ name: "Term 1", percentage: 75, result: "Pass", gpa: 3 });
    expect(v.rank).toMatchObject({ classRank: 2, sectionRank: 1, overallPerformance: "Good" });
    expect(v.rank?.strengths[0]).toBe("Maths");
    expect(v.rank?.improvements).toEqual(["Science"]);
  });

  it("has no exam view without results", () => {
    expect(examView(undefined)).toEqual({ meta: null, scores: [], rank: null });
  });
});
