import { ChevronLeft } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";

import { ReceiptPreview } from "@/components/billing/ReceiptPreview";
import { Button } from "@/components/ui/button";
import { PremiumCard } from "@/components/ui/PremiumCard";
import { PremiumSkeleton } from "@/components/ui/PremiumSkeleton";
import { usePayment } from "@/api/billing";
import { errorMessage } from "@/api/http";

export function BillingReceiptDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const query = usePayment(id);

  if (query.isLoading) return <PremiumSkeleton className="mx-auto h-96 max-w-md rounded-2xl" />;
  if (!query.data) {
    return (
      <PremiumCard className="flex flex-col items-center gap-3 py-16 text-center">
        <p className="text-[13px] font-medium text-foreground">{query.isError ? errorMessage(query.error) : "Receipt not found"}</p>
        <Button variant="outline" size="sm" onClick={() => navigate("/billing/payments")}>Back to Payments</Button>
      </PremiumCard>
    );
  }

  const { payment } = query.data;
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between print:hidden">
        <Button variant="ghost" size="sm" className="h-8 gap-1.5 text-[12.5px]" onClick={() => navigate("/billing/payments")}>
          <ChevronLeft className="h-3.5 w-3.5" /> Back to Payments
        </Button>
        <Button variant="outline" size="sm" className="h-8 text-[12.5px]" onClick={() => navigate(`/billing/invoices/${payment.invoiceId}`)}>
          View invoice {payment.invoiceNo}
        </Button>
      </div>
      <ReceiptPreview payment={payment} />
    </div>
  );
}
