import { useState } from "react";
import { CalendarCheck, Layers, MessageSquare, MoreHorizontal, PenLine } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

import { Reveal } from "@/components/motion";
import { ClassQuickCard } from "@/components/teacher/ClassQuickCard";
import { PremiumBadge } from "@/components/ui/PremiumBadge";
import { PremiumDataTable, type PremiumDataTableColumn } from "@/components/ui/PremiumDataTable";
import { PremiumDropdownMenu } from "@/components/ui/PremiumDropdownMenu";
import { PremiumTabs } from "@/components/ui/PremiumTabs";
import { assignedClasses, type AssignedClass } from "@/data/teacherDashboardData";

type View = "cards" | "table";

export function TeacherClasses() {
  const navigate = useNavigate();
  const [view, setView] = useState<View>("cards");

  const columns: PremiumDataTableColumn<AssignedClass>[] = [
    { key: "className", header: "Class", width: "w-[130px]", render: (c) => (
      <button type="button" className="font-medium text-foreground hover:underline" onClick={() => navigate(`/teacher/classes/${c.id}`)}>{c.className} · {c.section}</button>
    ) },
    { key: "subject", header: "Subject", render: (c) => <span className="text-sm text-foreground">{c.subject}</span> },
    { key: "students", header: "Students", width: "w-[90px]", render: (c) => <span className="tabular-nums text-sm">{c.students}</span> },
    { key: "attendanceRate", header: "Attendance", width: "w-[110px]", render: (c) => <span className="tabular-nums text-sm font-medium text-emerald-600 dark:text-emerald-400">{c.attendanceRate}%</span> },
    { key: "pendingMarks", header: "Pending Marks", width: "w-[130px]", render: (c) => c.pendingMarks > 0 ? <PremiumBadge label={`${c.pendingMarks} pending`} tone="warning" /> : <PremiumBadge label="Up to date" tone="success" /> },
    { key: "nextClass", header: "Next Class", width: "w-[150px]", render: (c) => <span className="text-sm text-muted-foreground">{c.nextClass}</span> },
  ];

  return (
    <div className="space-y-4">
      <Reveal className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-semibold tracking-tight text-foreground">My Classes</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">{assignedClasses.length} classes assigned to you this term.</p>
        </div>
        <PremiumTabs value={view} onValueChange={(v) => setView(v as View)} options={[{ value: "cards", label: "Cards" }, { value: "table", label: "Table" }]} />
      </Reveal>

      {view === "cards" ? (
        <Reveal delay={60} className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {assignedClasses.map((c, i) => <ClassQuickCard key={c.id} cls={c} index={i} />)}
        </Reveal>
      ) : (
        <Reveal delay={60}>
          <PremiumDataTable
            columns={columns}
            rows={assignedClasses}
            rowKey={(c) => c.id}
            emptyIcon={Layers}
            emptyTitle="No classes assigned"
            rowActions={(cls) => (
              <PremiumDropdownMenu
                align="end"
                width="w-52"
                trigger={<button type="button" aria-label="Class actions" className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:bg-accent/70 hover:text-foreground"><MoreHorizontal className="h-4 w-4" /></button>}
                items={[
                  { label: "Mark attendance", icon: CalendarCheck, onClick: () => navigate(`/teacher/attendance?class=${cls.id}`) },
                  { label: "Enter marks", icon: PenLine, onClick: () => navigate(`/teacher/marks?class=${cls.id}`) },
                  { label: "Message parents", icon: MessageSquare, onClick: () => toast.info(`Message composer for ${cls.className}-${cls.section} — coming soon`) },
                ]}
              />
            )}
          />
        </Reveal>
      )}
    </div>
  );
}
