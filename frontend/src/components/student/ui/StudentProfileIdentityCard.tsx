import { GraduationCap, Pencil, Printer } from "lucide-react";
import type { CSSProperties, ReactNode } from "react";

import { Reveal } from "@/components/motion";
import { StudentPrimaryButton } from "@/components/student/ui/StudentPrimaryButton";
import { StudentSecondaryButton } from "@/components/student/ui/StudentSecondaryButton";
import { SCHOOL_PROFILE } from "@/data/settingsData";
import { cn } from "@/lib/utils";

// Fixed (non-random) bar-width pattern so the barcode never shifts between renders.
const BARCODE_PATTERN = [2, 1, 1, 3, 1, 2, 1, 1, 3, 2, 1, 1, 2, 1, 3, 1, 1, 2, 1, 3, 2, 1, 1, 3, 1, 2, 1, 1, 3, 1, 2, 1];

// A clean two-tone gradient "folded corner" accent — built once and mirrored
// via rotate-180 for the opposite corner, so both stay perfectly symmetric.
function CornerAccent({ className }: { className?: string }) {
  return (
    <div className={cn("pointer-events-none absolute h-28 w-36", className)} aria-hidden="true">
      <div
        className="absolute inset-0 bg-gradient-to-br from-primary to-violet-500"
        style={{ clipPath: "polygon(0 0, 66% 0, 0 58%)" }}
      />
      <div
        className="absolute inset-0 bg-gradient-to-br from-violet-200 to-primary/40"
        style={{ clipPath: "polygon(0 0, 36% 0, 0 30%)" }}
      />
    </div>
  );
}

// Soft dotted texture + a gentle centered glow, layered over a fixed white
// "physical card" base — this is a single background-image stack (not a
// Tailwind class) so the base tone can never be clobbered by dark mode.
const TEXTURE_PATTERN: CSSProperties = {
  backgroundImage: `
    radial-gradient(hsl(var(--primary) / 0.09) 1px, transparent 1.3px),
    radial-gradient(circle at 50% 22%, hsl(var(--primary) / 0.07), transparent 60%),
    linear-gradient(to bottom, #ffffff, #f8fafc)
  `,
  backgroundSize: "15px 15px, 100% 100%, 100% 100%",
};

function StudentIdHeader() {
  return (
    <div className="flex flex-col items-center gap-1">
      <div className="flex items-center gap-1.5 text-slate-800">
        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/10">
          <GraduationCap className="h-3 w-3 text-primary" />
        </span>
        <span className="font-display text-[12.5px] font-bold tracking-tight">{SCHOOL_PROFILE.name}</span>
      </div>
      <p className="font-display text-[9px] font-medium uppercase tracking-[0.3em] text-slate-400">
        Student Identity Card
      </p>
    </div>
  );
}

function StudentPhotoSection({ name, photoUrl }: { name: string; photoUrl?: string }) {
  const initials = name.trim().split(/\s+/).map((p) => p[0]).slice(0, 2).join("").toUpperCase();
  return (
    <div className="group/photo relative mt-5 h-28 w-28">
      <div className="absolute inset-[-6px] rounded-full border border-primary/25 transition-transform duration-300 group-hover/photo:scale-105" />
      <span className="relative block h-full w-full overflow-hidden rounded-full bg-white shadow-[0_0_0_3px_white,0_0_0_5px_hsl(var(--primary)/0.65),0_10px_22px_-6px_hsl(var(--primary)/0.45)] transition-shadow duration-300 group-hover/photo:shadow-[0_0_0_3px_white,0_0_0_5px_hsl(var(--primary)/0.8),0_10px_28px_-4px_hsl(var(--primary)/0.6)]">
        {photoUrl ? (
          <img src={photoUrl} alt={name} className="h-full w-full object-cover" />
        ) : (
          <span className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary to-violet-500 text-[30px] font-bold text-primary-foreground">
            {initials}
          </span>
        )}
      </span>
    </div>
  );
}

function InfoField({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0 flex-1">
      <p className="font-display text-[9px] font-semibold uppercase tracking-[0.14em] text-slate-400">{label}</p>
      <p className="mt-0.5 truncate text-[13px] font-bold text-slate-800">{value}</p>
    </div>
  );
}

function StudentInfoPanel({ roll, admissionNo }: { roll: string; admissionNo: string }) {
  return (
    <div className="mt-5 flex w-full items-center gap-3 rounded-2xl border border-primary/20 bg-white/60 px-4 py-3 shadow-sm backdrop-blur-md">
      <InfoField label="Roll No" value={roll} />
      <span className="h-8 w-px shrink-0 bg-primary/15" />
      <InfoField label="Admission No" value={admissionNo} />
    </div>
  );
}

function StudentBarcodeSection({ admissionNo }: { admissionNo: string }) {
  return (
    <div className="mt-5 w-full">
      <div className="flex items-center justify-center gap-[1.5px] py-1">
        {BARCODE_PATTERN.map((w, i) => (
          <span key={i} className="block h-8 bg-slate-900" style={{ width: `${w}px` }} />
        ))}
      </div>
      <p className="mt-1.5 font-display text-[10px] font-medium tracking-[0.2em] text-slate-400">
        ID {admissionNo}
      </p>
    </div>
  );
}

function ActionRow({ children }: { children: ReactNode }) {
  return <div className="mt-3 grid grid-cols-2 gap-2">{children}</div>;
}

/**
 * Premium student ID-card widget for the profile sidebar — true ID-card
 * proportions, a fixed light "physical card" face with gradient corner
 * accents, a dotted texture, a glossy top highlight, a ringed photo, a
 * frosted identity panel and a barcode + ID footer. Print/Correction actions
 * live in a separate row below the card, not inside its frame.
 */
export function StudentProfileIdentityCard({
  name,
  className,
  section,
  roll,
  admissionNo,
  photoUrl,
  onRequestCorrection,
  onPrint,
}: {
  name: string;
  className: string;
  section: string;
  roll: string;
  admissionNo: string;
  photoUrl?: string;
  onRequestCorrection: () => void;
  onPrint: () => void;
}) {
  return (
    <Reveal>
      <div>
        <div
          className="group relative mx-auto aspect-[54/86] w-full max-w-[300px] overflow-hidden rounded-[28px] border border-primary/30 shadow-[0_14px_40px_-10px_hsl(var(--primary)/0.35)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_48px_-8px_hsl(var(--primary)/0.45)]"
          style={TEXTURE_PATTERN}
        >
          <CornerAccent className="left-0 top-0" />
          <CornerAccent className="bottom-0 right-0 rotate-180" />

          {/* glossy top highlight — a soft diagonal glass reflection */}
          <div
            className="pointer-events-none absolute -left-6 -top-10 h-24 w-[130%] rotate-[-4deg] bg-gradient-to-b from-white/70 to-transparent blur-sm"
            aria-hidden="true"
          />
          {/* inner glass edge */}
          <div className="pointer-events-none absolute inset-0 rounded-[28px] ring-1 ring-inset ring-white/60" aria-hidden="true" />

          <div className="relative flex h-full flex-col items-center px-6 pb-6 pt-6 text-center">
            <StudentIdHeader />
            <StudentPhotoSection name={name} photoUrl={photoUrl} />

            <h2 className="mt-4 font-display text-[20px] font-bold leading-tight text-primary">{name}</h2>
            <p className="text-[12.5px] font-medium text-violet-600">
              Student · {className} {section}
            </p>

            <StudentInfoPanel roll={roll} admissionNo={admissionNo} />
            <StudentBarcodeSection admissionNo={admissionNo} />
          </div>
        </div>

        <ActionRow>
          <StudentSecondaryButton onClick={onPrint}>
            <Printer className="h-3.5 w-3.5" /> Print
          </StudentSecondaryButton>
          <StudentPrimaryButton onClick={onRequestCorrection}>
            <Pencil className="h-3.5 w-3.5" /> Correct Info
          </StudentPrimaryButton>
        </ActionRow>
      </div>
    </Reveal>
  );
}
