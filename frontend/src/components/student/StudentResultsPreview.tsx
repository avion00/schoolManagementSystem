import { useNavigate } from "react-router-dom";

import { PremiumBadge } from "@/components/ui/PremiumBadge";
import { PremiumCard } from "@/components/ui/PremiumCard";
import { results } from "@/data/studentDashboardData";

export function StudentResultsPreview() {
  const navigate = useNavigate();
  const latest = results[0];

  return (
    <PremiumCard className="p-4">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <p className="text-[13px] font-semibold text-foreground">Latest Result · {latest.term}</p>
          <p className="text-[11.5px] text-muted-foreground">{latest.percentage}% overall · GPA {latest.gpa}</p>
        </div>
        <button type="button" onClick={() => navigate("/student/results")} className="text-[11.5px] font-medium text-primary hover:underline">
          View all results
        </button>
      </div>
      <div className="space-y-1.5">
        {latest.subjects.slice(0, 4).map((s) => (
          <div key={s.subject} className="flex items-center justify-between text-[12.5px]">
            <span className="text-foreground">{s.subject}</span>
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">{s.total}/{s.fullMarks}</span>
              <PremiumBadge label={s.grade} tone={s.result === "Pass" ? "success" : "danger"} />
            </div>
          </div>
        ))}
      </div>
    </PremiumCard>
  );
}
