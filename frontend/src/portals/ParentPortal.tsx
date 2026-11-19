/** Parent / guardian portal: their children's school life, from /me/children/. */
import { useState } from "react";
import { Award, CalendarCheck, GraduationCap, Wallet } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";

import { SlidingTabs } from "@/components/motion";
import { Button } from "@/components/ui/button";
import { KPITrendCard } from "@/components/ui/KPITrendCard";
import { METRIC_TONES } from "@/components/ui/MetricCard";
import { PremiumCard } from "@/components/ui/PremiumCard";
import {
  AssignmentsView, AttendanceView, FeesView, Loaded, NoticesReader, PortalHeader, ResultsView, WeekGrid,
} from "@/components/portal/PortalViews";
import { PortalAccount } from "@/components/portal/PortalAccount";
import { PortalHelp } from "@/components/portal/PortalHelp";
import { useMoney } from "@/api/billing";
import {
  useChild, useChildAssignments, useChildAttendance, useChildFees, useChildResults, useChildTimetable, useChildren,
} from "@/api/portal";

export function ParentHomePage() {
  const q = useChildren();
  const money = useMoney();
  const navigate = useNavigate();
  return (
    <div className="space-y-5">
      <PortalHeader title="My Children" description="Attendance, results, fees and homework for each child." />
      <Loaded query={q} empty={(d) => (d.length === 0 ? "No children are linked to your account yet — contact the school office." : false)}>
        {(kids) => (
          <div className="grid gap-4 md:grid-cols-2">
            {kids.map((k) => (
              <PremiumCard key={k.id} className="p-5">
                <div className="flex items-center gap-3">
                  <span className="flex h-11 w-11 items-center justify-center rounded-full bg-primary/10 text-primary"><GraduationCap className="h-5 w-5" /></span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[15px] font-semibold">{k.full_name}</p>
                    <p className="text-[12px] text-muted-foreground">{[k.class_level_name, k.section_name].filter(Boolean).join(" – ")} · {k.admission_number}</p>
                  </div>
                </div>
                <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                  <div><p className="text-lg font-bold">{k.attendance_pct == null ? "—" : `${k.attendance_pct}%`}</p><p className="text-[11px] text-muted-foreground">Attendance</p></div>
                  <div><p className="text-lg font-bold">{k.latest_result_pct == null ? "—" : `${k.latest_result_pct}%`}</p><p className="text-[11px] text-muted-foreground">Latest result</p></div>
                  <div><p className={k.outstanding_fees > 0 ? "text-lg font-bold text-rose-600" : "text-lg font-bold"}>{money(k.outstanding_fees)}</p><p className="text-[11px] text-muted-foreground">Fees due</p></div>
                </div>
                <Button size="sm" className="mt-4 w-full" onClick={() => navigate(`/parent/children/${k.id}`)}>Open</Button>
              </PremiumCard>
            ))}
          </div>
        )}
      </Loaded>
    </div>
  );
}

const TABS = [
  { value: "overview", label: "Overview" }, { value: "attendance", label: "Attendance" }, { value: "results", label: "Results" },
  { value: "homework", label: "Homework" }, { value: "fees", label: "Fees" }, { value: "timetable", label: "Timetable" },
];

export function ParentChildPage() {
  const { id } = useParams<{ id: string }>();
  const [tab, setTab] = useState("overview");
  const money = useMoney();
  const child = useChild(id);
  const attendance = useChildAttendance(tab === "attendance" ? id : undefined);
  const results = useChildResults(tab === "results" ? id : undefined);
  const homework = useChildAssignments(tab === "homework" ? id : undefined);
  const fees = useChildFees(tab === "fees" ? id : undefined);
  const timetable = useChildTimetable(tab === "timetable" ? id : undefined);
  const p = child.data?.profile;
  return (
    <div className="space-y-5">
      <PortalHeader title={p?.full_name ?? "Child"} description={p ? [p.class_level_name, p.section_name, p.academic_year_name].filter(Boolean).join(" · ") : undefined} />
      <div className="overflow-x-auto"><SlidingTabs value={tab} onValueChange={setTab} options={TABS} className="w-max" /></div>
      {tab === "overview" && (
        <Loaded query={child}>
          {(d) => (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                <KPITrendCard label="Attendance" value={d.attendance.present_pct == null ? "—" : `${d.attendance.present_pct}%`} icon={CalendarCheck} iconCls={METRIC_TONES.green} />
                <KPITrendCard label="Latest Result" value={d.latest_result?.percentage == null ? "—" : `${d.latest_result.percentage}%`} icon={Award} iconCls={METRIC_TONES.purple} />
                <KPITrendCard label="Published Exams" value={String(d.published_exams)} icon={GraduationCap} iconCls={METRIC_TONES.blue} />
                <KPITrendCard label="Fees Outstanding" value={money(d.fees.outstanding)} icon={Wallet} iconCls={METRIC_TONES.red} />
              </div>
              {d.latest_result && <ResultsView results={[d.latest_result]} />}
            </div>
          )}
        </Loaded>
      )}
      {tab === "attendance" && <Loaded query={attendance}>{(r) => <AttendanceView summary={child.data?.attendance} rows={r} />}</Loaded>}
      {tab === "results" && <Loaded query={results}>{(r) => <ResultsView results={r} />}</Loaded>}
      {tab === "homework" && <Loaded query={homework}>{(r) => <AssignmentsView rows={r} />}</Loaded>}
      {tab === "fees" && <Loaded query={fees}>{(d) => <FeesView data={d} />}</Loaded>}
      {tab === "timetable" && <Loaded query={timetable}>{(w) => <WeekGrid week={w} />}</Loaded>}
    </div>
  );
}

export const ParentNoticesPage = () => (<div className="space-y-5"><PortalHeader title="Notices" /><NoticesReader /></div>);
export const ParentHelpPage = PortalHelp;
export const ParentAccountPage = () => <PortalAccount />;
