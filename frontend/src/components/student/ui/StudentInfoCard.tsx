import type { LucideIcon } from "lucide-react";

import { Reveal } from "@/components/motion";
import { StudentSectionHeader } from "@/components/student/ui/StudentSectionHeader";

export interface StudentInfoRow {
  label: string;
  value: string;
}

/** Generic label/value info block — Current Academic Status, and reusable for future student pages. */
export function StudentInfoCard({ title, icon, rows }: { title: string; icon?: LucideIcon; rows: StudentInfoRow[] }) {
  return (
    <Reveal>
      <div className="rounded-2xl border border-border/60 bg-card p-4 shadow-elevated">
        <StudentSectionHeader icon={icon} title={title} />
        <div className="space-y-2">
          {rows.map((r) => (
            <div key={r.label} className="flex items-center justify-between text-[12.5px]">
              <span className="text-muted-foreground">{r.label}</span>
              <span className="font-medium text-foreground">{r.value}</span>
            </div>
          ))}
        </div>
      </div>
    </Reveal>
  );
}
