/** Student portal pages, all backed by the /me/ API. */
import { Award, CalendarCheck, Wallet, BookOpen } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { KPITrendCard } from "@/components/ui/KPITrendCard";
import { METRIC_TONES } from "@/components/ui/MetricCard";
import { PremiumCard } from "@/components/ui/PremiumCard";
import {
  AssignmentsView, AttendanceView, FeesView, Loaded, MaterialsView, NoticesReader, PortalHeader, ResultsView,
  TodayPeriods, WeekGrid,
} from "@/components/portal/PortalViews";
import { PortalAccount } from "@/components/portal/PortalAccount";
import { PortalHelp } from "@/components/portal/PortalHelp";
import { useMoney } from "@/api/billing";
import {
  useMyAssignments, useMyAttendance, useMyAttendanceSummary, useMyDashboard, useMyFees, useMyMaterials, useMyResults,
  useMyTimetable, useMyToday, type StudentProfile,
} from "@/api/portal";

function ProfileFacts({ p }: { p: StudentProfile }) {
  const rows: [string, string][] = [
    ["Admission No.", p.admission_number], ["Registration No.", p.registration_number], ["Class", [p.class_level_name, p.section_name].filter(Boolean).join(" – ")],
    ["Roll No.", p.roll_number], ["Academic Year", p.academic_year_name], ["Date of Birth", p.date_of_birth ?? ""], ["Gender", p.gender],
    ["Blood Group", p.blood_group], ["Phone", p.phone], ["Email", p.email], ["Address", p.address], ["Guardian", p.guardian_name],
  ];
  return (
    <PremiumCard className="divide-y divide-border/50">
      {rows.map(([k, v]) => (
        <div key={k} className="flex justify-between gap-3 px-4 py-2.5 text-[12.5px]"><span className="text-muted-foreground">{k}</span><span className="text-right font-medium">{v || "—"}</span></div>
      ))}
    </PremiumCard>
  );
}

export function StudentDashboardPage() {
  const dash = useMyDashboard();
  const today = useMyToday();
  const assignments = useMyAssignments();
  const money = useMoney();
  const navigate = useNavigate();
  const pending = (assignments.data ?? []).filter((a) => a.my_status === "pending" || a.my_status === "missing");
  return (
    <div className="space-y-5">
      <Loaded query={dash}>
        {(d) => (<>
          <PortalHeader title={`Hello, ${d.profile.first_name || d.profile.full_name}`} description={[d.profile.class_level_name, d.profile.section_name, d.profile.academic_year_name].filter(Boolean).join(" · ")} />
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <KPITrendCard label="Attendance" value={d.attendance.present_pct == null ? "—" : `${d.attendance.present_pct}%`} icon={CalendarCheck} iconCls={METRIC_TONES.green} />
            <KPITrendCard label="Latest Result" value={d.latest_result?.percentage == null ? "—" : `${d.latest_result.percentage}%`} icon={Award} iconCls={METRIC_TONES.purple} />
            <KPITrendCard label="Homework Due" value={String(pending.length)} icon={BookOpen} iconCls={METRIC_TONES.amber} />
            <KPITrendCard label="Fees Outstanding" value={money(d.fees.outstanding)} icon={Wallet} iconCls={METRIC_TONES.red} />
          </div>
        </>)}
      </Loaded>
      <div className="grid gap-4 lg:grid-cols-2">
        <PremiumCard className="p-5">
          <p className="mb-3 text-[14px] font-semibold">Today</p>
          <Loaded query={today}>{(t) => <TodayPeriods periods={t.periods} />}</Loaded>
        </PremiumCard>
        <PremiumCard className="p-5">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-[14px] font-semibold">Homework Due</p>
            <button className="text-[11.5px] font-medium text-primary hover:underline" onClick={() => navigate("/student/assignments")}>All homework</button>
          </div>
          {pending.length === 0 ? <p className="py-6 text-center text-[12px] text-muted-foreground">Nothing due. Well done!</p> : (
            <div className="space-y-2">
              {pending.slice(0, 5).map((a) => (
                <div key={a.id} className="flex justify-between gap-2 rounded-lg border border-border/60 p-2.5 text-[12.5px]">
                  <span className="truncate font-medium">{a.title}</span>
                  <span className="shrink-0 text-muted-foreground">{a.subject_name}{a.due_at ? ` · ${new Date(a.due_at).toLocaleDateString()}` : ""}</span>
                </div>
              ))}
            </div>
          )}
        </PremiumCard>
      </div>
    </div>
  );
}

export function StudentTodayPage() {
  const q = useMyToday();
  return (<div className="space-y-5"><PortalHeader title="Today" description={q.data ? `${q.data.day} · ${q.data.date}` : undefined} /><Loaded query={q}>{(t) => <TodayPeriods periods={t.periods} />}</Loaded></div>);
}

export function StudentProfilePage() {
  const q = useMyDashboard();
  return (<div className="space-y-5"><PortalHeader title="My Profile" description="To correct anything here, raise a help request." /><Loaded query={q}>{(d) => <ProfileFacts p={d.profile} />}</Loaded></div>);
}

export function StudentAttendancePage() {
  const summary = useMyAttendanceSummary();
  const rows = useMyAttendance();
  return (<div className="space-y-5"><PortalHeader title="My Attendance" /><Loaded query={rows}>{(r) => <AttendanceView summary={summary.data} rows={r} />}</Loaded></div>);
}

export function StudentTimetablePage() {
  const q = useMyTimetable();
  return (<div className="space-y-5"><PortalHeader title="My Timetable" /><Loaded query={q}>{(w) => <WeekGrid week={w} />}</Loaded></div>);
}

export function StudentAssignmentsPage() {
  const q = useMyAssignments();
  return (<div className="space-y-5"><PortalHeader title="Homework & Assignments" description="Open one to read it and hand in your work." /><Loaded query={q}>{(r) => <AssignmentsView rows={r} canSubmit />}</Loaded></div>);
}

export function StudentMaterialsPage() {
  const q = useMyMaterials();
  return (<div className="space-y-5"><PortalHeader title="Learning Materials" /><Loaded query={q}>{(r) => <MaterialsView rows={r} />}</Loaded></div>);
}

export function StudentResultsPage() {
  const q = useMyResults();
  return (<div className="space-y-5"><PortalHeader title="Results" /><Loaded query={q}>{(r) => <ResultsView results={r} />}</Loaded></div>);
}

export function StudentFeesPage() {
  const q = useMyFees();
  return (<div className="space-y-5"><PortalHeader title="Fees" /><Loaded query={q}>{(d) => <FeesView data={d} />}</Loaded></div>);
}

export function StudentNoticesPage() {
  return (<div className="space-y-5"><PortalHeader title="Notices" /><NoticesReader /></div>);
}

export const StudentHelpPage = PortalHelp;
export const StudentAccountPage = () => <PortalAccount />;
