import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Teacher } from "@/data/teachersData";
import type { TeacherPersonalExtra } from "@/data/teacherDetailsData";

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 py-1.5">
      <span className="min-w-[140px] text-[12.5px] text-muted-foreground">{label}</span>
      <span className="text-right text-[13px] font-medium text-foreground">{value || "—"}</span>
    </div>
  );
}

export function TeacherContactCard({
  teacher,
  extra,
}: {
  teacher: Teacher;
  extra: TeacherPersonalExtra;
}) {
  return (
    <Card className="border-border/60 shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-[14px] font-semibold">Contact & Address</CardTitle>
      </CardHeader>
      <CardContent className="divide-y divide-border/40">
        <Row label="Phone"              value={teacher.phone} />
        <Row label="Email"              value={teacher.email} />
        <Row label="Emergency Contact"  value={extra.emergencyContact} />
        <Row label="Emergency Relation" value={extra.emergencyRelation} />
        <Row label="Current Address"    value={teacher.address} />
        <Row label="Permanent Address"  value={extra.permanentAddress} />
      </CardContent>
    </Card>
  );
}
