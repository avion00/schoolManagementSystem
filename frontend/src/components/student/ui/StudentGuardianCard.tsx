import { Mail, MessageCircle, Phone, type LucideIcon } from "lucide-react";

import { Reveal } from "@/components/motion";
import { StudentSecondaryButton } from "@/components/student/ui/StudentSecondaryButton";
import { StudentStatusPill } from "@/components/student/ui/StudentStatusPill";

/** Guardian / emergency-contact identity card with demo-only contact actions. */
export function StudentGuardianCard({
  icon: Icon,
  roleLabel,
  name,
  meta,
  phone,
  email,
  onMessage,
}: {
  icon: LucideIcon;
  roleLabel: string;
  name: string;
  meta?: string;
  phone: string;
  email?: string;
  onMessage?: () => void;
}) {
  return (
    <Reveal>
      <div className="rounded-2xl border border-border/60 bg-card p-4 shadow-elevated">
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Icon className="h-[18px] w-[18px]" />
          </span>
          <div className="min-w-0 flex-1">
            <StudentStatusPill label={roleLabel} tone="purple" className="mb-1.5" />
            <p className="truncate text-[14px] font-semibold text-foreground">{name}</p>
            {meta && <p className="truncate text-[11.5px] text-muted-foreground">{meta}</p>}
          </div>
        </div>
        <div className="mt-3 space-y-1.5 border-t border-border/60 pt-3 text-[12.5px]">
          <p className="flex items-center gap-2 text-foreground"><Phone className="h-3.5 w-3.5 text-muted-foreground" /> {phone}</p>
          {email && <p className="flex items-center gap-2 text-foreground"><Mail className="h-3.5 w-3.5 text-muted-foreground" /> {email}</p>}
        </div>
        {onMessage && (
          <StudentSecondaryButton className="mt-3" onClick={onMessage}>
            <MessageCircle className="h-3.5 w-3.5" /> Message
          </StudentSecondaryButton>
        )}
      </div>
    </Reveal>
  );
}
