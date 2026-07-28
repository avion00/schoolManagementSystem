import { ArrowLeft, Download, Pencil, Printer } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

import { StudentStatusBadge } from "@/components/students/StudentStatusBadge";
import { Button } from "@/components/ui/button";
import { PremiumCard } from "@/components/ui/PremiumCard";
import type { StudentDetailMock } from "@/data/studentDetailsData";
import type { Student } from "@/data/studentsData";
import { cn } from "@/lib/utils";

function initials(name: string) {
  const p = name.trim().split(/\s+/);
  return (p[0][0] + (p[p.length - 1]?.[0] ?? "")).toUpperCase();
}

interface Props {
  student: Student;
  mock: StudentDetailMock;
}

export function StudentProfileHero({ student, mock }: Props) {
  const navigate = useNavigate();

  return (
    <PremiumCard className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-card to-accent/20">
      {/* Decorative circles */}
      <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-primary/5" />
      <div className="pointer-events-none absolute -bottom-12 right-24 h-40 w-40 rounded-full bg-primary/5" />

      <div className="relative flex flex-col gap-6 p-5 sm:flex-row sm:items-start sm:gap-8 md:p-7">
        {/* ── Avatar + core identity ─────────────────────────────────────── */}
        <div className="flex items-start gap-5">
          {/* Large avatar */}
          <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-secondary text-2xl font-bold text-secondary-foreground">
            {initials(student.name)}
          </div>

          {/* Name + meta */}
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-xl font-bold tracking-tight text-foreground">{student.name}</h2>
              <StudentStatusBadge status={student.status} />
            </div>

            <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1.5">
              <Meta label="Reg. No"    value={student.registrationNo} mono />
              <Meta label="Adm. No"   value={student.admissionNo}    mono />
              <Meta label="Class"      value={student.className} />
              {student.section && <Meta label="Section" value={`Section ${student.section}`} />}
              <Meta label="Roll"       value={String(student.roll)} />
              <Meta label="House"      value={mock.academicExtra.house} />
            </div>

            <div className="mt-2.5 flex flex-wrap gap-x-5 gap-y-1">
              <Meta label="Gender"     value={student.gender} />
              <Meta label="Session"    value={mock.academicExtra.session} />
              <Meta label="Shift"      value={mock.academicExtra.shift} />
            </div>
          </div>
        </div>

        {/* ── Action buttons ────────────────────────────────────────────── */}
        <div className="flex shrink-0 flex-wrap items-center gap-2 sm:ml-auto sm:flex-col sm:items-end">
          <Button
            variant="default"
            size="sm"
            className="gap-1.5"
            onClick={() => toast.info("Edit student — coming soon")}
          >
            <Pencil className="h-3.5 w-3.5" />
            Edit
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5"
            onClick={() => window.print()}
          >
            <Printer className="h-3.5 w-3.5" />
            Print
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5"
            onClick={() => toast.info("Download profile — coming soon")}
          >
            <Download className="h-3.5 w-3.5" />
            Download
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="gap-1.5 text-muted-foreground"
            onClick={() => navigate("/students")}
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back
          </Button>
        </div>
      </div>
    </PremiumCard>
  );
}

function Meta({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <span className="flex items-center gap-1">
      <span className="text-[11px] text-muted-foreground">{label}:</span>
      <span className={cn("text-[12px] font-semibold text-foreground", mono && "font-mono")}>
        {value}
      </span>
    </span>
  );
}
