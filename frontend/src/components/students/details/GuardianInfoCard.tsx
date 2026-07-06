import { Users } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { GuardianInfo } from "@/data/studentDetailsData";

function Row({ label, value }: { label: string; value?: string | null }) {
  return (
    <div>
      <p className="text-[10.5px] font-semibold uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-0.5 text-sm font-medium text-foreground">{value || "—"}</p>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground/60">{title}</p>
      <div className="grid grid-cols-2 gap-x-6 gap-y-4">{children}</div>
    </div>
  );
}

export function GuardianInfoCard({ guardian }: { guardian: GuardianInfo }) {
  return (
    <Card className="rounded-2xl shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm font-semibold">
          <Users className="h-4 w-4 text-primary" />
          Parent / Guardian Information
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <Section title="Father">
          <Row label="Name"       value={guardian.fatherName} />
          <Row label="Occupation" value={guardian.fatherOccupation} />
          <Row label="Phone"      value={guardian.fatherPhone} />
          <Row label="Email"      value={guardian.fatherEmail} />
        </Section>

        <div className="h-px bg-border/60" />

        <Section title="Mother">
          <Row label="Name"       value={guardian.motherName} />
          <Row label="Occupation" value={guardian.motherOccupation} />
          <Row label="Phone"      value={guardian.motherPhone} />
          <Row label="Email"      value={guardian.motherEmail} />
        </Section>

        <div className="h-px bg-border/60" />

        <Section title="Emergency">
          <Row label="Guardian Name"     value={guardian.guardianName} />
          <Row label="Relation"          value={guardian.guardianRelation} />
          <Row label="Guardian Phone"    value={guardian.guardianPhone} />
          <Row label="Emergency Contact" value={guardian.emergencyContact} />
        </Section>
      </CardContent>
    </Card>
  );
}
