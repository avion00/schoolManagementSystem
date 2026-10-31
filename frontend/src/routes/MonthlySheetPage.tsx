import { useCallback, useState } from "react";

import { useMonthlySheet, useWeekendDays } from "@/api/attendance";
import { errorMessage } from "@/api/http";
import { MONTH_OPTIONS } from "@/api/types/attendance";
import { Reveal } from "@/components/motion";
import { MonthlyAttendanceGrid } from "@/components/attendance/MonthlyAttendanceGrid";
import { SectionPicker } from "@/components/attendance/SectionPicker";
import { PremiumCard } from "@/components/ui/PremiumCard";
import { PremiumEmptyState } from "@/components/ui/PremiumEmptyState";
import { PremiumSelect } from "@/components/ui/PremiumSelect";
import { PremiumSkeleton } from "@/components/ui/PremiumSkeleton";

export function MonthlySheetPage() {
  const now = new Date();
  const [pick, setPick] = useState({ classId: "", sectionId: "", label: "" });
  const onPick = useCallback((v: typeof pick) => setPick(v), []);
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const sheet = useMonthlySheet(pick.sectionId || undefined, year, month);
  const weekend = useWeekendDays();
  const [className, sectionName] = [pick.label.split(" ").slice(0, -1).join(" "), pick.label.split(" ").slice(-1)[0]];

  return (
    <div className="space-y-5">
      <Reveal>
        <h1 className="text-2xl font-bold text-foreground">Monthly Attendance Sheet</h1>
        <p className="text-[13px] text-muted-foreground mt-0.5">View and print the full monthly attendance grid for any class</p>
      </Reveal>

      <Reveal delay={40}>
      <PremiumCard className="p-5">
        <div className="flex flex-wrap gap-3 items-end">
          <SectionPicker classId={pick.classId} sectionId={pick.sectionId} onChange={onPick} />
          <PremiumSelect value={String(month)} className="w-[150px]" onChange={(v) => setMonth(Number(v))}
            options={MONTH_OPTIONS.map((mn, i) => ({ value: String(i + 1), label: mn }))} />
          <PremiumSelect value={String(year)} className="w-[110px]" onChange={(v) => setYear(Number(v))}
            options={[now.getFullYear(), now.getFullYear() - 1].map((yy) => ({ value: String(yy), label: String(yy) }))} />
        </div>
      </PremiumCard>
      </Reveal>

      <Reveal delay={80}>
      <PremiumCard className="p-5">
        {sheet.isLoading || !pick.sectionId ? <PremiumSkeleton className="h-72 w-full" /> :
         sheet.isError ? <PremiumEmptyState title="Couldn't load the sheet" description={errorMessage(sheet.error)} /> : (
          <MonthlyAttendanceGrid
            students={sheet.data!.students}
            attendance={sheet.data!.attendance}
            holidays={sheet.data!.holidays}
            weekendDays={weekend.data ?? ["saturday"]}
            year={year}
            month={month}
            className={className}
            section={sectionName}
          />
        )}
      </PremiumCard>
      </Reveal>
    </div>
  );
}
