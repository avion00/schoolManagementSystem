import { ArrowLeft, Download, Pencil, Printer } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

import { StudentStatusBadge } from "@/components/students/StudentStatusBadge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { StudentDetailMock } from "@/data/studentDetailsData";
import type { Student } from "@/data/studentsData";
import { cn } from "@/lib/utils";

const PALETTE = [
  "from-blue-500 to-blue-600",
  "from-emerald-500 to-emerald-600",
  "from-violet-500 to-violet-600",
  "from-amber-500 to-amber-600",
  "from-rose-500 to-rose-600",
  "from-sky-500 to-sky-600",
  "from-pink-500 to-pink-600",
  "from-teal-500 to-teal-600",
];

function avatarGradient(name: string) {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = name.charCodeAt(i) + ((h << 5) - h);
  return PALETTE[Math.abs(h) % PALETTE.length];
}

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
    <Card className="rounded-2xl overflow-hidden shadow-sm">
      {/* colour strip */}
      <div className={cn("h-2 w-full bg-gradient-to-r", avatarGradient(student.name))} />

      <div className="flex flex-col gap-6 p-5 sm:flex-row sm:items-start sm:gap-8 md:p-7">
        {/* ── Avatar + core identity ─────────────────────────────────────── */}
        <div className="flex items-start gap-5">
          {/* Large avatar */}
          <div
            className={cn(
              "flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br text-2xl font-bold text-white shadow-md",
              avatarGradient(student.name),
            )}
          >
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
    </Card>
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
