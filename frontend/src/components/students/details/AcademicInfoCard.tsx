import { GraduationCap } from "lucide-react";

import { DetailCard } from "@/components/ui/DetailCard";
import type { StudentDetailMock } from "@/data/studentDetailsData";
import type { Student } from "@/data/studentsData";

function Row({ label, value }: { label: string; value?: string | null }) {
  return (
    <div>
      <p className="text-[10.5px] font-semibold uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-0.5 text-sm font-medium text-foreground">{value || "—"}</p>
    </div>
  );
}

interface Props { student: Student; mock: StudentDetailMock; }

export function AcademicInfoCard({ student, mock }: Props) {
  const { academicExtra } = mock;
  return (
    <DetailCard icon={GraduationCap} title="Academic Information">
      <div className="grid grid-cols-2 gap-x-6 gap-y-4">
        <Row label="Class"           value={student.className} />
        <Row label="Section"         value={student.section ? `Section ${student.section}` : "—"} />
        <Row label="Roll Number"     value={String(student.roll)} />
        <Row label="House"           value={academicExtra.house} />
        <Row label="Admission No"    value={student.admissionNo} />
        <Row label="Registration No" value={student.registrationNo} />
        <Row label="Previous School" value={academicExtra.previousSchool} />
        <Row label="Class Teacher"   value={academicExtra.classTeacher} />
        <Row label="Session"         value={academicExtra.session} />
        <Row label="Medium"          value={academicExtra.medium} />
        <Row label="Shift"           value={academicExtra.shift} />
        <Row label="Subjects"        value={`${academicExtra.subjectsCount} subjects`} />
      </div>
    </DetailCard>
  );
}
