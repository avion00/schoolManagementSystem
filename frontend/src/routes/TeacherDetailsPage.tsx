import { useState } from "react";
import { useParams } from "react-router-dom";

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
import { PortalLoginStrip } from "@/components/people/PortalLoginStrip";
import { PremiumTabs } from "@/components/ui/PremiumTabs";
import { errorMessage } from "@/api/http";
import { useTeacherDetail } from "@/api/teachers";
import { Button } from "@/components/ui/button";
import { PremiumCard } from "@/components/ui/PremiumCard";
import { PremiumEmptyState } from "@/components/ui/PremiumEmptyState";
import { PremiumSkeleton } from "@/components/ui/PremiumSkeleton";
import { useAuth } from "@/lib/auth";

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

  const { hasPermission } = useAuth();
  const canSeePayroll = hasPermission("payroll.manage");
  const detail = useTeacherDetail(id, canSeePayroll);
  if (detail.isLoading) return <PremiumSkeleton className="h-96 w-full rounded-2xl" />;
  const notFound = (detail.error as { response?: { status?: number } } | null)?.response?.status === 404;
  if (detail.isError && !notFound) {
    return <PremiumEmptyState title="Couldn't load this teacher" description={errorMessage(detail.error)}
      action={<Button size="sm" variant="outline" onClick={() => detail.refetch()}>Try again</Button>} />;
  }
  const mock = detail.data;
  const teacher = mock?.teacher;

  if (!teacher || !mock) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-muted-foreground">
        <p className="text-2xl font-bold text-foreground">Teacher not found</p>
        <p className="mt-2 text-sm">No teacher with ID {id} exists in the system.</p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <TeacherProfileHero teacher={teacher} />

      {id && <PortalLoginStrip kind="teachers" id={id} />}
      <PremiumTabs value={tab} onValueChange={setTab} options={TABS} />

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
            {mock.performance ? (
              <TeacherPerformanceCard perf={mock.performance} />
            ) : (
              <PremiumCard className="p-5">
                <PremiumEmptyState title="No performance reviews yet" className="py-6" />
              </PremiumCard>
            )}
          </div>
        </div>
      )}

      {/* ── Payroll ──────────────────────────────────────────────── */}
      {tab === "payroll" && (
        <div className="mx-auto max-w-2xl">
          {mock.payroll ? (
            <TeacherPayrollCard payroll={mock.payroll} history={mock.monthlyPayHistory} />
          ) : (
            <PremiumCard className="p-5">
              <PremiumEmptyState
                title={canSeePayroll ? "No salary set up" : "Payroll is restricted"}
                description={canSeePayroll ? "Add a salary structure from the edit form." : "You need payroll access to see salary details."}
                className="py-6" />
            </PremiumCard>
          )}
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
