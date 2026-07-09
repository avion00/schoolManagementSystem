import { Check, CheckCheck } from "lucide-react";

import type { MessageDeliveryStatus } from "@/data/messagesData";
import { cn } from "@/lib/utils";

export function ReadReceipt({ status }: { status: MessageDeliveryStatus }) {
  if (status === "sent") return <Check className="h-3.5 w-3.5 text-white/70" />;
  return (
    <CheckCheck className={cn("h-3.5 w-3.5", status === "seen" ? "text-sky-300" : "text-white/70")} />
  );
}
