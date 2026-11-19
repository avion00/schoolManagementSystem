import { useEffect } from "react";

import { useAcademicOptions } from "@/api/students";
import { PremiumSelect } from "@/components/ui/PremiumSelect";
import { useMyClasses } from "@/api/portal";
import { useAuth } from "@/lib/auth";

/** Class → section selects from the school's real structure. Picks the first
 *  available class/section when nothing is chosen yet. */
export function SectionPicker({ classId, sectionId, onChange }: {
  classId: string; sectionId: string; onChange: (v: { classId: string; sectionId: string; label: string }) => void;
}) {
  const options = useAcademicOptions();
  // Teachers only see the sections they teach; staff with full attendance rights see all.
  const { hasPermission } = useAuth();
  const seeAll = hasPermission("attendance.manage.all") || hasPermission("student.view.all");
  const mine = useMyClasses(!seeAll);
  const allowed = seeAll ? null : new Set((mine.data ?? []).map((c) => c.section).filter(Boolean));
  const allSections = (options.data?.sections ?? []).filter((s) => !allowed || allowed.has(s.id));
  const classes = (options.data?.classes ?? []).filter((c) => allSections.some((s) => s.classId === c.id));
  const sections = allSections.filter((s) => s.classId === classId);

  useEffect(() => {
    if (!classId && classes[0]) {
      const first = allSections.find((s) => s.classId === classes[0].id)!;
      onChange({ classId: classes[0].id, sectionId: first.id, label: `${classes[0].name} ${first.name}` });
    }
  }, [classId, classes, options.data, onChange]);

  return (
    <>
      <PremiumSelect value={classId} placeholder="Class" className="w-[150px]"
        options={classes.map((c) => ({ value: c.id, label: c.name }))}
        onChange={(v) => {
          const first = allSections.find((s) => s.classId === v);
          const cls = classes.find((c) => c.id === v);
          onChange({ classId: v, sectionId: first?.id ?? "", label: `${cls?.name ?? ""} ${first?.name ?? ""}` });
        }} />
      <PremiumSelect value={sectionId} placeholder="Section" className="w-[150px]"
        options={sections.map((s) => ({ value: s.id, label: `Section ${s.name}` }))}
        onChange={(v) => {
          const sec = sections.find((s) => s.id === v);
          onChange({ classId, sectionId: v, label: `${sec?.className ?? ""} ${sec?.name ?? ""}` });
        }} />
    </>
  );
}
