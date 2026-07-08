import { useMemo } from "react";
import {
  AlertOctagon, BookMarked, Bug, Building2, CalendarCheck, ClipboardList,
  GraduationCap, ScrollText, UserRound, Users, Wallet, type LucideIcon,
} from "lucide-react";

import { Reveal } from "@/components/motion";
import { Card, CardContent } from "@/components/ui/card";
import { OPEN_STATUSES, type SupportTicket, type TicketCategory } from "@/data/helpDeskData";

interface CategoryGroup {
  label: string;
  icon: LucideIcon;
  categories: TicketCategory[];
}

const GROUPS: CategoryGroup[] = [
  { label: "Students",   icon: GraduationCap, categories: ["Student Issue"] },
  { label: "Parents",    icon: UserRound,     categories: ["Parent Issue"] },
  { label: "Teachers",   icon: Users,         categories: ["Teacher Complaint"] },
  { label: "Attendance", icon: CalendarCheck, categories: ["Attendance Problem"] },
  { label: "Fees",       icon: Wallet,        categories: ["Fee / Payment Problem"] },
  { label: "Exams",      icon: ScrollText,    categories: ["Exam / Result Problem"] },
  { label: "Library",    icon: BookMarked,    categories: ["Library Issue"] },
  { label: "Transport",  icon: ClipboardList, categories: ["Transport Issue"] },
  { label: "Hostel",     icon: Building2,     categories: ["Hostel Issue"] },
  { label: "Technical",  icon: Bug,           categories: ["Technical Bug", "Account/Login Issue"] },
  { label: "Emergency",  icon: AlertOctagon,  categories: ["Emergency / Safety"] },
];

function formatDuration(ms: number): string {
  const totalMinutes = Math.max(0, Math.round(ms / 60_000));
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  if (h === 0) return `${m}m`;
  return m ? `${h}h ${m}m` : `${h}h`;
}

export function TicketCategoryCards({ tickets }: { tickets: SupportTicket[] }) {
  const rows = useMemo(() => GROUPS.map((g) => {
    const inGroup = tickets.filter((t) => g.categories.includes(t.category));
    const open = inGroup.filter((t) => OPEN_STATUSES.includes(t.status)).length;
    const resolved = inGroup.filter((t) => t.status === "Resolved" || t.status === "Closed").length;
    const responseTimes = inGroup
      .filter((t) => t.messages.length > 1)
      .map((t) => new Date(t.messages[1].timestamp).getTime() - new Date(t.createdAt).getTime());
    const avgMs = responseTimes.length ? responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length : 0;
    return { ...g, total: inGroup.length, open, resolved, avg: formatDuration(avgMs) };
  }), [tickets]);

  return (
    <Reveal className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
      {rows.map((row) => {
        const Icon = row.icon;
        return (
          <Card key={row.label} className="rounded-2xl border-border/60 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-2.5">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                  <Icon className="h-4 w-4 text-primary" />
                </span>
                <p className="text-[13px] font-semibold text-foreground">{row.label}</p>
              </div>
              <div className="mt-3 grid grid-cols-3 gap-1 text-center">
                <div>
                  <p className="text-[15px] font-semibold tabular-nums text-foreground">{row.total}</p>
                  <p className="text-[10px] text-muted-foreground">Total</p>
                </div>
                <div>
                  <p className="text-[15px] font-semibold tabular-nums text-blue-600 dark:text-blue-400">{row.open}</p>
                  <p className="text-[10px] text-muted-foreground">Open</p>
                </div>
                <div>
                  <p className="text-[15px] font-semibold tabular-nums text-emerald-600 dark:text-emerald-400">{row.resolved}</p>
                  <p className="text-[10px] text-muted-foreground">Resolved</p>
                </div>
              </div>
              <p className="mt-2.5 border-t border-border/50 pt-2 text-[11px] text-muted-foreground">
                Avg. response: <span className="font-medium text-foreground">{row.avg}</span>
              </p>
            </CardContent>
          </Card>
        );
      })}
    </Reveal>
  );
}
