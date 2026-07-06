import { FileText, CheckCircle2, Clock, Archive, AlertTriangle, Bell } from "lucide-react";
import { Card } from "@/components/ui/card";
import { NOTICE_STATS } from "@/data/noticesData";
import { cn } from "@/lib/utils";

interface CardDef {
  label:  string;
  value:  number;
  sub:    string;
  icon:   React.FC<{ className?: string }>;
  color:  string;
  bgCls:  string;
}

const CARDS: CardDef[] = [
  { label: "Total Notices",  value: NOTICE_STATS.total,        sub: "all notices",          icon: FileText,      color: "text-indigo-600", bgCls: "bg-indigo-50 dark:bg-indigo-950/30"  },
  { label: "Published",      value: NOTICE_STATS.published,    sub: "currently live",        icon: CheckCircle2,  color: "text-emerald-600",bgCls: "bg-emerald-50 dark:bg-emerald-950/30"},
  { label: "Drafts",         value: NOTICE_STATS.drafts,       sub: "not yet published",     icon: Archive,       color: "text-slate-500",  bgCls: "bg-slate-100 dark:bg-slate-800"     },
  { label: "Scheduled",      value: NOTICE_STATS.scheduled,    sub: "queued to publish",     icon: Clock,         color: "text-violet-600", bgCls: "bg-violet-50 dark:bg-violet-950/30" },
  { label: "High Priority",  value: NOTICE_STATS.highPriority, sub: "high + urgent",         icon: AlertTriangle, color: "text-amber-600",  bgCls: "bg-amber-50 dark:bg-amber-950/30"   },
  { label: "Unread Count",   value: NOTICE_STATS.unread,       sub: "across all recipients", icon: Bell,          color: "text-rose-600",   bgCls: "bg-rose-50 dark:bg-rose-950/30"     },
];

export function NoticeSummaryCards() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
      {CARDS.map((c) => (
        <Card key={c.label} className="p-4 flex flex-col gap-2 hover:shadow-md transition-shadow">
          <div className={cn("flex h-9 w-9 items-center justify-center rounded-xl", c.bgCls)}>
            <c.icon className={cn("h-4 w-4", c.color)} />
          </div>
          <p className={cn("text-2xl font-bold tabular-nums", c.color)}>{c.value}</p>
          <div>
            <p className="text-[12px] font-semibold text-foreground leading-tight">{c.label}</p>
            <p className="text-[10px] text-muted-foreground mt-0.5">{c.sub}</p>
          </div>
        </Card>
      ))}
    </div>
  );
}
