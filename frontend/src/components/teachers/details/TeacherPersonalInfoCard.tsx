import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import type { Teacher } from "@/data/teachersData";
import type { TeacherPersonalExtra } from "@/data/teacherDetailsData";

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 py-1.5">
      <span className="min-w-[140px] text-[12.5px] text-muted-foreground">{label}</span>
      <span className="text-right text-[13px] font-medium text-foreground">{value ?? "—"}</span>
    </div>
  );
}

function age(dob: string) {
  const d = new Date(dob);
  const now = new Date();
  return now.getFullYear() - d.getFullYear() -
    (now < new Date(now.getFullYear(), d.getMonth(), d.getDate()) ? 1 : 0);
}

function fmtDate(d: string) {
  return new Date(d).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
}

export function TeacherPersonalInfoCard({
  teacher,
  extra,
}: {
  teacher: Teacher;
  extra: TeacherPersonalExtra;
}) {
  return (
    <Card className="border-border/60 shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-[14px] font-semibold">Personal Information</CardTitle>
      </CardHeader>
      <CardContent className="space-y-0 divide-y divide-border/40">
        <Row label="Gender"         value={teacher.gender} />
        <Row label="Date of Birth"  value={`${fmtDate(teacher.dateOfBirth)} (${age(teacher.dateOfBirth)} yrs)`} />
        <Row label="Blood Group"    value={extra.bloodGroup} />
        <Row label="Nationality"    value={extra.nationality} />
        <Row label="Religion"       value={extra.religion} />
        <Row label="Marital Status" value={extra.maritalStatus} />
        {extra.maritalStatus === "Married" && (
          <Row label="Spouse Name" value={extra.spouseName} />
        )}
        <Separator className="my-1" />
        <Row label="Emergency Contact" value={extra.emergencyContact} />
        <Row label="Relation"          value={extra.emergencyRelation} />
        <Row label="Permanent Address" value={extra.permanentAddress} />
      </CardContent>
    </Card>
  );
}
