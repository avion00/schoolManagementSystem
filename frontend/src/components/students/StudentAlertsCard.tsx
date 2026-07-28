import { Link } from "react-router-dom";
import { Award, ArrowRightLeft, UserX } from "lucide-react";

import { Reveal } from "@/components/motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Student } from "@/data/studentsData";
import { cn } from "@/lib/utils";

export function StudentAlertsCard({ students }: { students: Student[] }) {
  const inactive = students.filter((s) => s.status === "inactive").length;
  const transferred = students.filter((s) => s.status === "transferred").length;
  const graduated = students.filter((s) => s.status === "graduated").length;

  const alerts = [
    {
      label: "Inactive Students", count: inactive, sub: "Review enrollment status",
      icon: UserX, cls: "bg-rose-100 text-rose-600 dark:bg-rose-500/15 dark:text-rose-300",
    },
    {
      label: "Transferred Students", count: transferred, sub: "Confirm transfer paperwork",
      icon: ArrowRightLeft, cls: "bg-amber-100 text-amber-600 dark:bg-amber-500/15 dark:text-amber-300",
    },
    {
      label: "Graduated Students", count: graduated, sub: "Pending record archival",
      icon: Award, cls: "bg-violet-100 text-violet-600 dark:bg-violet-500/15 dark:text-violet-300",
    },
  ];

  return (
    <Reveal className="h-full">
      <Card className="h-full rounded-2xl border-border/60 shadow-elevated">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="font-display text-[15px] font-semibold">Student Alerts</CardTitle>
          <Link to="/students" className="text-[12.5px] font-medium text-primary hover:underline">
            View All
          </Link>
        </CardHeader>
        <CardContent className="space-y-1">
          {alerts.map((a) => (
            <div key={a.label} className="flex items-center gap-3 rounded-xl px-1 py-2 transition-colors hover:bg-muted/40">
              <span className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-full", a.cls)}>
                <a.icon className="h-[18px] w-[18px]" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-[13px] font-semibold text-foreground">
                  {a.label} <span className="tabular-nums">· {a.count}</span>
                </p>
                <p className="truncate text-[11.5px] text-muted-foreground">{a.sub}</p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </Reveal>
  );
}
