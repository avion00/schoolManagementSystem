import { useNavigate } from "react-router-dom";

import { BillingStatusBadge } from "@/components/billing/BillingStatusBadge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { STUDENT_FEES } from "@/data/billingData";

export function PendingDuesTable() {
  const navigate = useNavigate();
  const dues = [...STUDENT_FEES]
    .filter((f) => f.due > 0)
    .sort((a, b) => b.due - a.due)
    .slice(0, 6);

  return (
    <Card className="h-full rounded-2xl border-border/60 shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-[13px] font-semibold">Pending Dues</CardTitle>
      </CardHeader>
      <CardContent className="space-y-1 pt-0">
        {dues.map((f) => (
          <button
            key={f.id}
            type="button"
            onClick={() => navigate("/billing/fees")}
            className="flex w-full items-center justify-between gap-3 rounded-lg px-2 py-2 text-left transition-colors hover:bg-muted/50"
          >
            <div className="min-w-0">
              <p className="truncate text-[12.5px] font-medium text-foreground">{f.studentName}</p>
              <p className="text-[11px] text-muted-foreground">{f.className} – {f.section} · Due {f.nextDueDate ?? "—"}</p>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <span className="text-[12.5px] font-semibold tabular-nums text-rose-600 dark:text-rose-400">
                ${f.due.toLocaleString()}
              </span>
              <BillingStatusBadge status={f.status} />
            </div>
          </button>
        ))}
      </CardContent>
    </Card>
  );
}
