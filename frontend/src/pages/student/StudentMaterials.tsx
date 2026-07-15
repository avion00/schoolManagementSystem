import { FolderOpen } from "lucide-react";
import { useMemo, useState } from "react";

import { Reveal, SlidingTabs } from "@/components/motion";
import { StudentMaterialCard } from "@/components/student/StudentMaterialCard";
import { PremiumEmptyState } from "@/components/ui/PremiumEmptyState";
import { PremiumSelect } from "@/components/ui/PremiumSelect";
import { learningMaterials, subjects, type MaterialType } from "@/data/studentDashboardData";

const TABS = [{ value: "all", label: "All" }, { value: "recent", label: "Recently Uploaded" }, { value: "saved", label: "Saved" }];
const TYPES: MaterialType[] = ["PDF", "Video", "Image", "Doc", "Link"];

export function StudentMaterials() {
  const [tab, setTab] = useState("all");
  const [subject, setSubject] = useState("");
  const [type, setType] = useState("");
  const [, forceRender] = useState(0);

  const rows = useMemo(() => {
    let list = [...learningMaterials];
    if (tab === "recent") list = list.sort((a, b) => b.date.localeCompare(a.date)).slice(0, 6);
    if (tab === "saved") list = list.filter((m) => m.saved);
    if (subject) list = list.filter((m) => m.subject === subject);
    if (type) list = list.filter((m) => m.type === type);
    return list;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab, subject, type, learningMaterials.length]);

  return (
    <div className="space-y-4">
      <Reveal>
        <h1 className="text-lg font-semibold tracking-tight text-foreground">Learning Materials</h1>
        <p className="mt-0.5 text-[13px] text-muted-foreground">{learningMaterials.length} materials shared by your teachers</p>
      </Reveal>

      <Reveal delay={40} className="flex flex-wrap items-center gap-2">
        <div className="-mx-1 overflow-x-auto px-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <SlidingTabs value={tab} onValueChange={setTab} options={TABS} className="w-max" />
        </div>
        <div className="ml-auto flex gap-2">
          <div className="w-40"><PremiumSelect value={subject} onChange={setSubject} placeholder="All subjects" options={subjects.map((s) => ({ value: s.name, label: s.name }))} /></div>
          <div className="w-32"><PremiumSelect value={type} onChange={setType} placeholder="All types" options={TYPES.map((t) => ({ value: t, label: t }))} /></div>
        </div>
      </Reveal>

      <Reveal delay={80} className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {rows.map((m) => <StudentMaterialCard key={m.id} material={m} onChange={() => forceRender((n) => n + 1)} />)}
      </Reveal>
      {rows.length === 0 && <PremiumEmptyState icon={FolderOpen} title="No materials found" description="Try a different subject, type, or tab." />}
    </div>
  );
}
