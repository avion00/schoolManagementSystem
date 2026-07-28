import type { LucideIcon } from "lucide-react";
import { ListTodo } from "lucide-react";

import { StudentSectionHeader } from "@/components/student/ui/StudentSectionHeader";
import { StudentStatusPill, type StudentPillTone } from "@/components/student/ui/StudentStatusPill";

export interface StudentUpcomingTaskRow {
  id: string;
  title: string;
  subject: string;
  type: string;
  typeIcon: LucideIcon;
  typeIconCls?: string;
  due: string;
  statusLabel: string;
  statusTone: StudentPillTone;
  actionLabel: string;
  onAction: () => void;
}

/** Full-width "upcoming activity" table — homework, exams, and other deadlines in one scannable list. */
export function StudentUpcomingTaskTable({ rows }: { rows: StudentUpcomingTaskRow[] }) {
  return (
    <div className="rounded-2xl border border-border/60 bg-card shadow-elevated">
      <div className="p-4 pb-0 sm:p-5 sm:pb-0">
        <StudentSectionHeader icon={ListTodo} title="Upcoming Tasks & Deadlines" />
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-[12.5px]">
          <thead>
            <tr className="border-y border-border/60 bg-muted/30">
              <th className="px-4 py-2.5 text-[11px] font-medium uppercase tracking-wide text-muted-foreground sm:px-5">Task</th>
              <th className="px-3 py-2.5 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">Subject</th>
              <th className="px-3 py-2.5 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">Type</th>
              <th className="px-3 py-2.5 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">Due</th>
              <th className="px-3 py-2.5 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">Status</th>
              <th className="px-4 py-2.5 text-right text-[11px] font-medium uppercase tracking-wide text-muted-foreground sm:px-5">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60">
            {rows.map((r) => (
              <tr key={r.id} className="transition-colors hover:bg-muted/30">
                <td className="px-4 py-3 font-medium text-foreground sm:px-5">{r.title}</td>
                <td className="px-3 py-3 text-muted-foreground">{r.subject}</td>
                <td className="px-3 py-3">
                  <span className="inline-flex items-center gap-1.5 text-muted-foreground">
                    <r.typeIcon className={`h-3.5 w-3.5 ${r.typeIconCls ?? ""}`} />
                    {r.type}
                  </span>
                </td>
                <td className="px-3 py-3 text-muted-foreground">{r.due}</td>
                <td className="px-3 py-3">
                  <StudentStatusPill label={r.statusLabel} tone={r.statusTone} />
                </td>
                <td className="px-4 py-3 text-right sm:px-5">
                  <button
                    type="button"
                    onClick={r.onAction}
                    className="rounded-lg border border-border/60 px-2.5 py-1.5 text-[11.5px] font-medium text-foreground transition-colors hover:border-primary/40 hover:bg-primary/5"
                  >
                    {r.actionLabel}
                  </button>
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={6} className="px-5 py-8 text-center text-muted-foreground">
                  Nothing upcoming — you're all caught up.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
