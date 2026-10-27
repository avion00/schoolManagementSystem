import { AlertCircle, Award, BookX, CalendarClock, MessageCircle, Users } from "lucide-react";
import { toast } from "sonner";

import { PremiumCard } from "@/components/ui/PremiumCard";

const TEMPLATES = [
  { id: "attendance",  label: "Attendance concern",  icon: AlertCircle,   text: "I wanted to flag that {student}'s attendance has dropped recently. Could we discuss?" },
  { id: "homework",    label: "Homework missing",    icon: BookX,         text: "{student} has missing homework submissions. Please check in with them at home." },
  { id: "performance", label: "Good performance",     icon: Award,         text: "Great news — {student} has been doing excellent work in class recently!" },
  { id: "exam",        label: "Exam reminder",        icon: CalendarClock, text: "Reminder: {student}'s upcoming exam is scheduled soon — please help them prepare." },
  { id: "behavior",    label: "Behavior note",         icon: MessageCircle, text: "I'd like to share a quick note about {student}'s behavior in class today." },
  { id: "meeting",     label: "Meeting request",       icon: Users,         text: "Could we schedule a short meeting to discuss {student}'s progress?" },
];

/** Quick-fill message templates a teacher can drop into a parent conversation. */
export function ParentMessageTemplate({ onSelect }: { onSelect?: (text: string) => void }) {
  return (
    <PremiumCard className="p-4">
      <p className="mb-2.5 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Quick templates</p>
      <div className="flex flex-wrap gap-2">
        {TEMPLATES.map((t) => {
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => (onSelect ? onSelect(t.text) : toast.info(`Template: "${t.text}"`))}
              className="flex items-center gap-1.5 rounded-full border border-border/60 bg-card px-3 py-1.5 text-[11.5px] font-medium text-foreground transition-colors hover:bg-accent/60"
            >
              <Icon className="h-3.5 w-3.5 text-muted-foreground" />
              {t.label}
            </button>
          );
        })}
      </div>
    </PremiumCard>
  );
}
