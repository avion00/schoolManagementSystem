import { useEffect } from "react";

import { useAcademicOptions } from "@/api/students";
import { PremiumSelect } from "@/components/ui/PremiumSelect";

/** Class → section selects from the school's real structure. Picks the first
 *  available class/section when nothing is chosen yet. */
export function SectionPicker({ classId, sectionId, onChange }: {
  classId: string; sectionId: string; onChange: (v: { classId: string; sectionId: string; label: string }) => void;
}) {
  const options = useAcademicOptions();
  const classes = (options.data?.classes ?? []).filter((c) => options.data?.sections.some((s) => s.classId === c.id));
  const sections = (options.data?.sections ?? []).filter((s) => s.classId === classId);

  useEffect(() => {
    if (!classId && classes[0]) {
      const first = options.data!.sections.find((s) => s.classId === classes[0].id)!;
      onChange({ classId: classes[0].id, sectionId: first.id, label: `${classes[0].name} ${first.name}` });
    }
  }, [classId, classes, options.data, onChange]);

  return (
    <>
      <PremiumSelect value={classId} placeholder="Class" className="w-[150px]"
        options={classes.map((c) => ({ value: c.id, label: c.name }))}
        onChange={(v) => {
          const first = options.data?.sections.find((s) => s.classId === v);
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
