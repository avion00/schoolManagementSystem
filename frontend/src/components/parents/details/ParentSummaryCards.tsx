import { ClipboardList, GraduationCap, Receipt, Wallet } from "lucide-react";
import type { SummaryCards } from "@/data/parentDetailsData";

function SummaryCard({
  icon: Icon, label, value, color,
}: {
  icon: typeof Wallet; label: string; value: string | number; color: string;
}) {
  return (
    <div className={`flex items-center gap-4 rounded-2xl border border-border/60 bg-card p-5 shadow-sm ${color}`}>
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-current/10">
        <Icon className="h-6 w-6" />
      </div>
      <div>
        <p className="text-2xl font-bold leading-none">{value}</p>
        <p className="mt-1 text-[12px] font-medium opacity-70">{label}</p>
      </div>
    </div>
  );
}

export function ParentSummaryCards({ cards }: { cards: SummaryCards }) {
  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      <SummaryCard
        icon={Wallet}
        label="Due Fees"
        value={`NPR ${cards.dueFees.toLocaleString("en-IN")}`}
        color="text-rose-600 dark:text-rose-400"
      />
      <SummaryCard
        icon={ClipboardList}
        label="Upcoming Exams"
        value={cards.upcomingExams}
        color="text-blue-600 dark:text-blue-400"
      />
      <SummaryCard
        icon={GraduationCap}
        label="Result Published"
        value={cards.resultPublished}
        color="text-emerald-600 dark:text-emerald-400"
      />
      <SummaryCard
        icon={Receipt}
        label="Total Expenses"
        value={`NPR ${cards.totalExpenses.toLocaleString("en-IN")}`}
        color="text-violet-600 dark:text-violet-400"
      />
    </div>
  );
}
