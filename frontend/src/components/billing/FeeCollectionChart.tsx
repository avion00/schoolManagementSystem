import { useMemo } from "react";

import { FeeCollectionChart as GenericFeeCollectionChart } from "@/components/charts/FeeCollectionChart";
import { CLASS_OPTIONS, STUDENT_FEES } from "@/data/billingData";

/** Billing-specific data wiring around the reusable charts/FeeCollectionChart. */
export function FeeCollectionChart() {
  const data = useMemo(
    () => CLASS_OPTIONS.map((cls) => ({
      label: cls.replace("Grade ", "G"),
      collected: STUDENT_FEES.filter((f) => f.className === cls).reduce((s, f) => s + f.paid, 0),
    })),
    [],
  );
  return <GenericFeeCollectionChart data={data} subtitle="Amount collected so far, per class" />;
}
