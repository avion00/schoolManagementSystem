import { FileText, CheckCircle2, Clock, Archive, AlertTriangle, Bell, type LucideIcon } from "lucide-react";

import { Reveal } from "@/components/motion";
import { KPITrendCard, type KPITrend } from "@/components/ui/KPITrendCard";
import { NOTICE_STATS } from "@/data/noticesData";

interface CardDef {
  label:      string;
  value:      number;
  icon:       LucideIcon;
  iconCls:    string;
  sparkColor: string;
  sparkData:  Record<string, number>[];
  trend:      KPITrend;
}

const CARDS: CardDef[] = [
  {
    label: "Total Notices", value: NOTICE_STATS.total, icon: FileText, iconCls: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400",
    sparkColor: "#6366f1", sparkData: [{ value: 24 }, { value: 25 }, { value: 27 }, { value: 28 }, { value: 29 }, { value: 30 }, { value: 31 }],
    trend: { value: "+4.2%", up: true, compareLabel: "vs last month" },
  },
  {
    label: "Published", value: NOTICE_STATS.published, icon: CheckCircle2, iconCls: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    sparkColor: "#1baf7a", sparkData: [{ value: 18 }, { value: 19 }, { value: 20 }, { value: 21 }, { value: 22 }, { value: 23 }, { value: 24 }],
    trend: { value: "+5.1%", up: true, compareLabel: "vs last month" },
  },
  {
    label: "Drafts", value: NOTICE_STATS.drafts, icon: Archive, iconCls: "bg-slate-500/10 text-slate-600 dark:text-slate-400",
    sparkColor: "#64748b", sparkData: [{ value: 6 }, { value: 5 }, { value: 6 }, { value: 5 }, { value: 4 }, { value: 5 }, { value: 4 }],
    trend: { value: "-2.0%", up: false, compareLabel: "vs last month" },
  },
  {
    label: "Scheduled", value: NOTICE_STATS.scheduled, icon: Clock, iconCls: "bg-violet-500/10 text-violet-600 dark:text-violet-400",
    sparkColor: "#8b5cf6", sparkData: [{ value: 2 }, { value: 2 }, { value: 3 }, { value: 2 }, { value: 3 }, { value: 3 }, { value: 3 }],
    trend: { value: "+1.0%", up: true, compareLabel: "vs last month" },
  },
  {
    label: "High Priority", value: NOTICE_STATS.highPriority, icon: AlertTriangle, iconCls: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
    sparkColor: "#f0a020", sparkData: [{ value: 5 }, { value: 6 }, { value: 5 }, { value: 7 }, { value: 6 }, { value: 7 }, { value: 7 }],
    trend: { value: "+3.5%", up: true, compareLabel: "vs last month" },
  },
  {
    label: "Unread Count", value: NOTICE_STATS.unread, icon: Bell, iconCls: "bg-rose-500/10 text-rose-600 dark:text-rose-400",
    sparkColor: "#e34948", sparkData: [{ value: 1120 }, { value: 1180 }, { value: 1250 }, { value: 1310 }, { value: 1370 }, { value: 1410 }, { value: 1440 }],
    trend: { value: "+6.3%", up: true, compareLabel: "vs last month" },
  },
];

export function NoticeSummaryCards() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
      {CARDS.map((c, i) => (
        <Reveal key={c.label} delay={i * 40}>
          <KPITrendCard
            label={c.label}
            value={c.value}
            icon={c.icon}
            iconCls={c.iconCls}
            trend={c.trend}
            sparklineData={c.sparkData}
            sparklineColor={c.sparkColor}
          />
        </Reveal>
      ))}
    </div>
  );
}
