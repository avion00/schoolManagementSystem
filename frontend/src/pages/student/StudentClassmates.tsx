import { useState } from "react";

import { Reveal } from "@/components/motion";
import { StudentAvatar } from "@/components/students/StudentAvatar";
import { PremiumCard } from "@/components/ui/PremiumCard";
import { PremiumSearchInput } from "@/components/ui/PremiumSearchInput";
import { classmates, studentProfile } from "@/data/studentDashboardData";

export function StudentClassmates() {
  const [search, setSearch] = useState("");
  const filtered = classmates.filter((c) => !search.trim() || c.name.toLowerCase().includes(search.trim().toLowerCase()));

  return (
    <div className="space-y-4">
      <Reveal>
        <h1 className="text-lg font-semibold tracking-tight text-foreground">Classmates</h1>
        <p className="mt-0.5 text-[13px] text-muted-foreground">{studentProfile.className} {studentProfile.section} · {classmates.length} students</p>
      </Reveal>

      <Reveal delay={40}>
        <PremiumSearchInput value={search} onChange={setSearch} placeholder="Search classmates…" className="max-w-sm" />
      </Reveal>

      <Reveal delay={80} className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {filtered.map((c) => (
          <PremiumCard key={c.id} className="flex items-center gap-3 p-3.5">
            <StudentAvatar name={c.name} size="md" />
            <div className="min-w-0">
              <p className="truncate text-[13px] font-medium text-foreground">{c.name}{c.name === studentProfile.name && " (You)"}</p>
              <p className="truncate text-[11.5px] text-muted-foreground">Roll {c.roll} · {c.house}</p>
            </div>
          </PremiumCard>
        ))}
        {filtered.length === 0 && <p className="col-span-full py-8 text-center text-[12.5px] text-muted-foreground">No classmates found.</p>}
      </Reveal>
    </div>
  );
}
