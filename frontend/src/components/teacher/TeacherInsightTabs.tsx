import { Sparkles } from "lucide-react";

import { StudentRiskCard, type StudentInsightEntry } from "@/components/teacher/StudentRiskCard";
import { PremiumCard } from "@/components/ui/PremiumCard";
import { PremiumEmptyState } from "@/components/ui/PremiumEmptyState";
import { PremiumTabs } from "@/components/ui/PremiumTabs";

export interface InsightTabOption {
  value: string;
  label: string;
}

/** Tab bar + student-card grid shared by every Student Insights view. */
export function TeacherInsightTabs({
  tabs,
  active,
  onChange,
  entries,
  emptyLabel,
}: {
  tabs: InsightTabOption[];
  active: string;
  onChange: (value: string) => void;
  entries: StudentInsightEntry[];
  emptyLabel: string;
}) {
  return (
    <div className="space-y-4">
      <PremiumTabs value={active} onValueChange={onChange} options={tabs} />
      {entries.length === 0 ? (
        <PremiumCard><PremiumEmptyState icon={Sparkles} title={emptyLabel} /></PremiumCard>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {entries.map((entry, i) => <StudentRiskCard key={entry.studentId} entry={entry} index={i} />)}
        </div>
      )}
    </div>
  );
}
