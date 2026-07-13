import { Lightbulb } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { PremiumCard } from "@/components/ui/PremiumCard";
import { smartSuggestions } from "@/data/teacherDashboardData";

/** Proactive, one-click recommendations — distinct from urgent alerts: these are "worth doing," not "overdue." */
export function TeacherSmartSuggestions() {
  const navigate = useNavigate();

  return (
    <PremiumCard className="p-5">
      <div className="mb-3 flex items-center gap-2">
        <Lightbulb className="h-4 w-4 text-muted-foreground" />
        <h2 className="text-[13.5px] font-semibold text-foreground">Smart Suggestions</h2>
      </div>
      <div className="space-y-2">
        {smartSuggestions.map((s) => (
          <div key={s.id} className="flex items-center gap-3 rounded-xl bg-muted/40 p-2.5">
            <p className="min-w-0 flex-1 text-[12.5px] text-foreground">{s.message}</p>
            <button
              type="button"
              onClick={() => navigate(s.actionRoute)}
              className="shrink-0 rounded-lg bg-primary px-2.5 py-1 text-[11.5px] font-medium text-primary-foreground hover:bg-primary/90"
            >
              {s.actionLabel}
            </button>
          </div>
        ))}
      </div>
    </PremiumCard>
  );
}
