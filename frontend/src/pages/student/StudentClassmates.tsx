import {
  ArrowRight, Cake, Gift, Grid3x3, Home, List, Mail, Megaphone, Users, UsersRound,
} from "lucide-react";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

import { ClassmateCard, type ClassmateCardData } from "@/components/student/ui/ClassmateCard";
import { FilterPillGroup } from "@/components/student/ui/FilterPillGroup";
import { MiniDonutChart } from "@/components/student/ui/MiniDonutChart";
import { StudentIconStatCard } from "@/components/student/ui/StudentIconStatCard";
import { StudentPageHeader } from "@/components/student/ui/StudentPageHeader";
import { StudentPageShell } from "@/components/student/ui/StudentPageShell";
import { StudentStatusPill } from "@/components/student/ui/StudentStatusPill";
import { StudentTwoColumnLayout } from "@/components/student/ui/StudentTwoColumnLayout";
import { StudentWidgetCard } from "@/components/student/ui/StudentWidgetCard";
import { PremiumSearchInput } from "@/components/ui/PremiumSearchInput";
import { PremiumSelect } from "@/components/ui/PremiumSelect";
import { classGroups, classmates, studentProfile, teachers } from "@/data/studentDashboardData";
import { cn } from "@/lib/utils";

// Illustrative per-classmate detail not in the core data model (subjects/club/top-performer
// flag) — keyed to the real `classmates` records by id, matching the same local-supplement
// pattern used on the Profile/Attendance pages for content with no backing data source.
const CLASSMATE_EXTRA: Record<number, { subjects: string; club: string; topPerformer?: boolean }> = {
  1: { subjects: "Math, Science", club: "Robotics Club" },
  2: { subjects: "Science, English", club: "Debate Club", topPerformer: true },
  3: { subjects: "Math, Computer", club: "Football Club" },
  4: { subjects: "English, History", club: "Art Club", topPerformer: true },
  5: { subjects: "Math, Physics", club: "Chess Club" },
  6: { subjects: "Science, Biology", club: "Eco Club" },
  7: { subjects: "Math, Economics", club: "Cricket Club", topPerformer: true },
  8: { subjects: "English, Literature", club: "Drama Club" },
  9: { subjects: "Math, Chemistry", club: "Music Club" },
  10: { subjects: "Biology, English", club: "Dance Club" },
  11: { subjects: "Physics, Math", club: "Robotics Club", topPerformer: true },
  12: { subjects: "History, Geography", club: "Art Club" },
};

const HOUSE_DOT: Record<string, string> = {
  "Blue House": "#3b82f6", "Red House": "#f43f5e", "Green House": "#10b981", "Yellow House": "#f59e0b",
};

const FILTERS = [
  { value: "all", label: "All" },
  { value: "house", label: "My House" },
  { value: "groups", label: "Study Groups" },
  { value: "top", label: "Top Performers" },
] as const;
type FilterValue = (typeof FILTERS)[number]["value"];

const SORT_OPTIONS = [
  { value: "name-asc", label: "Name A–Z" },
  { value: "name-desc", label: "Name Z–A" },
  { value: "roll", label: "Roll Number" },
  { value: "house", label: "House" },
];

function initials(name: string) {
  const parts = name.trim().split(/\s+/);
  const first = parts[0]?.[0] ?? "";
  const last = parts.length > 1 ? parts[parts.length - 1][0] : "";
  return (first + last).toUpperCase();
}

export function StudentClassmates() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<FilterValue>("all");
  const [sort, setSort] = useState("name-asc");
  const [view, setView] = useState<"grid" | "list">("grid");

  const myClub = CLASSMATE_EXTRA[classmates.find((c) => c.name === studentProfile.name)?.id ?? 1]?.club;

  const enriched: ClassmateCardData[] = classmates.map((c) => ({
    id: c.id, name: c.name, roll: c.roll, house: c.house, initials: initials(c.name),
    subjects: CLASSMATE_EXTRA[c.id]?.subjects ?? "—", club: CLASSMATE_EXTRA[c.id]?.club ?? "—",
    isCurrentUser: c.name === studentProfile.name,
  }));

  const filtered = useMemo(() => {
    let list = enriched.filter((c) => !search.trim() || c.name.toLowerCase().includes(search.trim().toLowerCase()));
    if (filter === "house") list = list.filter((c) => c.house === studentProfile.house);
    if (filter === "groups") list = list.filter((c) => c.club === myClub);
    if (filter === "top") list = list.filter((c) => CLASSMATE_EXTRA[c.id]?.topPerformer);

    return list.slice().sort((a, b) => {
      if (sort === "name-desc") return b.name.localeCompare(a.name);
      if (sort === "roll") return a.roll.localeCompare(b.roll);
      if (sort === "house") return a.house.localeCompare(b.house);
      return a.name.localeCompare(b.name);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, filter, sort, myClub]);

  const classTeacher = teachers.find((t) => t.isClassTeacher);
  const houseCounts = ["Blue House", "Red House", "Green House", "Yellow House"].map((house) => ({
    house, count: classmates.filter((c) => c.house === house).length,
  }));
  const studyGroups = classGroups.filter((g) => g.id !== "cg-1"); // exclude the whole-class group

  function viewProfile(name: string) {
    toast.info(`${name}'s full profile isn't shared publicly — you can message them instead.`);
  }

  return (
    <StudentPageShell>
      <StudentPageHeader title="My Classmates" description={`${studentProfile.className} ${studentProfile.section} · ${classmates.length} students`} />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StudentIconStatCard icon={Users} tone="purple" value={classmates.length} label="Total Classmates" subtitle={`In ${studentProfile.className} ${studentProfile.section}`} />
        <StudentIconStatCard icon={Home} tone="blue" value={4} label="House Groups" subtitle="Blue • Red • Green • Yellow" />
        <StudentIconStatCard icon={UsersRound} tone="green" value={studyGroups.length} label="Study Buddies" subtitle="Active Groups" />
        <StudentIconStatCard icon={Gift} tone="orange" value={2} label="Birthdays This Month" subtitle="Celebrate together! 🎉" />
      </div>

      <StudentTwoColumnLayout
        main={
          <div className="rounded-2xl border border-border/60 bg-card p-4 shadow-elevated sm:p-5">
            <div className="flex flex-col gap-3">
              <div className="flex flex-wrap items-center gap-3">
                <PremiumSearchInput value={search} onChange={setSearch} placeholder="Search classmates by name…" hint="⌘ K" className="max-w-xs flex-1" />
                <FilterPillGroup value={filter} onChange={setFilter} options={FILTERS} />
                <div className="ml-auto flex items-center gap-2">
                  <span className="text-[12px] text-muted-foreground">Sort by</span>
                  <div className="w-36"><PremiumSelect value={sort} onChange={setSort} options={SORT_OPTIONS} /></div>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setView("grid")}
                  className={cn("flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-[12px] font-medium transition-all", view === "grid" ? "bg-primary text-primary-foreground shadow-sm" : "bg-muted/60 text-muted-foreground hover:text-foreground")}
                >
                  <Grid3x3 className="h-3.5 w-3.5" /> Grid
                </button>
                <button
                  type="button"
                  onClick={() => setView("list")}
                  className={cn("flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-[12px] font-medium transition-all", view === "list" ? "bg-primary text-primary-foreground shadow-sm" : "bg-muted/60 text-muted-foreground hover:text-foreground")}
                >
                  <List className="h-3.5 w-3.5" /> List
                </button>
              </div>
            </div>

            <div className={cn("mt-4", view === "grid" ? "grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4" : "space-y-2.5")}>
              {filtered.map((c, i) => (
                <ClassmateCard
                  key={c.id}
                  data={c}
                  delay={i * 30}
                  variant={view}
                  onViewProfile={() => viewProfile(c.name)}
                  onMessage={() => navigate("/student/messages")}
                  onStudyGroup={() => navigate("/student/groups")}
                />
              ))}
              {filtered.length === 0 && (
                <p className="col-span-full py-10 text-center text-[13px] text-muted-foreground">No classmates match your filters.</p>
              )}
            </div>
          </div>
        }
        sidebar={
          <>
            <StudentWidgetCard title="Class Snapshot" icon={<Cake className="h-4 w-4 text-primary" />}>
              <div className="flex items-center gap-3 border-b border-border/60 pb-3">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-secondary text-[12.5px] font-semibold text-secondary-foreground">
                  {initials(classTeacher?.name ?? "Class Teacher")}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] text-muted-foreground">Class Teacher</p>
                  <p className="truncate text-[13px] font-semibold text-foreground">{classTeacher?.name}</p>
                </div>
                <button
                  type="button"
                  onClick={() => navigate("/student/messages")}
                  aria-label="Message class teacher"
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-primary/10 hover:text-primary"
                >
                  <Mail className="h-4 w-4" />
                </button>
              </div>
              <div className="mt-3 space-y-2 text-[12.5px]">
                <div className="flex items-center justify-between"><span className="text-muted-foreground">Class / Section</span><span className="font-medium text-foreground">{studentProfile.className} {studentProfile.section}</span></div>
                <div className="flex items-center justify-between"><span className="text-muted-foreground">Room</span><span className="font-medium text-foreground">Room 204</span></div>
                <div className="flex items-center justify-between"><span className="text-muted-foreground">Academic Year</span><span className="font-medium text-foreground">{studentProfile.academicYear}</span></div>
                <div className="flex items-center justify-between"><span className="text-muted-foreground">Total Students</span><span className="font-medium text-foreground">{classmates.length}</span></div>
              </div>
            </StudentWidgetCard>

            <StudentWidgetCard title="House Distribution">
              <div className="flex items-center gap-4">
                <MiniDonutChart
                  segments={houseCounts.map((h) => ({ value: h.count, color: HOUSE_DOT[h.house] }))}
                  centerValue={classmates.length}
                  centerLabel="Students"
                />
                <div className="flex-1 space-y-2 text-[12px]">
                  {houseCounts.map((h) => (
                    <div key={h.house} className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5 text-foreground">
                        <span className="h-2 w-2 rounded-full" style={{ background: HOUSE_DOT[h.house] }} /> {h.house}
                      </span>
                      <span className="text-muted-foreground">{h.count} ({Math.round((h.count / classmates.length) * 100)}%)</span>
                    </div>
                  ))}
                </div>
              </div>
            </StudentWidgetCard>

            <StudentWidgetCard
              title="Today's Birthdays" icon={<Cake className="h-4 w-4 text-primary" />}
              action={<button type="button" onClick={() => toast.info("Full birthday calendar coming from the school office.")} className="text-[12px] font-medium text-primary hover:underline">View all</button>}
            >
              <div className="space-y-2.5">
                {[
                  { id: 4, dayLabel: "Today", tone: "danger" as const },
                  { id: 10, dayLabel: "In 3 days", tone: "warning" as const },
                ].map((b) => {
                  const cm = classmates.find((c) => c.id === b.id)!;
                  return (
                    <div key={b.id} className="flex items-center justify-between gap-2 rounded-xl bg-muted/30 p-2.5">
                      <div className="min-w-0">
                        <p className="truncate text-[12.5px] font-medium text-foreground">{cm.name}</p>
                        <p className="truncate text-[11px] text-muted-foreground">Roll {cm.roll} · {cm.house}</p>
                      </div>
                      <StudentStatusPill label={b.dayLabel} tone={b.tone} className="shrink-0" />
                    </div>
                  );
                })}
              </div>
            </StudentWidgetCard>

            <StudentWidgetCard
              title="Study Groups"
              action={<button type="button" onClick={() => navigate("/student/groups")} className="text-[12px] font-medium text-primary hover:underline">View all</button>}
            >
              <div className="space-y-1">
                {studyGroups.map((g) => (
                  <div key={g.id} className="flex items-center justify-between gap-2 rounded-xl p-2 transition-colors hover:bg-muted/40">
                    <div className="min-w-0">
                      <p className="truncate text-[12.5px] font-medium text-foreground">{g.name}</p>
                      <p className="text-[11px] text-muted-foreground">{g.membersCount} members</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => navigate("/student/groups")}
                      className="shrink-0 rounded-full bg-primary/10 px-3 py-1 text-[11.5px] font-semibold text-primary transition-colors hover:bg-primary/15"
                    >
                      Join
                    </button>
                  </div>
                ))}
              </div>
            </StudentWidgetCard>

            <StudentWidgetCard title="Class Announcements" icon={<Megaphone className="h-4 w-4 text-primary" />}>
              <button
                type="button"
                onClick={() => navigate("/student/notices")}
                className="flex w-full items-center justify-between gap-3 rounded-xl bg-primary/[0.06] p-3 text-left transition-colors hover:bg-primary/10"
              >
                <div className="min-w-0">
                  <p className="truncate text-[12.5px] font-semibold text-primary">Science fair preparations meeting</p>
                  <p className="mt-0.5 text-[11.5px] text-muted-foreground">Tomorrow · 3:30 PM · Room 204</p>
                </div>
                <ArrowRight className="h-4 w-4 shrink-0 text-primary" />
              </button>
            </StudentWidgetCard>
          </>
        }
      />
    </StudentPageShell>
  );
}
