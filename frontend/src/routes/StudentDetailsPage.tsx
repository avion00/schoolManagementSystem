import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";

import { AcademicInfoCard } from "@/components/students/details/AcademicInfoCard";
import { ContactAddressCard } from "@/components/students/details/ContactAddressCard";
import { GuardianInfoCard } from "@/components/students/details/GuardianInfoCard";
import { PersonalInfoCard } from "@/components/students/details/PersonalInfoCard";
import { StudentActivityTimeline } from "@/components/students/details/StudentActivityTimeline";
import { StudentAttendanceCard } from "@/components/students/details/StudentAttendanceCard";
import { StudentAwardsCard } from "@/components/students/details/StudentAwardsCard";
import { StudentDocumentsCard } from "@/components/students/details/StudentDocumentsCard";
import { StudentFeesCard } from "@/components/students/details/StudentFeesCard";
import { StudentProfileHero } from "@/components/students/details/StudentProfileHero";
import { StudentRankCard } from "@/components/students/details/StudentRankCard";
import { StudentRemarksCard } from "@/components/students/details/StudentRemarksCard";
import { StudentScoresCard } from "@/components/students/details/StudentScoresCard";
import { StudentTimetableCard } from "@/components/students/details/StudentTimetableCard";
import { Reveal } from "@/components/motion";
import { Button } from "@/components/ui/button";
import { DetailCard } from "@/components/ui/DetailCard";
import { PremiumCard } from "@/components/ui/PremiumCard";
import { PremiumTabs } from "@/components/ui/PremiumTabs";
import { errorMessage } from "@/api/http";
import { useStudentDetail } from "@/api/students";
import { PremiumEmptyState } from "@/components/ui/PremiumEmptyState";
import { PremiumSkeleton } from "@/components/ui/PremiumSkeleton";
import { useAuth } from "@/lib/auth";

/* ── Health / Transport / Hostel mini-cards ─────────────────────────────── */
import { Heart, Bus, Building2, type LucideIcon } from "lucide-react";

function MiniInfoCard({
  icon: Icon,
  title,
  rows,
}: {
  icon: LucideIcon;
  title: string;
  rows: { label: string; value: string }[];
}) {
  return (
    <DetailCard icon={Icon} title={title}>
      <div className="grid grid-cols-2 gap-x-6 gap-y-3">
        {rows.map(({ label, value }) => (
          <div key={label}>
            <p className="text-[10.5px] font-semibold uppercase tracking-wide text-muted-foreground">{label}</p>
            <p className="mt-0.5 text-sm font-medium text-foreground">{value || "—"}</p>
          </div>
        ))}
      </div>
    </DetailCard>
  );
}

/* ── Tab options ─────────────────────────────────────────────────────────── */

const TABS = [
  { value: "overview",   label: "Overview"   },
  { value: "academics",  label: "Academics"  },
  { value: "fees",       label: "Fees"       },
  { value: "documents",  label: "Documents"  },
  { value: "activity",   label: "Activity"   },
];

/* ── Page ────────────────────────────────────────────────────────────────── */

export function StudentDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [tab, setTab] = useState("overview");

  const { hasPermission } = useAuth();
  const canSeeFees = hasPermission("fee.view");
  const detail = useStudentDetail(id, canSeeFees);

  if (detail.isLoading) {
    return (
      <div className="space-y-4">
        <PremiumSkeleton className="h-40 w-full rounded-2xl" />
        <PremiumSkeleton className="h-10 w-80 rounded-xl" />
        <div className="grid gap-4 lg:grid-cols-3">
          <PremiumSkeleton className="h-72 rounded-2xl lg:col-span-2" />
          <PremiumSkeleton className="h-72 rounded-2xl" />
        </div>
      </div>
    );
  }
  const notFound = (detail.error as { response?: { status?: number } } | null)?.response?.status === 404;
  if (detail.isError && !notFound) {
    return (
      <PremiumEmptyState
        title="Couldn't load this student"
        description={errorMessage(detail.error)}
        action={<Button size="sm" variant="outline" onClick={() => detail.refetch()}>Try again</Button>}
      />
    );
  }
  const mock = detail.data;
  const student = mock?.student;

  /* ── Not found ─────────────────────────────────────────────────────── */
  if (!student || !mock) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <PremiumCard className="w-full max-w-md p-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-muted">
            <ArrowLeft className="h-7 w-7 text-muted-foreground" />
          </div>
          <h2 className="text-lg font-bold text-foreground">Student not found</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            No student exists with ID {id}. The record may have been removed or the link is incorrect.
          </p>
          <Button className="mt-5 gap-2" onClick={() => navigate("/students")}>
            <ArrowLeft className="h-4 w-4" />
            Back to Students
          </Button>
        </PremiumCard>
      </div>
    );
  }

  /* ── Page ────────────────────────────────────────────────────────────── */
  return (
    <div className="space-y-4">

      {/* Hero */}
      <Reveal delay={0}>
        <StudentProfileHero student={student} mock={mock} />
      </Reveal>

      {/* Tabs */}
      <Reveal delay={60}>
        <PremiumTabs value={tab} onValueChange={(v) => setTab(v)} options={TABS} />
      </Reveal>

      {/* ── Overview ───────────────────────────────────────────────────── */}
      {tab === "overview" && (
        <Reveal delay={120}>
          <div className="grid gap-4 lg:grid-cols-3">
            {/* Left — 2 cols */}
            <div className="space-y-4 lg:col-span-2">
              <PersonalInfoCard student={student} mock={mock} />
              <GuardianInfoCard guardian={mock.guardian} />
              <ContactAddressCard contact={mock.contact} />
            </div>

            {/* Right — 1 col */}
            <div className="space-y-4">
              <AcademicInfoCard student={student} mock={mock} />

              {/* Attendance mini */}
              <PremiumCard className="p-5">
                <p className="mb-3 text-sm font-semibold text-foreground">Attendance</p>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-extrabold text-foreground">
                      {mock.attendanceSummary.presentPercent.toFixed(1)}%
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {mock.attendanceSummary.present} present · {mock.attendanceSummary.absent} absent
                    </p>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => setTab("academics")}>
                    Details
                  </Button>
                </div>
                <div className="mt-3 h-2 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-emerald-500 transition-all"
                    style={{ width: `${mock.attendanceSummary.presentPercent}%` }}
                  />
                </div>
              </PremiumCard>

              {/* Fee mini */}
              {mock.fees && (
              <PremiumCard className="p-5">
                <p className="mb-3 text-sm font-semibold text-foreground">Fee Status</p>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-extrabold text-foreground">
                      {mock.fees.paid.toLocaleString()}
                      <span className="text-sm font-normal text-muted-foreground"> / {mock.fees.totalFee.toLocaleString()}</span>
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Due: {mock.fees.due.toLocaleString()} · {mock.fees.status}
                    </p>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => setTab("fees")}>
                    Details
                  </Button>
                </div>
                <div className="mt-3 h-2 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-blue-500 transition-all"
                    style={{ width: `${mock.fees.totalFee ? Math.round((mock.fees.paid / mock.fees.totalFee) * 100) : 0}%` }}
                  />
                </div>
              </PremiumCard>
              )}

              {/* Health */}
              <MiniInfoCard
                icon={Heart}
                title="Health"
                rows={[
                  { label: "Blood Group", value: mock.health.bloodGroup },
                  { label: "Height",      value: mock.health.height },
                  { label: "Weight",      value: mock.health.weight },
                  { label: "Allergies",   value: mock.health.allergies.join(", ") || "None" },
                  { label: "Doctor",      value: mock.health.doctorName },
                  { label: "Doctor Ph.",  value: mock.health.doctorPhone },
                ]}
              />

              {/* Transport */}
              <DetailCard icon={Bus} title="Transport">
                <p className="text-sm text-muted-foreground">Transport isn't set up for this school yet.</p>
              </DetailCard>

              {/* Hostel */}
              <DetailCard icon={Building2} title="Hostel">
                <p className="text-sm text-muted-foreground">Hostel isn't set up for this school yet.</p>
              </DetailCard>
            </div>
          </div>
        </Reveal>
      )}

      {/* ── Academics ─────────────────────────────────────────────────── */}
      {tab === "academics" && (
        <Reveal delay={120}>
          <div className="space-y-4">
            {mock.examMeta ? (
              <StudentScoresCard scores={mock.scores} meta={mock.examMeta} />
            ) : (
              <PremiumCard className="p-5">
                <PremiumEmptyState title="No exam results yet" description="Results appear here once marks are entered." className="py-6" />
              </PremiumCard>
            )}
            <div className="grid gap-4 lg:grid-cols-2">
              {mock.rank ? (
                <StudentRankCard rank={mock.rank} />
              ) : (
                <PremiumCard className="p-5">
                  <PremiumEmptyState title="Not ranked yet" description="A rank is shown after a complete exam result." className="py-6" />
                </PremiumCard>
              )}
              <StudentAttendanceCard summary={mock.attendanceSummary} monthly={mock.attendanceMonthly} />
            </div>
            <StudentTimetableCard timetable={mock.timetable} />
          </div>
        </Reveal>
      )}

      {/* ── Fees ──────────────────────────────────────────────────────── */}
      {tab === "fees" && (
        <Reveal delay={120}>
          {mock.fees ? (
            <StudentFeesCard fees={mock.fees} payments={mock.payments} />
          ) : (
            <PremiumCard className="p-5">
              <PremiumEmptyState title="Fee details are restricted" description="You need fee access to see this student's fees." className="py-6" />
            </PremiumCard>
          )}
        </Reveal>
      )}

      {/* ── Documents ─────────────────────────────────────────────────── */}
      {tab === "documents" && (
        <Reveal delay={120}>
          <StudentDocumentsCard documents={mock.documents} />
        </Reveal>
      )}

      {/* ── Activity ──────────────────────────────────────────────────── */}
      {tab === "activity" && (
        <Reveal delay={120}>
          <div className="grid gap-4 lg:grid-cols-2">
            <div className="space-y-4">
              <StudentAwardsCard awards={mock.awards} />
              <StudentRemarksCard remarks={mock.remarks} />
            </div>
            <StudentActivityTimeline activities={mock.activities} />
          </div>
        </Reveal>
      )}
    </div>
  );
}
