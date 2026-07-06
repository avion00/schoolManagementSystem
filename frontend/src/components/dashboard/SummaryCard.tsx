import { PopNumber } from "@/components/motion";
import type { SummaryCardItem } from "@/data/dashboardData";
import { cn } from "@/lib/utils";

export function SummaryCard({ item }: { item: SummaryCardItem }) {
  const Icon = item.icon;
  return (
    <div
      className={cn(
        "relative flex flex-col justify-between overflow-hidden rounded-xl p-4 text-white",
        "bg-gradient-to-br",
        item.from,
        item.to,
      )}
    >
      {/* decorative depth circles */}
      <span className="pointer-events-none absolute -right-4 -top-4 h-24 w-24 rounded-full bg-white/10" />
      <span className="pointer-events-none absolute -bottom-6 -right-1 h-20 w-20 rounded-full bg-white/10" />

      <div className="relative flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-sm font-medium text-white/80">{item.label}</p>
          <p className="mt-1 text-2xl font-bold tabular-nums">
            <PopNumber value={item.value} />
          </p>
          <p className="mt-0.5 text-xs text-white/70">{item.sub}</p>
        </div>
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/20">
          <Icon className="h-5 w-5" />
        </span>
      </div>
    </div>
  );
}
