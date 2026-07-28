import { Wallet, Users, Package, Zap, Wrench, Bus, Receipt, type LucideIcon } from "lucide-react";

import { CATEGORICAL_COLORS, STATUS_COLORS } from "@/components/charts/palette";
import { Reveal } from "@/components/motion";
import { KPITrendCard, type KPITrend } from "@/components/ui/KPITrendCard";
import { METRIC_TONES } from "@/components/ui/MetricCard";
import type { Expense } from "@/data/billingData";

const BUCKETS: Record<string, string[]> = {
  "Staff Salary": ["Teacher Salary", "Staff Salary"],
  Materials: ["Stationery", "Books", "Lab Materials", "Furniture"],
  Utilities: ["Electricity", "Internet", "Rent"],
  Maintenance: ["Maintenance"],
  Transport: ["Transport Fuel"],
  Other: ["Hostel", "Library", "Events", "Miscellaneous"],
};

interface CardMeta {
  icon: LucideIcon;
  tone: string;
  sparkColor: string;
  sparkData: Record<string, number>[];
  trend: KPITrend;
}

const META: Record<string, CardMeta> = {
  "Total Expenses": {
    icon: Wallet, tone: METRIC_TONES.red, sparkColor: STATUS_COLORS.critical,
    sparkData: [{ value: 335000 }, { value: 342000 }, { value: 350000 }, { value: 358000 }, { value: 364000 }, { value: 369000 }, { value: 372300 }],
    trend: { value: "+5.6%", up: true, compareLabel: "vs last month" },
  },
  "Staff Salary": {
    icon: Users, tone: METRIC_TONES.blue, sparkColor: CATEGORICAL_COLORS[0],
    sparkData: [{ value: 68000 }, { value: 69000 }, { value: 70500 }, { value: 71000 }, { value: 72000 }, { value: 72500 }, { value: 73000 }],
    trend: { value: "+2.1%", up: true, compareLabel: "vs last month" },
  },
  Materials: {
    icon: Package, tone: METRIC_TONES.amber, sparkColor: STATUS_COLORS.warning,
    sparkData: [{ value: 62000 }, { value: 66000 }, { value: 71000 }, { value: 69000 }, { value: 74000 }, { value: 77000 }, { value: 79300 }],
    trend: { value: "+7.8%", up: true, compareLabel: "vs last month" },
  },
  Utilities: {
    icon: Zap, tone: METRIC_TONES.purple, sparkColor: CATEGORICAL_COLORS[4],
    sparkData: [{ value: 84000 }, { value: 85500 }, { value: 83000 }, { value: 87000 }, { value: 86000 }, { value: 88500 }, { value: 89600 }],
    trend: { value: "+1.9%", up: true, compareLabel: "vs last month" },
  },
  Maintenance: {
    icon: Wrench, tone: METRIC_TONES.cyan, sparkColor: CATEGORICAL_COLORS[5],
    sparkData: [{ value: 19000 }, { value: 17500 }, { value: 16800 }, { value: 15900 }, { value: 15600 }, { value: 15300 }, { value: 15200 }],
    trend: { value: "-4.5%", up: false, compareLabel: "vs last month" },
  },
  Transport: {
    icon: Bus, tone: METRIC_TONES.green, sparkColor: STATUS_COLORS.good,
    sparkData: [{ value: 21000 }, { value: 22200 }, { value: 21800 }, { value: 23000 }, { value: 23600 }, { value: 24100 }, { value: 24500 }],
    trend: { value: "+3.4%", up: true, compareLabel: "vs last month" },
  },
  Other: {
    icon: Receipt, tone: METRIC_TONES.neutral, sparkColor: CATEGORICAL_COLORS[2],
    sparkData: [{ value: 95000 }, { value: 92500 }, { value: 91000 }, { value: 93500 }, { value: 90800 }, { value: 91600 }, { value: 90700 }],
    trend: { value: "-1.6%", up: false, compareLabel: "vs last month" },
  },
};

export function ExpensesSummaryCards({ expenses }: { expenses: Expense[] }) {
  const bucketTotals: Record<string, number> = { "Staff Salary": 0, Materials: 0, Utilities: 0, Maintenance: 0, Transport: 0, Other: 0 };
  expenses.forEach((e) => {
    const bucket = Object.entries(BUCKETS).find(([, cats]) => cats.includes(e.category))?.[0];
    if (bucket) bucketTotals[bucket] += e.amount;
  });
  const total = expenses.reduce((s, e) => s + e.amount, 0);

  const cards = [
    { label: "Total Expenses", value: total },
    ...Object.entries(bucketTotals).map(([label, value]) => ({ label, value })),
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-7">
      {cards.map((c, i) => {
        const meta = META[c.label];
        return (
          <Reveal key={c.label} delay={i * 40}>
            <KPITrendCard
              label={c.label}
              value={`$${c.value.toLocaleString()}`}
              icon={meta.icon}
              iconCls={meta.tone}
              trend={meta.trend}
              sparklineData={meta.sparkData}
              sparklineColor={meta.sparkColor}
            />
          </Reveal>
        );
      })}
    </div>
  );
}
