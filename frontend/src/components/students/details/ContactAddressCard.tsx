import { MapPin } from "lucide-react";

import { DetailCard } from "@/components/ui/DetailCard";
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
    <DetailCard icon={MapPin} title="Contact & Address">
      <div className="space-y-5">
        <div className="grid grid-cols-2 gap-x-6 gap-y-4">
          <Row label="Email"   value={contact.email} />
          <Row label="Mobile"  value={contact.mobile} />
        </div>

        <div className="h-px bg-neutral-200/80 dark:bg-neutral-800" />

        <div className="grid grid-cols-2 gap-x-6 gap-y-4">
          <Row label="Current Address"   value={contact.currentAddress} />
          <Row label="Permanent Address" value={contact.permanentAddress} />
          <Row label="City"              value={contact.city} />
          <Row label="State / Province"  value={contact.state} />
          <Row label="Country"           value={contact.country} />
          <Row label="Postal Code"       value={contact.postalCode} />
        </div>
      </div>
    </DetailCard>
  );
}
