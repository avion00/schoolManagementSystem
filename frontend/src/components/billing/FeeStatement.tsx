import { Printer } from "lucide-react";

import { Button } from "@/components/ui/button";
import { PremiumSkeleton } from "@/components/ui/PremiumSkeleton";
import { useLedger, useMoney } from "@/api/billing";
import { useSchools } from "@/api/classes";
import { errorMessage } from "@/api/http";

/** Printable fee statement: every invoice, discount, payment and reversal with a running balance. */
export function FeeStatement({ studentId }: { studentId: string }) {
  const ledger = useLedger(studentId);
  const school = useSchools().data;
  const money = useMoney();

  if (ledger.isLoading) return <PremiumSkeleton className="h-64 w-full rounded-xl" />;
  if (ledger.isError) return <p className="text-[12px] text-rose-600">{errorMessage(ledger.error)}</p>;
  const data = ledger.data!;

  return (
    <div className="space-y-3">
      <div className="flex justify-end print:hidden">
        <Button size="sm" variant="outline" className="h-8 gap-1.5 text-[12px]" onClick={() => window.print()}>
          <Printer className="h-3.5 w-3.5" /> Print
        </Button>
      </div>
      <div className="rounded-xl border border-border/60 p-5 text-[12px]">
        <div className="mb-4 flex items-start justify-between">
          <div>
            <p className="text-[15px] font-bold text-foreground">{school?.name ?? ""}</p>
            <p className="text-muted-foreground">Fee statement · {data.name}</p>
          </div>
          <p className="text-muted-foreground">{new Date().toLocaleDateString()}</p>
        </div>
        {data.entries.length === 0 ? (
          <p className="py-6 text-center text-muted-foreground">No fee activity for this student yet.</p>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-border/60 text-left text-[11px] uppercase tracking-wide text-muted-foreground">
                <th className="py-1.5">Date</th><th>Reference</th><th>Description</th>
                <th className="text-right">Charge</th><th className="text-right">Credit</th><th className="text-right">Balance</th>
              </tr>
            </thead>
            <tbody>
              {data.entries.map((e, i) => (
                <tr key={i} className="border-b border-border/30">
                  <td className="py-1.5 whitespace-nowrap">{e.date}</td>
                  <td className="font-mono text-[11px]">{e.reference}</td>
                  <td className="text-muted-foreground">{e.description}</td>
                  <td className="text-right tabular-nums">{e.debit ? money(e.debit) : ""}</td>
                  <td className="text-right tabular-nums text-emerald-600">{e.credit ? money(e.credit) : ""}</td>
                  <td className="text-right font-medium tabular-nums">{money(e.balance)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        <p className="mt-3 text-right text-[13px] font-semibold">Balance due: {money(data.balance)}</p>
      </div>
    </div>
  );
}
