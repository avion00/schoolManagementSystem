import { Button } from "@/components/ui/button";
import { PremiumBadge, type PremiumBadgeTone } from "@/components/ui/PremiumBadge";
import { PremiumCard } from "@/components/ui/PremiumCard";
import type { LessonPlan, LessonPlanStatus, PrincipalReviewStatus } from "@/data/teacherDashboardData";

const STATUS_TONE: Record<LessonPlanStatus, PremiumBadgeTone> = {
  Draft: "neutral",
  Submitted: "info",
  Reviewed: "success",
};
const REVIEW_TONE: Record<PrincipalReviewStatus, PremiumBadgeTone> = {
  Pending: "warning",
  Approved: "success",
  "Changes requested": "danger",
};

/** Groups lesson plans by week into a simple calendar-style grid. */
export function LessonPlanCalendar({
  plans,
  onMarkCompleted,
  onDuplicate,
  onSubmitForReview,
}: {
  plans: LessonPlan[];
  onMarkCompleted?: (id: string) => void;
  onDuplicate?: (plan: LessonPlan) => void;
  onSubmitForReview?: (id: string) => void;
}) {
  const weeks = Array.from(new Set(plans.map((p) => p.week)));

  return (
    <div className="space-y-4">
      {weeks.map((week) => (
        <div key={week}>
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">{week}</p>
          <div className="grid gap-3 lg:grid-cols-2">
            {plans.filter((p) => p.week === week).map((plan, i) => (
              <PremiumCard key={plan.id} className="t-row-in p-5" style={{ "--row-index": i } as React.CSSProperties}>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-[13.5px] font-semibold text-foreground">{plan.topic}</p>
                    <p className="text-[11.5px] text-muted-foreground">{plan.className}-{plan.section} · {plan.subject}</p>
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-1">
                    <PremiumBadge label={plan.status} tone={STATUS_TONE[plan.status]} />
                    <PremiumBadge label={`Principal: ${plan.principalReview}`} tone={REVIEW_TONE[plan.principalReview]} />
                  </div>
                </div>

                {plan.objectives.length > 0 && (
                  <ul className="mt-3 list-inside list-disc space-y-0.5 text-[12.5px] text-muted-foreground">
                    {plan.objectives.map((o) => <li key={o}>{o}</li>)}
                  </ul>
                )}
                {plan.materials.length > 0 && (
                  <p className="mt-2 text-[11.5px] text-muted-foreground">Materials: {plan.materials.join(", ")}</p>
                )}
                {plan.homework && <p className="mt-1 text-[11.5px] text-muted-foreground">Homework: {plan.homework}</p>}

                <div className="mt-3 flex flex-wrap gap-2 border-t border-border/60 pt-3">
                  {plan.status !== "Reviewed" && onMarkCompleted && (
                    <Button variant="outline" size="sm" className="h-7 text-[11px]" onClick={() => onMarkCompleted(plan.id)}>Mark completed</Button>
                  )}
                  {onDuplicate && (
                    <Button variant="outline" size="sm" className="h-7 text-[11px]" onClick={() => onDuplicate(plan)}>Duplicate</Button>
                  )}
                  {plan.status === "Draft" && onSubmitForReview && (
                    <Button size="sm" className="h-7 text-[11px]" onClick={() => onSubmitForReview(plan.id)}>Submit for review</Button>
                  )}
                </div>
              </PremiumCard>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
