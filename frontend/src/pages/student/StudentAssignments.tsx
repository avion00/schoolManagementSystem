import { ClipboardCheck } from "lucide-react";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import { Reveal, SlidingTabs } from "@/components/motion";
import { StudentAssignmentCard } from "@/components/student/StudentAssignmentCard";
import { PremiumEmptyState } from "@/components/ui/PremiumEmptyState";
import { homeworkAssignments } from "@/data/studentDashboardData";

const TODAY = "2026-07-16";
const TABS = [
  { value: "todo", label: "To Do" },
  { value: "today", label: "Due Today" },
  { value: "submitted", label: "Submitted" },
  { value: "graded", label: "Graded" },
  { value: "missing", label: "Missing" },
];

export function StudentAssignments() {
  const navigate = useNavigate();
  const [tab, setTab] = useState("todo");

  const rows = useMemo(() => {
    switch (tab) {
      case "todo": return homeworkAssignments.filter((h) => h.status === "To Do");
      case "today": return homeworkAssignments.filter((h) => h.status === "To Do" && h.dueDate === TODAY);
      case "submitted": return homeworkAssignments.filter((h) => h.status === "Submitted");
      case "graded": return homeworkAssignments.filter((h) => h.status === "Graded");
      case "missing": return homeworkAssignments.filter((h) => h.status === "Missing");
      default: return homeworkAssignments;
    }
  }, [tab]);

  return (
    <div className="space-y-4">
      <Reveal>
        <h1 className="text-lg font-semibold tracking-tight text-foreground">Homework & Assignments</h1>
        <p className="mt-0.5 text-[13px] text-muted-foreground">{homeworkAssignments.length} total across all subjects</p>
      </Reveal>

      <Reveal delay={40} className="-mx-1 overflow-x-auto px-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <SlidingTabs value={tab} onValueChange={setTab} options={TABS} className="w-max" />
      </Reveal>

      <Reveal delay={80} className="grid gap-3 sm:grid-cols-2">
        {rows.map((a) => (
          <StudentAssignmentCard key={a.id} assignment={a} onView={() => navigate(`/student/assignments/${a.id}`)} />
        ))}
      </Reveal>
      {rows.length === 0 && (
        <PremiumEmptyState icon={ClipboardCheck} title="Nothing here" description="No assignments in this tab right now." />
      )}
    </div>
  );
}
