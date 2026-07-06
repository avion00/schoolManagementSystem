import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Parent } from "@/data/parentsData";
import type { ParentDetailMock } from "@/data/parentDetailsData";

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 py-1.5">
      <span className="min-w-[140px] text-[12.5px] text-muted-foreground">{label}</span>
      <span className="text-right text-[13px] font-medium text-foreground">{value || "—"}</span>
    </div>
  );
}

export function ParentInfoCard({ parent, mock }: { parent: Parent; mock: ParentDetailMock }) {
  return (
    <Card className="border-border/60 shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-[14px] font-semibold">Personal & Contact</CardTitle>
      </CardHeader>
      <CardContent className="divide-y divide-border/40">
        <Row label="Full Name"          value={parent.name} />
        <Row label="Gender"             value={parent.gender} />
        <Row label="Relation"           value={parent.relation} />
        <Row label="Occupation"         value={parent.occupation} />
        <Row label="Nationality"        value={mock.nationality} />
        <Row label="Religion"           value={mock.religion} />
        <Row label="Phone"              value={parent.phone} />
        <Row label="Alternate Phone"    value={parent.alternatePhone || "—"} />
        <Row label="Email"              value={parent.email} />
        <Row label="Current Address"    value={parent.address} />
        <Row label="Permanent Address"  value={mock.permanentAddress} />
        <Row label="Emergency Contact"  value={mock.emergencyContact} />
        <Row label="Emergency Relation" value={mock.emergencyRelation} />
      </CardContent>
    </Card>
  );
}
