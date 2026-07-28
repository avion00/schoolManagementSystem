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
      sparkData: [{ value: 14 }, { value: 15 }, { value: 16 }, { value: 16 }, { value: 17 }, { value: 17 }, { value: 18 }],
      trend: { value: "+5.9%", up: true, compareLabel: "vs last month" },
    },
    {
      label: "Cash", value: `$${cash.toLocaleString()}`, icon: Banknote, cls: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
      sparkColor: STATUS_COLORS.good,
      sparkData: [{ value: 38000 }, { value: 40000 }, { value: 42000 }, { value: 44000 }, { value: 45000 }, { value: 46000 }, { value: 47000 }],
      trend: { value: "+4.4%", up: true, compareLabel: "vs last month" },
    },
    {
      label: "Bank Transfer", value: `$${bank.toLocaleString()}`, icon: Landmark, cls: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
      sparkColor: CATEGORICAL_COLORS[0],
      sparkData: [{ value: 70000 }, { value: 75000 }, { value: 78000 }, { value: 82000 }, { value: 85000 }, { value: 88000 }, { value: 90000 }],
      trend: { value: "+7.1%", up: true, compareLabel: "vs last month" },
    },
    {
      label: "Online", value: `$${online.toLocaleString()}`, icon: Smartphone, cls: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
      sparkColor: CATEGORICAL_COLORS[5],
      sparkData: [{ value: 22000 }, { value: 24000 }, { value: 26000 }, { value: 27000 }, { value: 28000 }, { value: 29000 }, { value: 30000 }],
      trend: { value: "+8.0%", up: true, compareLabel: "vs last month" },
    },
    {
      label: "Pending Verification", value: pending, icon: ShieldAlert, cls: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
      sparkColor: STATUS_COLORS.warning,
      sparkData: [{ value: 5 }, { value: 4 }, { value: 4 }, { value: 3 }, { value: 3 }, { value: 2 }, { value: 2 }],
      trend: { value: "-25.0%", up: false, compareLabel: "vs last month" },
    },
    {
      label: "Failed Payments", value: failed, icon: ShieldX, cls: "bg-rose-500/10 text-rose-600 dark:text-rose-400",
      sparkColor: STATUS_COLORS.critical,
      sparkData: [{ value: 4 }, { value: 3 }, { value: 3 }, { value: 2 }, { value: 2 }, { value: 1 }, { value: 1 }],
      trend: { value: "-33.3%", up: false, compareLabel: "vs last month" },
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
            trend={s.trend}
            sparklineData={s.sparkData}
            sparklineColor={s.sparkColor}
          />
        </Reveal>
      ))}
    </div>
  );
}
