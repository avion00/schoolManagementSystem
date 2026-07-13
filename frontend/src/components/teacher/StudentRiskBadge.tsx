import { PremiumBadge, type PremiumBadgeTone } from "@/components/ui/PremiumBadge";
import type { RiskLevel } from "@/data/teacherDashboardData";

const RISK_TONE: Record<RiskLevel, PremiumBadgeTone> = {
  "Low Risk": "success",
  "Medium Risk": "warning",
  "High Risk": "danger",
};

export function StudentRiskBadge({ level, className }: { level: RiskLevel; className?: string }) {
  return <PremiumBadge label={level} tone={RISK_TONE[level]} className={className} />;
}
