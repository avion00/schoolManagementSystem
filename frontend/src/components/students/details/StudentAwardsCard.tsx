import { Trophy } from "lucide-react";

import { PremiumEmptyState } from "@/components/ui/PremiumEmptyState";
import { DetailCard } from "@/components/ui/DetailCard";
import type { Award } from "@/api/types/students";
import { cn } from "@/lib/utils";

const CAT_COLOR: Record<Award["category"], string> = {
  Academic:   "bg-blue-500/10 text-blue-700 dark:text-blue-400",
  Sports:     "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
  Leadership: "bg-violet-500/10 text-violet-700 dark:text-violet-400",
  Attendance: "bg-sky-500/10 text-sky-700 dark:text-sky-400",
  Cultural:   "bg-amber-500/10 text-amber-700 dark:text-amber-400",
};

function fmt(d: string) {
  return new Date(d).toLocaleDateString("en-US", { day: "2-digit", month: "short", year: "numeric" });
}

export function StudentAwardsCard({ awards }: { awards: Award[] }) {
  if (awards.length === 0) {
    return (
      <DetailCard icon={Trophy} title="Awards & Prizes">
        <PremiumEmptyState title="No awards recorded yet." className="py-6" />
      </DetailCard>
    );
  }
  return (
    <DetailCard
      icon={Trophy}
      title="Awards & Prizes"
      action={
        <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-bold text-primary">
          {awards.length}
        </span>
      }
    >
      <div className="space-y-3">
        {awards.map((a, i) => (
          <div
            key={a.id}
            className="relative flex gap-4 rounded-xl border border-neutral-200/80 bg-muted/20 p-4 dark:border-neutral-800"
          >
            {/* Medal circle */}
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-400/20">
              <span className="text-lg">
                {i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : "🏅"}
              </span>
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-start justify-between gap-1">
                <p className="text-sm font-semibold text-foreground">{a.title}</p>
                <span className={cn("shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold", CAT_COLOR[a.category])}>
                  {a.category}
                </span>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">{a.description}</p>
              <p className="mt-1.5 text-[11px] font-medium text-muted-foreground/70">{fmt(a.date)}</p>
            </div>
          </div>
        ))}
      </div>
    </DetailCard>
  );
}
