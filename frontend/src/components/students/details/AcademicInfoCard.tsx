import { GraduationCap } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
    <Card className="rounded-2xl shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm font-semibold">
          <GraduationCap className="h-4 w-4 text-primary" />
          Academic Information
        </CardTitle>
      </CardHeader>
      <CardContent>
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
      </CardContent>
    </Card>
  );
}
