import type { LucideIcon } from "lucide-react";
import { Sparkles } from "lucide-react";

import { Reveal } from "@/components/motion";
import { StudentSectionHeader } from "@/components/student/ui/StudentSectionHeader";
import type { StudentPillTone } from "@/components/student/ui/StudentStatusPill";
import { cn } from "@/lib/utils";

export interface StudentReminder {
  id: string;
  text: string;
  icon?: LucideIcon;
  tone?: StudentPillTone;
}

const TONE_ICON_CLS: Record<StudentPillTone, string> = {
  success: "text-emerald-500",
  warning: "text-amber-500",
  danger: "text-rose-500",
  info: "text-blue-500",
  purple: "text-violet-500",
  neutral: "text-muted-foreground",
};

/** Compact "smart reminders" list card for the right-column sidebar — subtle per-item priority tone. */
export function StudentReminderCard({ title = "Smart Reminders", reminders }: { title?: string; reminders: StudentReminder[] }) {
  return (
    <Reveal>
      <div className="rounded-2xl border border-border/60 bg-card p-4 shadow-elevated">
        <StudentSectionHeader icon={Sparkles} title={title} className="mb-3" />
        <div className="space-y-2">
          {reminders.map((r) => (
            <div key={r.id} className="flex items-start gap-2.5 rounded-xl bg-muted/40 px-3 py-2.5 text-[12.5px] text-foreground">
              {r.icon && <r.icon className={cn("mt-0.5 h-3.5 w-3.5 shrink-0", TONE_ICON_CLS[r.tone ?? "neutral"])} />}
              <span className="leading-snug">{r.text}</span>
            </div>
          ))}
        </div>
      </div>
    </Reveal>
  );
}
