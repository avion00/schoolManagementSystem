import { useState } from "react";
import { toast } from "sonner";

import { Reveal } from "@/components/motion";
import { StudentCertificateCard } from "@/components/student/StudentCertificateCard";
import { Button } from "@/components/ui/button";
import { PremiumCard } from "@/components/ui/PremiumCard";
import { PremiumSelect } from "@/components/ui/PremiumSelect";
import { certificates as initialCertificates, requestCertificate, type CertificateType } from "@/data/studentDashboardData";

const TYPES: CertificateType[] = ["Character Certificate", "Transfer Certificate", "Achievement Certificate", "Participation Certificate", "Bonafide Certificate"];

export function StudentCertificates() {
  const [certificates, setCertificates] = useState(initialCertificates);
  const [type, setType] = useState<CertificateType>("Bonafide Certificate");

  function request() {
    requestCertificate(type);
    setCertificates([...initialCertificates]);
    toast.success(`${type} requested — the admin office will process it.`);
  }

  return (
    <div className="space-y-4">
      <Reveal>
        <h1 className="text-lg font-semibold tracking-tight text-foreground">Certificates</h1>
        <p className="mt-0.5 text-[13px] text-muted-foreground">Issued and requested certificates.</p>
      </Reveal>

      <Reveal delay={40}>
        <PremiumCard className="flex flex-wrap items-end gap-2 p-4">
          <div className="w-56">
            <label className="mb-1.5 block text-[12px] font-medium text-foreground">Request a certificate</label>
            <PremiumSelect value={type} onChange={(v) => setType(v as CertificateType)} options={TYPES.map((t) => ({ value: t, label: t }))} />
          </div>
          <Button size="sm" className="h-9 text-[12px]" onClick={request}>Request</Button>
        </PremiumCard>
      </Reveal>

      <Reveal delay={80} className="space-y-2">
        {certificates.map((c) => <StudentCertificateCard key={c.id} certificate={c} />)}
      </Reveal>
    </div>
  );
}
