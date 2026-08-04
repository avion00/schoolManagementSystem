import type { LucideIcon } from "lucide-react";
import { Phone, Users } from "lucide-react";

import { Reveal } from "@/components/motion";
import { StudentSectionHeader } from "@/components/student/ui/StudentSectionHeader";

export interface StudentImportantContact {
  label: string;
  name: string;
  icon: LucideIcon;
  onAction?: () => void;
}

/** Compact list of key people — class teacher, guardian, emergency contact — each with a quick action. */
export function StudentImportantContactsCard({ contacts }: { contacts: StudentImportantContact[] }) {
  return (
    <Reveal>
      <div className="rounded-2xl border border-border/60 bg-card p-4 shadow-elevated">
        <StudentSectionHeader icon={Users} title="Important Contacts" />
        <div className="space-y-1">
          {contacts.map((c) => (
            <div key={c.label} className="flex items-center gap-2.5 rounded-xl px-1 py-2 transition-colors hover:bg-muted/40">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <c.icon className="h-4 w-4" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-[11px] text-muted-foreground">{c.label}</p>
                <p className="truncate text-[12.5px] font-medium text-foreground">{c.name}</p>
              </div>
              {c.onAction && (
                <button
                  type="button"
                  onClick={c.onAction}
                  aria-label={`Contact ${c.name}`}
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-primary/10 hover:text-primary"
                >
                  <Phone className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </Reveal>
  );
}
