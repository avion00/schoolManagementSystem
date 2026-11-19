import { FileText, CheckCircle2, Clock, Archive, AlertTriangle, Bell } from "lucide-react";

import { Reveal } from "@/components/motion";
import { KPITrendCard } from "@/components/ui/KPITrendCard";
import type { Notice } from "@/api/types/notices";

function cards(notices: Notice[]) {
  const count = (f: (n: Notice) => boolean) => notices.filter(f).length;
  return [
  {
    label: "Total Notices", value: notices.length, icon: FileText, iconCls: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400",
  },
  {
    label: "Published", value: count((n) => n.status === "Published"), icon: CheckCircle2, iconCls: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  },
  {
    label: "Drafts", value: count((n) => n.status === "Draft"), icon: Archive, iconCls: "bg-slate-500/10 text-slate-600 dark:text-slate-400",
  },
  {
    label: "Scheduled", value: count((n) => n.status === "Scheduled"), icon: Clock, iconCls: "bg-violet-500/10 text-violet-600 dark:text-violet-400",
  },
  {
    label: "High Priority", value: count((n) => n.status !== "Archived" && (n.priority === "High" || n.priority === "Urgent")), icon: AlertTriangle, iconCls: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  },
  {
    label: "Awaiting Ack.", value: count((n) => n.requiresAcknowledgement && n.status === "Published"), icon: Bell, iconCls: "bg-rose-500/10 text-rose-600 dark:text-rose-400",
  },
  ];
}

export function NoticeSummaryCards({ notices }: { notices: Notice[] }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
      {cards(notices).map((c, i) => (
        <Reveal key={c.label} delay={i * 40}>
          <KPITrendCard
            label={c.label}
            value={c.value}
            icon={c.icon}
            iconCls={c.iconCls}
          />
        </Reveal>
      ))}
    </div>
  );
}
