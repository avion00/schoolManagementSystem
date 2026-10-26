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
  sparkData?: Record<string, number>[];
  trend?: KPITrend;
}

const META: Record<string, CardMeta> = {
  "Total Expenses": {
    icon: Wallet, tone: METRIC_TONES.red, sparkColor: STATUS_COLORS.critical,
  },
  "Staff Salary": {
    icon: Users, tone: METRIC_TONES.blue, sparkColor: CATEGORICAL_COLORS[0],
  },
  Materials: {
    icon: Package, tone: METRIC_TONES.amber, sparkColor: STATUS_COLORS.warning,
  },
  Utilities: {
    icon: Zap, tone: METRIC_TONES.purple, sparkColor: CATEGORICAL_COLORS[4],
  },
  Maintenance: {
    icon: Wrench, tone: METRIC_TONES.cyan, sparkColor: CATEGORICAL_COLORS[5],
  },
  Transport: {
    icon: Bus, tone: METRIC_TONES.green, sparkColor: STATUS_COLORS.good,
  },
  Other: {
    icon: Receipt, tone: METRIC_TONES.neutral, sparkColor: CATEGORICAL_COLORS[2],
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
              sparklineColor={meta.sparkColor}
            />
          </Reveal>
        );
      })}
    </div>
  );
}
