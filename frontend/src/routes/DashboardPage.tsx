import {
  AlertTriangle, BookOpen, CalendarCheck, ClipboardList, FilePlus2, GraduationCap, LifeBuoy, Megaphone,
  PenLine, Receipt, Users, Wallet,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";

import { AttentionCard, type AttentionItem } from "@/components/dashboard/AttentionCard";
import { RevenueExpenseChart } from "@/components/billing/RevenueExpenseChart";
import { Reveal } from "@/components/motion";
import { KPITrendCard } from "@/components/ui/KPITrendCard";
import { METRIC_TONES } from "@/components/ui/MetricCard";
import { PremiumCard } from "@/components/ui/PremiumCard";
import { useClassComparison } from "@/api/attendance";
import { useFeeSummary, useFinanceSummary, useMoney } from "@/api/billing";
import { useExamSchedule } from "@/api/exams";
import { useHelpdeskStats } from "@/api/helpdesk";
import { get } from "@/api/http";
import { useNotices } from "@/api/notices";
import { todayIso } from "@/api/attendance";
import { useAuth } from "@/lib/auth";
import { BillingPage } from "@/routes/BillingPage";

interface Summary {
  students: number; teachers: number; attendance_today_pct: number | null; attendance_marked_today: number;
  fee_collected_this_month: number | null; outstanding_dues: number | null;
  recent_activity: { action: string; actor__email: string | null; object_type: string; created_at: string }[] | null;
}

const QUICK_ACTIONS = [
  { label: "Mark Attendance", icon: CalendarCheck, to: "/attendance/daily", perm: "attendance.create" },
  { label: "Add Student", icon: GraduationCap, to: "/students/new", perm: "student.create" },
  { label: "Record Payment", icon: Receipt, to: "/billing/invoices", perm: "fee.collect" },
  { label: "New Notice", icon: Megaphone, to: "/notices/new", perm: "notice.manage" },
  { label: "Enter Marks", icon: PenLine, to: "/exams/marks-entry", perm: "exam.marks.enter" },
  { label: "Bill a Class", icon: FilePlus2, to: "/billing/invoices", perm: "fee.create" },
];

function actionLabel(a: string) {
  return a.replace(/[._]/g, " ").replace(/^\w/, (c) => c.toUpperCase());
}

export function DashboardPage() {
  const { user, hasPermission } = useAuth();
  const navigate = useNavigate();
  const money = useMoney();
  const roles = user?.roles ?? [];
  const isAccountant = roles.includes("Accountant") && !roles.includes("Principal");
  const canFees = hasPermission("fee.view");
  const canFinance = hasPermission("finance.view");
  const today = todayIso();

  const summary = useQuery({ queryKey: ["dashboard", "summary"], queryFn: () => get<Summary>("/dashboard/summary/"), staleTime: 60_000 });
  const fees = useFeeSummary();
  const finance = useFinanceSummary(6, canFinance && !isAccountant);
  const sectionsToday = useClassComparison(today, today);
  const schedule = useExamSchedule();
  const notices = useNotices();
  const helpdesk = useHelpdeskStats(hasPermission("helpdesk.manage"));

  // Accountants get the finance overview as their home page.
  if (isAccountant) return <BillingPage />;

  const s = summary.data;
  const unmarked = (sectionsToday.data ?? []).filter((c) => c.rate === null).length;
  const upcoming = (schedule.data?.schedule ?? []).filter((p) => p.date >= today).slice(0, 5);
  const latestNotices = (notices.data ?? []).filter((n) => n.status === "Published").slice(0, 4);

  const attention: AttentionItem[] = [
    { id: "unmarked", label: "Sections without attendance today", value: String(unmarked), linkLabel: "Take registers", to: "/attendance/daily", icon: CalendarCheck, tone: unmarked ? "amber" : "blue" },
    ...(canFees ? [{ id: "overdue", label: "Overdue invoices", value: String(fees.data?.overdueInvoices ?? 0), linkLabel: "Review invoices", to: "/billing/invoices", icon: AlertTriangle, tone: "rose" as const }] : []),
    ...(canFees ? [{ id: "discounts", label: "Discounts awaiting approval", value: String(fees.data?.pendingDiscounts ?? 0), linkLabel: "Open billing", to: "/billing", icon: ClipboardList, tone: "violet" as const }] : []),
    ...(helpdesk.data ? [{ id: "tickets", label: "Unassigned help tickets", value: String(helpdesk.data.unassigned), linkLabel: "Open help desk", to: "/help", icon: LifeBuoy, tone: "blue" as const }] : []),
  ];

  return (
    <div className="space-y-4">
      <Reveal delay={0}>
        <h2 className="mb-2.5 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.09em] text-muted-foreground/70">
          Needs Attention Now
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {attention.map((item) => <AttentionCard key={item.id} item={item} />)}
        </div>
      </Reveal>

      <Reveal delay={60} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KPITrendCard label="Active Students" value={s ? s.students.toLocaleString() : "—"} icon={GraduationCap} iconCls={METRIC_TONES.blue} />
        <KPITrendCard label="Teachers" value={s ? s.teachers.toLocaleString() : "—"} icon={Users} iconCls={METRIC_TONES.purple} />
        <KPITrendCard label="Attendance Today" value={s?.attendance_today_pct == null ? "—" : `${s.attendance_today_pct}%`} icon={CalendarCheck}
          iconCls={METRIC_TONES.green} />
        {canFees
          ? <KPITrendCard label="Collected This Month" value={money(s?.fee_collected_this_month)} icon={Wallet} iconCls={METRIC_TONES.amber} />
          : <KPITrendCard label="Upcoming Papers" value={String(upcoming.length)} icon={BookOpen} iconCls={METRIC_TONES.amber} />}
      </Reveal>

      <Reveal delay={120} className="grid gap-4 lg:grid-cols-12">
        <div className="lg:col-span-7">
          {canFinance && finance.data
            ? <RevenueExpenseChart trend={finance.data.trend} />
            : (
              <PremiumCard className="flex h-full items-center justify-center p-8 text-center text-[12.5px] text-muted-foreground">
                Income and expenses appear here for staff with finance access.
              </PremiumCard>
            )}
        </div>
        <div className="grid grid-cols-2 gap-4 lg:col-span-5">
          <KPITrendCard label="Outstanding Dues" value={canFees ? money(s?.outstanding_dues) : "—"} icon={AlertTriangle} iconCls={METRIC_TONES.red} />
          <KPITrendCard label="Open Invoices" value={canFees ? String(fees.data?.openInvoices ?? "—") : "—"} icon={Receipt} iconCls={METRIC_TONES.blue} />
          <KPITrendCard label="Registers Taken Today" value={s ? String(s.attendance_marked_today) : "—"} icon={ClipboardList} iconCls={METRIC_TONES.green} />
          <KPITrendCard label="Open Help Tickets" value={helpdesk.data ? String(helpdesk.data.open) : "—"} icon={LifeBuoy} iconCls={METRIC_TONES.purple} />
        </div>
      </Reveal>

      <Reveal delay={180} className="grid gap-4 lg:grid-cols-3">
        <PremiumCard className="p-5">
          <div className="mb-3 flex items-center justify-between">
            <p className="font-display text-base font-semibold tracking-tight text-foreground">Latest Notices</p>
            <Link to="/notices" className="text-[11.5px] font-medium text-primary hover:underline">All notices</Link>
          </div>
          {latestNotices.length === 0 && <p className="py-6 text-center text-[12px] text-muted-foreground">No published notices yet.</p>}
          <div className="space-y-2">
            {latestNotices.map((n) => (
              <button key={n.id} onClick={() => navigate(`/notices/${n.id}`)}
                className="w-full rounded-lg border border-neutral-200/80 p-2.5 text-left hover:bg-muted/40 dark:border-neutral-800">
                <p className="truncate text-sm font-medium">{n.title}</p>
                <p className="text-[11px] text-muted-foreground">{n.category} · {n.publishDate}</p>
              </button>
            ))}
          </div>
        </PremiumCard>

        <PremiumCard className="p-5">
          <p className="font-display mb-3 text-base font-semibold tracking-tight text-foreground">Upcoming Exam Papers</p>
          {upcoming.length === 0 && <p className="py-6 text-center text-[12px] text-muted-foreground">No upcoming papers scheduled.</p>}
          <div className="space-y-2">
            {upcoming.map((p) => (
              <button key={p.id} onClick={() => navigate(`/exams/schedule/${p.id}`)}
                className="flex w-full items-center gap-3 rounded-lg border border-neutral-200/80 p-2.5 text-left hover:bg-muted/40 dark:border-neutral-800">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-500/10">
                  <BookOpen className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{p.subject}</p>
                  <p className="text-xs text-muted-foreground">{p.className} · {p.examName}</p>
                </div>
                <div className="shrink-0 text-right">
                  <p className="text-xs font-semibold text-foreground">{p.date}</p>
                  <p className="text-[11px] text-muted-foreground">{p.startTime}</p>
                </div>
              </button>
            ))}
          </div>
        </PremiumCard>

        <PremiumCard className="p-5">
          <p className="font-display mb-3 text-base font-semibold tracking-tight text-foreground">Quick Actions</p>
          <div className="grid grid-cols-2 gap-2">
            {QUICK_ACTIONS.filter((a) => hasPermission(a.perm)).map((a) => (
              <button key={a.label} onClick={() => navigate(a.to)}
                className="flex flex-col items-center gap-1.5 rounded-xl border border-border/60 p-3 text-center text-[11.5px] font-medium hover:border-primary/30 hover:bg-muted/40">
                <a.icon className="h-4 w-4 text-primary" /> {a.label}
              </button>
            ))}
          </div>
          {s?.recent_activity && s.recent_activity.length > 0 && (<>
            <p className="mb-2 mt-5 text-[12px] font-semibold text-foreground">Recent Activity</p>
            <div className="space-y-1.5">
              {s.recent_activity.map((a, i) => (
                <div key={i} className="text-[11.5px]">
                  <span className="font-medium text-foreground">{actionLabel(a.action)}</span>
                  <span className="text-muted-foreground"> · {a.actor__email ?? "system"} · {new Date(a.created_at).toLocaleString()}</span>
                </div>
              ))}
            </div>
          </>)}
        </PremiumCard>
      </Reveal>
    </div>
  );
}
