import { CreditCard, Download, MessageSquare } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

import { Reveal } from "@/components/motion";
import { StudentFeeSummary } from "@/components/student/StudentFeeSummary";
import { Button } from "@/components/ui/button";
import { PremiumCard } from "@/components/ui/PremiumCard";
import { feeBreakdown, feePayments } from "@/data/studentDashboardData";

export function StudentFees() {
  const navigate = useNavigate();

  return (
    <div className="space-y-4">
      <Reveal>
        <h1 className="text-lg font-semibold tracking-tight text-foreground">My Fees</h1>
        <p className="mt-0.5 text-[13px] text-muted-foreground">Your fee information only.</p>
      </Reveal>

      <Reveal delay={40} className="grid gap-4 lg:grid-cols-3">
        <StudentFeeSummary />

        <PremiumCard className="p-4 lg:col-span-2">
          <p className="mb-3 text-[13px] font-semibold text-foreground">Fee breakdown</p>
          <div className="space-y-2">
            {feeBreakdown.map((b) => (
              <div key={b.label} className="flex items-center justify-between text-[12.5px]">
                <span className="text-foreground">{b.label}</span>
                <span className="font-medium text-foreground">{b.amount}</span>
              </div>
            ))}
          </div>
          <div className="mt-3 flex flex-wrap gap-2 border-t border-border/60 pt-3">
            <Button size="sm" className="h-8 gap-1.5 text-[12px]" onClick={() => toast.info("Payment gateway is not connected yet — please pay at the accounts office.")}>
              <CreditCard className="h-3.5 w-3.5" /> Pay now
            </Button>
            <Button size="sm" variant="outline" className="h-8 gap-1.5 text-[12px]" onClick={() => navigate("/student/messages")}>
              <MessageSquare className="h-3.5 w-3.5" /> Contact accounts office
            </Button>
          </div>
        </PremiumCard>
      </Reveal>

      <Reveal delay={80}>
        <PremiumCard className="overflow-hidden">
          <p className="border-b border-border/60 p-4 text-[13px] font-semibold text-foreground">Payment history</p>
          <div className="divide-y divide-border/60">
            {feePayments.map((p) => (
              <div key={p.id} className="flex items-center justify-between gap-3 p-4">
                <div className="min-w-0">
                  <p className="truncate text-[13px] font-medium text-foreground">{p.label}</p>
                  <p className="truncate text-[11.5px] text-muted-foreground">{p.date} · {p.method} · {p.receiptNo}</p>
                </div>
                <div className="flex shrink-0 items-center gap-3">
                  <span className="text-[13px] font-semibold text-foreground">{p.amount}</span>
                  <Button size="sm" variant="outline" className="h-7 gap-1 px-2 text-[11.5px]" onClick={() => toast.success(`Downloading receipt ${p.receiptNo}…`)}>
                    <Download className="h-3.5 w-3.5" /> Receipt
                  </Button>
                </div>
              </div>
            ))}
            {feePayments.length === 0 && <p className="p-6 text-center text-[12.5px] text-muted-foreground">No payments recorded yet.</p>}
          </div>
        </PremiumCard>
      </Reveal>
    </div>
  );
}
