import { useState } from "react";
import { Megaphone, Pin } from "lucide-react";

import { Reveal } from "@/components/motion";
import { PremiumBadge, type PremiumBadgeTone } from "@/components/ui/PremiumBadge";
import { PremiumCard } from "@/components/ui/PremiumCard";
import { PremiumEmptyState } from "@/components/ui/PremiumEmptyState";
import { PremiumTabs } from "@/components/ui/PremiumTabs";
import { teacherNotices, type TeacherNotice } from "@/data/teacherDashboardData";

const CATEGORY_TONE: Record<TeacherNotice["category"], PremiumBadgeTone> = {
  School: "info",
  Exam: "warning",
  Staff: "purple",
  Class: "success",
};

type Filter = "all" | TeacherNotice["category"];
const TABS: { value: Filter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "School", label: "School" },
  { value: "Exam", label: "Exam" },
  { value: "Staff", label: "Staff" },
  { value: "Class", label: "Class" },
];

/**
 * View-only notice feed for teachers (school, exam, staff, and class
 * notices). Creating notices is an admin/principal action in this build —
 * no create button is shown here since that permission isn't modeled yet.
 */
export function TeacherNotices() {
  const [filter, setFilter] = useState<Filter>("all");
  const filtered = filter === "all" ? teacherNotices : teacherNotices.filter((n) => n.category === filter);

  return (
    <div className="space-y-4">
      <Reveal>
        <div>
          <h1 className="text-lg font-semibold tracking-tight text-foreground">Notices</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">School announcements, exam notices, staff circulars, and class notices.</p>
        </div>
      </Reveal>

      <Reveal delay={60}>
        <PremiumTabs value={filter} onValueChange={(v) => setFilter(v as Filter)} options={TABS} />
      </Reveal>

      {filtered.length === 0 ? (
        <PremiumCard><PremiumEmptyState icon={Megaphone} title="No notices in this category" /></PremiumCard>
      ) : (
        <Reveal delay={100} className="space-y-3">
          {filtered.map((n, i) => (
            <PremiumCard key={n.id} className="t-row-in p-4" style={{ "--row-index": i } as React.CSSProperties}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-2">
                  {n.pinned && <Pin className="mt-1 h-3.5 w-3.5 shrink-0 text-primary" />}
                  <div>
                    <p className="text-[13.5px] font-semibold text-foreground">{n.title}</p>
                    <p className="mt-1 text-[12.5px] text-muted-foreground">{n.body}</p>
                    <p className="mt-1.5 text-[11px] text-muted-foreground/70">{n.date}</p>
                  </div>
                </div>
                <PremiumBadge label={n.category} tone={CATEGORY_TONE[n.category]} />
              </div>
            </PremiumCard>
          ))}
        </Reveal>
      )}
    </div>
  );
}
