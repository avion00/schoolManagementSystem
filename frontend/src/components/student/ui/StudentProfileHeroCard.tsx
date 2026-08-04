import { Pencil, Printer } from "lucide-react";

import { Reveal, TiltCard } from "@/components/motion";
import { StudentSecondaryButton } from "@/components/student/ui/StudentSecondaryButton";
import { StudentStatusPill } from "@/components/student/ui/StudentStatusPill";

function initials(name: string) {
  const parts = name.trim().split(/\s+/);
  const first = parts[0]?.[0] ?? "";
  const last = parts.length > 1 ? parts[parts.length - 1][0] : "";
  return (first + last).toUpperCase();
}

/** Premium profile identity hero — avatar, name, class/roll/admission chips, status, and header actions. */
export function StudentProfileHeroCard({
  name,
  className,
  section,
  roll,
  admissionNo,
  registrationNo,
  status,
  studentType,
  academicYear,
  house,
  onRequestCorrection,
  onPrint,
}: {
  name: string;
  className: string;
  section: string;
  roll: string;
  admissionNo: string;
  registrationNo: string;
  status: "Active" | "Inactive";
  studentType: string;
  academicYear: string;
  house: string;
  onRequestCorrection: () => void;
  onPrint: () => void;
}) {
  const chips = [
    `${className} ${section}`, `Roll ${roll}`, admissionNo, registrationNo,
    studentType, academicYear, house,
  ];

  return (
    <TiltCard max={1.5}>
      <Reveal>
        <div className="relative overflow-hidden rounded-3xl border border-primary/15 bg-gradient-to-br from-primary/[0.08] via-card to-violet-500/[0.06] p-6 shadow-[0_1px_2px_rgb(15_23_42/0.06),0_20px_44px_-20px_rgb(79_70_229/0.3)] dark:from-primary/[0.12] dark:via-card dark:to-violet-500/[0.08] sm:p-8">
          <div className="pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full bg-primary/10 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-16 right-1/3 h-56 w-56 rounded-full bg-violet-500/10 blur-3xl" />

          <div className="relative flex flex-wrap items-start justify-between gap-4">
            <div className="flex items-start gap-4">
              <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-secondary text-xl font-semibold text-secondary-foreground ring-4 ring-white/40 dark:ring-white/10 sm:h-20 sm:w-20 sm:text-2xl">
                {initials(name)}
              </span>
              <div className="min-w-0 pt-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="font-display text-xl font-bold tracking-tight text-foreground sm:text-2xl">{name}</h1>
                  <StudentStatusPill label={status} tone={status === "Active" ? "success" : "neutral"} />
                </div>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {chips.map((c) => (
                    <span key={c} className="rounded-full border border-white/50 bg-white/50 px-2.5 py-1 text-[11.5px] font-medium text-foreground/80 backdrop-blur-sm dark:border-white/10 dark:bg-white/[0.04]">
                      {c}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex shrink-0 gap-2">
              <StudentSecondaryButton className="w-auto px-3.5 py-2" onClick={onPrint}>
                <Printer className="h-3.5 w-3.5" /> Print
              </StudentSecondaryButton>
              <StudentSecondaryButton className="w-auto px-3.5 py-2" onClick={onRequestCorrection}>
                <Pencil className="h-3.5 w-3.5" /> Request Correction
              </StudentSecondaryButton>
            </div>
          </div>
        </div>
      </Reveal>
    </TiltCard>
  );
}
