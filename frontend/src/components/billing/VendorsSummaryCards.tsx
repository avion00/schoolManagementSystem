import { Building2, CheckCircle2, ShoppingCart, Wallet } from "lucide-react";

import { CATEGORICAL_COLORS, STATUS_COLORS } from "@/components/charts/palette";
import { Reveal } from "@/components/motion";
import { KPITrendCard } from "@/components/ui/KPITrendCard";
import { METRIC_TONES } from "@/components/ui/MetricCard";
import type { Vendor } from "@/api/types/billing";
import { useMoney } from "@/api/billing";


export function VendorsSummaryCards({ vendors }: { vendors: Vendor[] }) {
  const money = useMoney();
  const stats = [
    {
      label: "Total Vendors", value: vendors.length, icon: Building2, tone: METRIC_TONES.blue,
      sparkColor: CATEGORICAL_COLORS[0],
    },
    {
      label: "Active", value: vendors.filter((v) => v.status === "Active").length, icon: CheckCircle2, tone: METRIC_TONES.green,
      sparkColor: STATUS_COLORS.good,
    },
    {
      label: "Total Purchases", value: `${money(vendors.reduce((s, v) => s + v.totalPurchases, 0))}`, icon: ShoppingCart, tone: METRIC_TONES.purple,
      sparkColor: CATEGORICAL_COLORS[4],
    },
    {
      label: "Outstanding Balance", value: `${money(vendors.reduce((s, v) => s + v.outstandingBalance, 0))}`, icon: Wallet, tone: METRIC_TONES.red,
      sparkColor: STATUS_COLORS.critical,
    },
  ];
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {stats.map((s, i) => (
        <Reveal key={s.label} delay={i * 40}>
          <KPITrendCard
            label={s.label}
            value={s.value}
            icon={s.icon}
            iconCls={s.tone}
            sparklineColor={s.sparkColor}
          />
        </Reveal>
      ))}
    </div>
  );
}
