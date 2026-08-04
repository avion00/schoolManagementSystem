import { CheckCircle2 } from "lucide-react";

import { Reveal } from "@/components/motion";
import { StudentRingStat } from "@/components/student/ui/StudentProgressCard";
import { StudentSecondaryButton } from "@/components/student/ui/StudentSecondaryButton";
import { StudentSectionHeader } from "@/components/student/ui/StudentSectionHeader";

/** Profile completeness ring + missing-fields list + a "request update" CTA. */
export function StudentProfileCompletionCard({
  percent,
  missingFields,
  onRequestUpdate,
}: {
  percent: number;
  missingFields: string[];
  onRequestUpdate: () => void;
}) {
  return (
    <Reveal>
      <div className="rounded-2xl border border-border/60 bg-card p-4 shadow-elevated">
        <StudentSectionHeader icon={CheckCircle2} title="Profile Completion" />
        <div className="flex items-center gap-4">
          <StudentRingStat percent={percent} label="Complete" strokeCls={percent >= 90 ? "stroke-emerald-500" : "stroke-amber-500"} />
          <div className="min-w-0 flex-1">
            {missingFields.length > 0 ? (
              <>
                <p className="text-[12.5px] font-medium text-foreground">{missingFields.length} item{missingFields.length !== 1 ? "s" : ""} missing</p>
                <p className="mt-0.5 truncate text-[11.5px] text-muted-foreground">{missingFields.join(", ")}</p>
              </>
            ) : (
              <p className="text-[12.5px] font-medium text-foreground">Your profile is complete.</p>
            )}
          </div>
        </div>
        <StudentSecondaryButton className="mt-3" onClick={onRequestUpdate}>
          Request Update
        </StudentSecondaryButton>
      </div>
    </Reveal>
  );
}
