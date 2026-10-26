import { Banknote, Landmark, ShieldAlert, ShieldX, Smartphone } from "lucide-react";

import { CATEGORICAL_COLORS, STATUS_COLORS } from "@/components/charts/palette";
import { Reveal } from "@/components/motion";
import { KPITrendCard } from "@/components/ui/KPITrendCard";
import type { Payment } from "@/data/billingData";

export function PaymentsSummaryCards({ payments }: { payments: Payment[] }) {
  const cash = payments.filter((p) => p.method === "Cash").reduce((s, p) => s + p.amount, 0);
  const bank = payments.filter((p) => p.method === "Bank Transfer").reduce((s, p) => s + p.amount, 0);
  const online = payments.filter((p) => ["Card", "Online Wallet", "Mobile Banking"].includes(p.method)).reduce((s, p) => s + p.amount, 0);
  const pending = payments.filter((p) => p.status === "Pending").length;
  const failed = payments.filter((p) => p.status === "Failed").length;

  const stats = [
    {
      label: "Total Payments", value: payments.length, icon: Banknote, cls: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
      sparkColor: CATEGORICAL_COLORS[0],
    },
    {
      label: "Cash", value: `$${cash.toLocaleString()}`, icon: Banknote, cls: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
      sparkColor: STATUS_COLORS.good,
    },
    {
      label: "Bank Transfer", value: `$${bank.toLocaleString()}`, icon: Landmark, cls: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
      sparkColor: CATEGORICAL_COLORS[0],
    },
    {
      label: "Online", value: `$${online.toLocaleString()}`, icon: Smartphone, cls: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
      sparkColor: CATEGORICAL_COLORS[5],
    },
    {
      label: "Pending Verification", value: pending, icon: ShieldAlert, cls: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
      sparkColor: STATUS_COLORS.warning,
    },
    {
      label: "Failed Payments", value: failed, icon: ShieldX, cls: "bg-rose-500/10 text-rose-600 dark:text-rose-400",
      sparkColor: STATUS_COLORS.critical,
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
            sparklineColor={s.sparkColor}
          />
        </Reveal>
      ))}
    </div>
  );
}
