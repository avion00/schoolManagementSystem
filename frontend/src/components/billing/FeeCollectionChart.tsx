import { useMemo } from "react";

import { FeeCollectionChart as GenericFeeCollectionChart } from "@/components/charts/FeeCollectionChart";
import { useMoney } from "@/api/billing";
import type { StudentFee } from "@/api/types/billing";

/** Amount collected so far per class, from the student fee roster. */
export function FeeCollectionChart({ fees }: { fees: StudentFee[] }) {
  const money = useMoney();
  const data = useMemo(() => {
    const byClass = new Map<string, number>();
    for (const f of fees) byClass.set(f.className, (byClass.get(f.className) ?? 0) + f.paid);
    return [...byClass].map(([label, collected]) => ({ label, collected }));
  }, [fees]);
  return <GenericFeeCollectionChart data={data} subtitle="Amount collected so far, per class" valueFormatter={money.short} />;
}
