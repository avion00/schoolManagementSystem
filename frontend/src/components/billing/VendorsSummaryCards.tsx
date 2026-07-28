import { Building2, CheckCircle2, ShoppingCart, Wallet } from "lucide-react";

import { CATEGORICAL_COLORS, STATUS_COLORS } from "@/components/charts/palette";
import { Reveal } from "@/components/motion";
import { KPITrendCard } from "@/components/ui/KPITrendCard";
import { METRIC_TONES } from "@/components/ui/MetricCard";
import type { Vendor } from "@/data/billingData";

const SPARK = {
  total: [{ value: 8 }, { value: 8 }, { value: 9 }, { value: 9 }, { value: 9 }, { value: 10 }, { value: 10 }],
  active: [{ value: 7 }, { value: 7 }, { value: 8 }, { value: 8 }, { value: 9 }, { value: 9 }, { value: 9 }],
  purchases: [{ value: 1680000 }, { value: 1740000 }, { value: 1790000 }, { value: 1850000 }, { value: 1900000 }, { value: 1930000 }, { value: 1954000 }],
  outstanding: [{ value: 112000 }, { value: 108000 }, { value: 103000 }, { value: 99500 }, { value: 97000 }, { value: 96500 }, { value: 96000 }],
};

export function VendorsSummaryCards({ vendors }: { vendors: Vendor[] }) {
  const stats = [
    {
      label: "Total Vendors", value: vendors.length, icon: Building2, tone: METRIC_TONES.blue,
      sparkColor: CATEGORICAL_COLORS[0], sparkData: SPARK.total,
      trend: { value: "+2.0%", up: true, compareLabel: "vs last month" },
    },
    {
      label: "Active", value: vendors.filter((v) => v.status === "Active").length, icon: CheckCircle2, tone: METRIC_TONES.green,
      sparkColor: STATUS_COLORS.good, sparkData: SPARK.active,
      trend: { value: "+1.5%", up: true, compareLabel: "vs last month" },
    },
    {
      label: "Total Purchases", value: `$${vendors.reduce((s, v) => s + v.totalPurchases, 0).toLocaleString()}`, icon: ShoppingCart, tone: METRIC_TONES.purple,
      sparkColor: CATEGORICAL_COLORS[4], sparkData: SPARK.purchases,
      trend: { value: "+6.4%", up: true, compareLabel: "vs last month" },
    },
    {
      label: "Outstanding Balance", value: `$${vendors.reduce((s, v) => s + v.outstandingBalance, 0).toLocaleString()}`, icon: Wallet, tone: METRIC_TONES.red,
      sparkColor: STATUS_COLORS.critical, sparkData: SPARK.outstanding,
      trend: { value: "-3.6%", up: false, compareLabel: "vs last month" },
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
            trend={s.trend}
            sparklineData={s.sparkData}
            sparklineColor={s.sparkColor}
          />
        </Reveal>
      ))}
    </div>
  );
}
