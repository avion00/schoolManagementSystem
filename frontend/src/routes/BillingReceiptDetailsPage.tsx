import { ChevronLeft } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";

import { ReceiptPreview } from "@/components/billing/ReceiptPreview";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PAYMENTS } from "@/data/billingData";

export function BillingReceiptDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const payment = PAYMENTS.find((p) => String(p.id) === id);

  if (!payment) {
    return (
      <Card className="rounded-2xl border-border/60 shadow-sm">
        <CardContent className="flex flex-col items-center gap-3 py-16 text-center">
          <p className="text-[13px] font-medium text-foreground">Receipt not found</p>
          <Button variant="outline" size="sm" onClick={() => navigate("/billing/payments")}>Back to Payments</Button>
        </CardContent>
      </Card>
    );
  }

  const receiptNo = `RCPT-2026-${String(payment.id).padStart(4, "0")}`;

  return (
    <div className="space-y-4">
      <Button variant="ghost" size="sm" className="h-8 gap-1.5 text-[12.5px] print:hidden" onClick={() => navigate("/billing/payments")}>
        <ChevronLeft className="h-3.5 w-3.5" /> Back to Payments
      </Button>
      <ReceiptPreview payment={payment} receiptNo={receiptNo} />
    </div>
  );
}
