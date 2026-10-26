import { Banknote, Landmark, ShieldAlert, ShieldX, Smartphone } from "lucide-react";

import { Reveal } from "@/components/motion";
import { KPITrendCard } from "@/components/ui/KPITrendCard";
import type { Payment } from "@/api/types/billing";
import { useMoney } from "@/api/billing";

export function PaymentsSummaryCards({ payments: all }: { payments: Payment[] }) {
  const money = useMoney();
  const payments = all.filter((p) => p.status === "Completed");
  const cash = payments.filter((p) => p.method === "Cash").reduce((s, p) => s + p.amount, 0);
  const bank = payments.filter((p) => p.method === "Bank Transfer").reduce((s, p) => s + p.amount, 0);
  const online = payments.filter((p) => ["Card", "Online Payment", "Online Wallet", "Mobile Banking"].includes(p.method)).reduce((s, p) => s + p.amount, 0);
  const reversed = all.filter((p) => p.status === "Reversed").length;
  const cheque = payments.filter((p) => p.method === "Cheque").reduce((s, p) => s + p.amount, 0);

  const stats = [
    {
      label: "Payments", value: payments.length, icon: Banknote, cls: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
    },
    {
      label: "Cash", value: `${money(cash)}`, icon: Banknote, cls: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    },
    {
      label: "Bank Transfer", value: `${money(bank)}`, icon: Landmark, cls: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    },
    {
      label: "Online", value: `${money(online)}`, icon: Smartphone, cls: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    },
    {
      label: "Cheque", value: money(cheque), icon: ShieldAlert, cls: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
    },
    {
      label: "Reversed", value: reversed, icon: ShieldX, cls: "bg-rose-500/10 text-rose-600 dark:text-rose-400",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
      {stats.map((s, i) => (
        <Reveal key={s.label} delay={i * 40}>
          <KPITrendCard
            label={s.label}
            value={s.value}
            icon={s.icon}
            iconCls={s.cls}
          />
        </Reveal>
      ))}
    </div>
  );
}
