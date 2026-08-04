import type { LucideIcon } from "lucide-react";

import { Reveal } from "@/components/motion";
import { StudentStatusPill, type StudentPillTone } from "@/components/student/ui/StudentStatusPill";
import { cn } from "@/lib/utils";

export interface StudentProfileActivityItem {
  id: string;
  icon: LucideIcon;
  iconCls?: string;
  title: string;
  actor: string;
  date: string;
  statusLabel: string;
  statusTone: StudentPillTone;
}

/** Profile-change activity log — icon, title, actor, date, status — staggered reveal per row. */
export function StudentProfileActivityTimeline({ items }: { items: StudentProfileActivityItem[] }) {
  return (
    <div className="relative">
      {items.map((item, i) => (
        <Reveal key={item.id} delay={i * 50}>
          <div className="relative flex gap-3 pb-4 last:pb-0">
            {i !== items.length - 1 && (
              <span className="absolute left-[15px] top-8 h-[calc(100%-1.25rem)] w-px bg-border" aria-hidden="true" />
            )}
            <span className={cn("z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary", item.iconCls)}>
              <item.icon className="h-4 w-4" />
            </span>
            <div className="flex min-w-0 flex-1 items-center justify-between gap-3 rounded-xl px-3.5 py-2.5">
              <div className="min-w-0">
                <p className="truncate text-[13px] font-medium text-foreground">{item.title}</p>
                <p className="truncate text-[11.5px] text-muted-foreground">{item.actor} · {item.date}</p>
              </div>
              <StudentStatusPill label={item.statusLabel} tone={item.statusTone} className="shrink-0" />
            </div>
          </div>
        </Reveal>
      ))}
    </div>
  );
}
