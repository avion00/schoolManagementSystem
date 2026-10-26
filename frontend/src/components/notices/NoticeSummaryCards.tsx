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
  sparkData?: Record<string, number>[];
  trend?:     KPITrend;
}

const CARDS: CardDef[] = [
  {
    label: "Total Notices", value: NOTICE_STATS.total, icon: FileText, iconCls: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400",
    sparkColor: "#6366f1",
  },
  {
    label: "Published", value: NOTICE_STATS.published, icon: CheckCircle2, iconCls: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    sparkColor: "#1baf7a",
  },
  {
    label: "Drafts", value: NOTICE_STATS.drafts, icon: Archive, iconCls: "bg-slate-500/10 text-slate-600 dark:text-slate-400",
    sparkColor: "#64748b",
  },
  {
    label: "Scheduled", value: NOTICE_STATS.scheduled, icon: Clock, iconCls: "bg-violet-500/10 text-violet-600 dark:text-violet-400",
    sparkColor: "#8b5cf6",
  },
  {
    label: "High Priority", value: NOTICE_STATS.highPriority, icon: AlertTriangle, iconCls: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
    sparkColor: "#f0a020",
  },
  {
    label: "Unread Count", value: NOTICE_STATS.unread, icon: Bell, iconCls: "bg-rose-500/10 text-rose-600 dark:text-rose-400",
    sparkColor: "#e34948",
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
            sparklineColor={c.sparkColor}
          />
        </Reveal>
      ))}
    </div>
  );
}
