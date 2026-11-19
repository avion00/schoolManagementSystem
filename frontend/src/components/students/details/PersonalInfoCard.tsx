import { User } from "lucide-react";

import { DetailCard } from "@/components/ui/DetailCard";
import type { StudentDetailView } from "@/api/types/students";
import type { Student } from "@/api/types/students";

function Row({ label, value }: { label: string; value?: string | null }) {
  return (
    <div>
      <p className="text-[10.5px] font-semibold uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-0.5 text-sm font-medium text-foreground">{value || "—"}</p>
    </div>
  );
}

function age(dob: string) {
  const diff = Date.now() - new Date(dob).getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25));
}

function fmt(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", { day: "2-digit", month: "short", year: "numeric" });
}

interface Props { student: Student; mock: StudentDetailView; }

export function PersonalInfoCard({ student, mock }: Props) {
  const { personalExtra } = mock;
  return (
    <DetailCard icon={User} title="Personal Information">
      <div className="grid grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-3">
        <Row label="Full Name"       value={student.name} />
        <Row label="Gender"          value={student.gender} />
        <Row label="Date of Birth"   value={fmt(student.dateOfBirth)} />
        <Row label="Age"             value={`${age(student.dateOfBirth)} years`} />
        <Row label="Blood Group"     value={personalExtra.bloodGroup} />
        <Row label="Nationality"     value={personalExtra.nationality} />
        <Row label="Religion"        value={personalExtra.religion} />
        <Row label="Student Type"    value={personalExtra.studentType} />
        <Row label="Admission Date"  value={fmt(student.dateOfBirth.replace(student.dateOfBirth.slice(0, 4), "2016"))} />
        <Row label="Academic Year"   value={mock.academicExtra.session} />
        <Row label="Status"          value={student.status.charAt(0).toUpperCase() + student.status.slice(1)} />
      </div>
    </DetailCard>
  );
}
