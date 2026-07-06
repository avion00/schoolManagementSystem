import { MapPin } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ContactInfo } from "@/data/studentDetailsData";

function Row({ label, value }: { label: string; value?: string | null }) {
  return (
    <div>
      <p className="text-[10.5px] font-semibold uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-0.5 text-sm font-medium text-foreground">{value || "—"}</p>
    </div>
  );
}

export function ContactAddressCard({ contact }: { contact: ContactInfo }) {
  return (
    <Card className="rounded-2xl shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm font-semibold">
          <MapPin className="h-4 w-4 text-primary" />
          Contact & Address
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="grid grid-cols-2 gap-x-6 gap-y-4">
          <Row label="Email"   value={contact.email} />
          <Row label="Mobile"  value={contact.mobile} />
        </div>

        <div className="h-px bg-border/60" />

        <div className="grid grid-cols-2 gap-x-6 gap-y-4">
          <Row label="Current Address"   value={contact.currentAddress} />
          <Row label="Permanent Address" value={contact.permanentAddress} />
          <Row label="City"              value={contact.city} />
          <Row label="State / Province"  value={contact.state} />
          <Row label="Country"           value={contact.country} />
          <Row label="Postal Code"       value={contact.postalCode} />
        </div>
      </CardContent>
    </Card>
  );
}
