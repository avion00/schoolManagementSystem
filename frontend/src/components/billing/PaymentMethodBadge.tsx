import { Banknote, CreditCard, Landmark, ScrollText, Smartphone, Wallet, type LucideIcon } from "lucide-react";

import type { PaymentMethod } from "@/data/billingData";
import { cn } from "@/lib/utils";

const METHOD_ICON: Record<PaymentMethod, LucideIcon> = {
  Cash: Banknote,
  "Bank Transfer": Landmark,
  Card: CreditCard,
  "Online Wallet": Wallet,
  "Mobile Banking": Smartphone,
  Cheque: ScrollText,
};

export function PaymentMethodBadge({ method, className }: { method: PaymentMethod; className?: string }) {
  const Icon = METHOD_ICON[method];
  return (
    <span className={cn("inline-flex items-center gap-1.5 whitespace-nowrap rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium text-foreground", className)}>
      <Icon className="h-3 w-3 text-muted-foreground" />
      {method}
    </span>
  );
}
