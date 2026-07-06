import { useState } from "react";
import { useParams } from "react-router-dom";

import { SlidingTabs } from "@/components/motion";
import { TeacherActivityTimeline } from "@/components/teachers/details/TeacherActivityTimeline";
import { TeacherAttendanceCard } from "@/components/teachers/details/TeacherAttendanceCard";
import { TeacherContactCard } from "@/components/teachers/details/TeacherContactCard";
import { TeacherDocumentsCard } from "@/components/teachers/details/TeacherDocumentsCard";
import { TeacherEmploymentInfoCard } from "@/components/teachers/details/TeacherEmploymentInfoCard";
import { TeacherPayrollCard } from "@/components/teachers/details/TeacherPayrollCard";
import { TeacherPerformanceCard } from "@/components/teachers/details/TeacherPerformanceCard";
import { TeacherPersonalInfoCard } from "@/components/teachers/details/TeacherPersonalInfoCard";
import { TeacherProfileHero } from "@/components/teachers/details/TeacherProfileHero";
import { TeacherScheduleCard } from "@/components/teachers/details/TeacherScheduleCard";
import { TEACHERS } from "@/data/teachersData";
import { TEACHER_DETAIL_MOCK } from "@/data/teacherDetailsData";

const TABS = [
  { value: "overview",    label: "Overview"    },
  { value: "employment",  label: "Employment"  },
  { value: "payroll",     label: "Payroll"     },
  { value: "documents",   label: "Documents"   },
  { value: "activity",    label: "Activity"    },
];

export function TeacherDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const [tab, setTab] = useState("overview");

  const teacher = TEACHERS.find((t) => t.id === Number(id));

  if (!teacher) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-muted-foreground">
        <p className="text-2xl font-bold text-foreground">Teacher not found</p>
        <p className="mt-2 text-sm">No teacher with ID {id} exists in the system.</p>
      </div>
    );
  }

  const mock = TEACHER_DETAIL_MOCK;

  return (
    <div className="space-y-5">
      <TeacherProfileHero teacher={teacher} />

      <SlidingTabs value={tab} onValueChange={setTab} options={TABS} />

      {/* ── Overview ─────────────────────────────────────────────── */}
      {tab === "overview" && (
        <div className="grid gap-5 lg:grid-cols-[2fr_1fr]">
          <div className="space-y-5">
            <TeacherPersonalInfoCard teacher={teacher} extra={mock.personalExtra} />
            <TeacherContactCard teacher={teacher} extra={mock.personalExtra} />
          </div>
          <div className="space-y-5">
            <TeacherScheduleCard schedule={mock.todaySchedule} />
          </div>
        </div>
      )}

      {/* ── Employment ───────────────────────────────────────────── */}
      {tab === "employment" && (
        <div className="grid gap-5 lg:grid-cols-[1fr_1fr]">
          <TeacherEmploymentInfoCard teacher={teacher} extra={mock.employmentExtra} />
          <div className="space-y-5">
            <TeacherAttendanceCard summary={mock.attendanceSummary} monthly={mock.attendanceMonthly} />
            <TeacherPerformanceCard perf={mock.performance} />
          </div>
        </div>
      )}

      {/* ── Payroll ──────────────────────────────────────────────── */}
      {tab === "payroll" && (
        <div className="mx-auto max-w-2xl">
          <TeacherPayrollCard payroll={mock.payroll} history={mock.monthlyPayHistory} />
        </div>
      )}

      {/* ── Documents ────────────────────────────────────────────── */}
      {tab === "documents" && (
        <div className="mx-auto max-w-2xl">
          <TeacherDocumentsCard documents={mock.documents} />
        </div>
      )}

      {/* ── Activity ─────────────────────────────────────────────── */}
      {tab === "activity" && (
        <div className="mx-auto max-w-2xl">
          <TeacherActivityTimeline activities={mock.activities} />
        </div>
      )}
    </div>
  );
}
