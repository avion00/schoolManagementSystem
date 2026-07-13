import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";

import { BarChartCard } from "@/components/charts/BarChartCard";
import { DonutChart } from "@/components/charts/DonutChart";
import { Reveal } from "@/components/motion";
import { TeacherInsightTabs, type InsightTabOption } from "@/components/teacher/TeacherInsightTabs";
import type { StudentInsightEntry } from "@/components/teacher/StudentRiskCard";
import {
  assignedClasses,
  assignedStudents,
  computeRiskLevel,
  lowAttendanceStudents,
  marksForStudent,
  mostImprovedStudents,
  riskDistribution,
  topStudents,
  weakStudents,
} from "@/data/teacherDashboardData";

type Tab = "needs-attention" | "low-attendance" | "missing-homework" | "low-marks" | "top" | "most-improved";
const TABS: InsightTabOption[] = [
  { value: "needs-attention", label: "Needs Attention" },
  { value: "low-attendance", label: "Low Attendance" },
  { value: "missing-homework", label: "Missing Homework" },
  { value: "low-marks", label: "Low Marks" },
  { value: "top", label: "Top Students" },
  { value: "most-improved", label: "Most Improved" },
];

function findStudent(id: number) {
  return assignedStudents.find((s) => s.id === id);
}

/** Merges what used to be 4 separate pages (Weak/Top/Low-attendance/Performance) into one tabbed workspace. */
export function TeacherInsights() {
  const [searchParams] = useSearchParams();
  const initialTab = (searchParams.get("tab") as Tab) ?? "needs-attention";
  const [tab, setTab] = useState<Tab>(TABS.some((t) => t.value === initialTab) ? initialTab : "needs-attention");

  const entriesByTab = useMemo<Record<Tab, StudentInsightEntry[]>>(() => ({
    "needs-attention": weakStudents.map((w) => ({
      studentId: w.studentId, name: w.name, className: w.className, section: w.section,
      reason: w.reasons.join(", "), riskLevel: w.riskLevel, avgMarks: w.avgMarks,
      attendancePercentage: findStudent(w.studentId)?.attendancePercentage,
      missingHomework: findStudent(w.studentId)?.pendingHomework,
      guardian: findStudent(w.studentId)?.guardian,
    })),
    "low-attendance": lowAttendanceStudents.map((s) => ({
      studentId: s.studentId, name: s.name, className: s.className, section: s.section,
      reason: `${s.absentDays} absent days this month · last absent ${s.lastAbsentDate}`,
      attendancePercentage: s.attendancePercentage, guardian: s.guardian,
      riskLevel: findStudent(s.studentId) ? computeRiskLevel(findStudent(s.studentId)!) : undefined,
    })),
    "missing-homework": assignedStudents.filter((s) => s.pendingHomework > 0).map((s) => ({
      studentId: s.id, name: s.name, className: s.className, section: s.section,
      reason: `${s.pendingHomework} assignment${s.pendingHomework !== 1 ? "s" : ""} missing`,
      missingHomework: s.pendingHomework, attendancePercentage: s.attendancePercentage,
      guardian: s.guardian, riskLevel: computeRiskLevel(s),
    })),
    "low-marks": assignedStudents.filter((s) => marksForStudent(s) < 65).map((s) => ({
      studentId: s.id, name: s.name, className: s.className, section: s.section,
      reason: `Average marks ${marksForStudent(s)} — below class target`,
      avgMarks: marksForStudent(s), attendancePercentage: s.attendancePercentage,
      guardian: s.guardian, riskLevel: computeRiskLevel(s),
    })),
    top: topStudents.map((s) => ({
      studentId: s.studentId, name: s.name, className: s.className, section: s.section,
      reason: s.badge, avgMarks: s.avgMarks, attendancePercentage: s.attendancePercentage,
    })),
    "most-improved": mostImprovedStudents.map((s) => ({
      studentId: s.studentId, name: s.name, className: s.className, section: s.section,
      reason: "Most improved this term", avgMarks: s.avgMarks, attendancePercentage: s.attendancePercentage,
    })),
  }), []);

  const classInsightData = assignedClasses.map((c) => {
    const students = assignedStudents.filter((s) => s.classId === c.id);
    const avgMarks = students.length ? Math.round(students.reduce((sum, s) => sum + marksForStudent(s), 0) / students.length) : 0;
    const homeworkDone = students.filter((s) => s.pendingHomework === 0).length;
    return {
      name: `${c.className}-${c.section}`,
      attendance: c.attendanceRate,
      avgMarks,
      homeworkCompletion: students.length ? Math.round((homeworkDone / students.length) * 100) : 100,
    };
  });

  return (
    <div className="space-y-4">
      <Reveal>
        <div>
          <h1 className="text-lg font-semibold tracking-tight text-foreground">Student Insights</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">Everything about student risk, attendance, and performance — in one place.</p>
        </div>
      </Reveal>

      <Reveal delay={60} className="grid gap-4 lg:grid-cols-3">
        <DonutChart title="Risk Distribution" subtitle="Across all assigned classes" data={riskDistribution} centerLabel="students" />
        <BarChartCard
          title="Attendance vs Performance"
          subtitle="By class"
          data={classInsightData}
          xKey="name"
          series={[{ key: "attendance", label: "Attendance %" }, { key: "avgMarks", label: "Avg marks" }]}
          height={224}
        />
        <BarChartCard
          title="Homework Completion"
          subtitle="% of students with no pending homework"
          data={classInsightData}
          xKey="name"
          series={[{ key: "homeworkCompletion", label: "Completion %" }]}
          height={224}
        />
      </Reveal>

      <Reveal delay={100}>
        <TeacherInsightTabs
          tabs={TABS}
          active={tab}
          onChange={(v) => setTab(v as Tab)}
          entries={entriesByTab[tab]}
          emptyLabel="No students in this view"
        />
      </Reveal>
    </div>
  );
}
