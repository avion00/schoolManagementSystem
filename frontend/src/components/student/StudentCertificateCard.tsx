import { Download, FileBadge } from "lucide-react";
import { toast } from "sonner";

import { PremiumBadge } from "@/components/ui/PremiumBadge";
import { PremiumCard } from "@/components/ui/PremiumCard";
import { Button } from "@/components/ui/button";
import type { Certificate } from "@/data/studentDashboardData";

export function StudentCertificateCard({ certificate }: { certificate: Certificate }) {
  return (
    <PremiumCard className="flex items-center gap-3 p-4">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
        <FileBadge className="h-5 w-5" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-[13px] font-medium text-foreground">{certificate.title}</p>
        <p className="text-[11.5px] text-muted-foreground">{certificate.type}{certificate.issuedOn ? ` · Issued ${certificate.issuedOn}` : ""}</p>
      </div>
      {certificate.status === "Issued" ? (
        <Button size="sm" variant="outline" className="h-8 shrink-0 gap-1.5 text-[12px]" onClick={() => toast.success(`Downloading ${certificate.title}…`)}>
          <Download className="h-3.5 w-3.5" /> Download
        </Button>
      ) : (
        <PremiumBadge label="Pending" tone="warning" className="shrink-0" />
      )}
    </PremiumCard>
  );
}
