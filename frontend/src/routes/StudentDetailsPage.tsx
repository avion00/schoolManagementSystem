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
import { Reveal, SlidingTabs } from "@/components/motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { STUDENT_DETAIL_MOCK } from "@/data/studentDetailsData";
import { STUDENTS } from "@/data/studentsData";

/* ── Health / Transport / Hostel mini-cards ─────────────────────────────── */
import { Heart, Bus, Building2 } from "lucide-react";
import { CardHeader, CardTitle } from "@/components/ui/card";

function MiniInfoCard({
  icon: Icon,
  title,
  rows,
}: {
  icon: React.ElementType;
  title: string;
  rows: { label: string; value: string }[];
}) {
  return (
    <Card className="rounded-2xl shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm font-semibold">
          <Icon className="h-4 w-4 text-primary" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-x-6 gap-y-3">
          {rows.map(({ label, value }) => (
            <div key={label}>
              <p className="text-[10.5px] font-semibold uppercase tracking-wide text-muted-foreground">{label}</p>
              <p className="mt-0.5 text-sm font-medium text-foreground">{value || "—"}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
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

  const student = STUDENTS.find((s) => s.id === Number(id));
  const mock = STUDENT_DETAIL_MOCK;

  /* ── Not found ─────────────────────────────────────────────────────── */
  if (!student) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Card className="w-full max-w-md rounded-2xl p-8 text-center shadow-sm">
          <CardContent className="pt-0">
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
          </CardContent>
        </Card>
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
        <SlidingTabs value={tab} onValueChange={(v) => setTab(v)} options={TABS} />
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
              <Card className="rounded-2xl shadow-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-semibold">Attendance</CardTitle>
                </CardHeader>
                <CardContent>
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
                </CardContent>
              </Card>

              {/* Fee mini */}
              <Card className="rounded-2xl shadow-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-semibold">Fee Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-2xl font-extrabold text-foreground">
                        ${mock.fees.paid.toLocaleString()}
                        <span className="text-sm font-normal text-muted-foreground"> / ${mock.fees.totalFee.toLocaleString()}</span>
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Due: ${mock.fees.due.toLocaleString()} · {mock.fees.status}
                      </p>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => setTab("fees")}>
                      Details
                    </Button>
                  </div>
                  <div className="mt-3 h-2 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-blue-500 transition-all"
                      style={{ width: `${Math.round((mock.fees.paid / mock.fees.totalFee) * 100)}%` }}
                    />
                  </div>
                </CardContent>
              </Card>

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
              <MiniInfoCard
                icon={Bus}
                title="Transport"
                rows={[
                  { label: "Route",         value: mock.transport.busRoute },
                  { label: "Bus No",        value: mock.transport.busNo },
                  { label: "Pickup Point",  value: mock.transport.pickupPoint },
                  { label: "Pickup Time",   value: mock.transport.pickupTime },
                  { label: "Driver",        value: mock.transport.driverName },
                  { label: "Driver Ph.",    value: mock.transport.driverPhone },
                ]}
              />

              {/* Hostel */}
              {mock.hostel.enrolled ? (
                <MiniInfoCard
                  icon={Building2}
                  title="Hostel"
                  rows={[
                    { label: "Hostel",  value: mock.hostel.hostelName },
                    { label: "Room",    value: mock.hostel.roomNo },
                    { label: "Type",    value: mock.hostel.roomType },
                    { label: "Warden", value: mock.hostel.wardenName },
                    { label: "Phone",  value: mock.hostel.wardenPhone },
                  ]}
                />
              ) : (
                <Card className="rounded-2xl shadow-sm">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-sm font-semibold">
                      <Building2 className="h-4 w-4 text-primary" />
                      Hostel
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">Not enrolled in hostel.</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </Reveal>
      )}

      {/* ── Academics ─────────────────────────────────────────────────── */}
      {tab === "academics" && (
        <Reveal delay={120}>
          <div className="space-y-4">
            <StudentScoresCard scores={mock.scores} meta={mock.examMeta} />
            <div className="grid gap-4 lg:grid-cols-2">
              <StudentRankCard rank={mock.rank} />
              <StudentAttendanceCard summary={mock.attendanceSummary} monthly={mock.attendanceMonthly} />
            </div>
            <StudentTimetableCard timetable={mock.timetable} />
          </div>
        </Reveal>
      )}

      {/* ── Fees ──────────────────────────────────────────────────────── */}
      {tab === "fees" && (
        <Reveal delay={120}>
          <StudentFeesCard fees={mock.fees} payments={mock.payments} />
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
