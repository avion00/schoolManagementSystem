import { CalendarCheck, Eye, GraduationCap, MessageSquare, MoreHorizontal, NotebookPen, PenLine } from "lucide-react";

import { StudentAvatar } from "@/components/students/StudentAvatar";
import { StudentRiskBadge } from "@/components/teacher/StudentRiskBadge";
import { PremiumBadge, type PremiumBadgeTone } from "@/components/ui/PremiumBadge";
import { PremiumDataTable, type PremiumDataTableColumn, type PremiumDataTablePagination } from "@/components/ui/PremiumDataTable";
import { PremiumDropdownMenu } from "@/components/ui/PremiumDropdownMenu";
import { computeRiskLevel, type AssignedStudent, type PerformanceLevel } from "@/data/teacherDashboardData";

const PERFORMANCE_TONE: Record<PerformanceLevel, PremiumBadgeTone> = {
  Excellent: "success",
  Good: "info",
  Average: "warning",
  "Needs Improvement": "danger",
};

export function TeacherStudentsTable({
  rows,
  selected,
  onSelectionChange,
  pagination,
  hasActiveFilter,
  onResetFilters,
  onViewProfile,
  onAddRemark,
  onMessageGuardian,
  onViewAttendance,
  onViewMarks,
}: {
  rows: AssignedStudent[];
  selected: Set<string | number>;
  onSelectionChange: (keys: Set<string | number>) => void;
  pagination: PremiumDataTablePagination;
  hasActiveFilter: boolean;
  onResetFilters: () => void;
  onViewProfile: (student: AssignedStudent) => void;
  onAddRemark: (student: AssignedStudent) => void;
  onMessageGuardian: (student: AssignedStudent) => void;
  onViewAttendance: (student: AssignedStudent) => void;
  onViewMarks: (student: AssignedStudent) => void;
}) {
  const columns: PremiumDataTableColumn<AssignedStudent>[] = [
    { key: "registrationNo", header: "Reg. No", width: "w-[130px]", render: (s) => <span className="font-mono text-xs text-muted-foreground">{s.registrationNo}</span> },
    {
      key: "name", header: "Student", width: "w-[200px]", sortable: true, render: (s) => (
        <div className="flex items-center gap-2.5">
          <StudentAvatar name={s.name} />
          <p className="truncate text-sm font-medium text-foreground">{s.name}</p>
        </div>
      ),
    },
    { key: "className", header: "Class", width: "w-[90px]", sortable: true, render: (s) => <span className="text-sm">{s.className}</span> },
    { key: "section", header: "Section", width: "w-[80px]", render: (s) => <span className="text-sm text-muted-foreground">{s.section}</span> },
    { key: "roll", header: "Roll", width: "w-[60px]", sortable: true, render: (s) => <span className="tabular-nums text-sm">{s.roll}</span> },
    { key: "guardian", header: "Guardian", render: (s) => <span className="truncate text-sm text-muted-foreground">{s.guardian}</span> },
    { key: "attendancePercentage", header: "Attendance", width: "w-[100px]", sortable: true, render: (s) => (
      <span className={`tabular-nums text-sm font-medium ${s.attendancePercentage < 75 ? "text-rose-600 dark:text-rose-400" : "text-foreground"}`}>
        {s.attendancePercentage.toFixed(1)}%
      </span>
    ) },
    { key: "performance", header: "Performance", width: "w-[130px]", render: (s) => <PremiumBadge label={s.performance} tone={PERFORMANCE_TONE[s.performance]} /> },
    { key: "pendingHomework", header: "Homework", width: "w-[100px]", render: (s) => s.pendingHomework > 0 ? <span className="tabular-nums text-sm text-amber-600 dark:text-amber-400">{s.pendingHomework} pending</span> : <span className="text-sm text-muted-foreground">Up to date</span> },
    { key: "risk", header: "Risk", width: "w-[110px]", render: (s) => <StudentRiskBadge level={computeRiskLevel(s)} /> },
  ];

  return (
    <PremiumDataTable
      columns={columns}
      rows={rows}
      rowKey={(s) => s.id}
      selectable
      selectedKeys={selected}
      onSelectionChange={onSelectionChange}
      emptyIcon={GraduationCap}
      emptyTitle="No students found"
      emptyDescription={hasActiveFilter ? "Try adjusting your search or filters." : "No students are assigned to you yet."}
      emptyAction={hasActiveFilter ? <button type="button" onClick={onResetFilters} className="text-xs font-medium text-primary hover:underline">Clear filters</button> : undefined}
      pagination={pagination}
      rowActions={(student) => (
        <PremiumDropdownMenu
          align="end"
          width="w-52"
          trigger={
            <button type="button" aria-label="Row actions" className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:bg-accent/70 hover:text-foreground">
              <MoreHorizontal className="h-4 w-4" />
            </button>
          }
          items={[
            { label: "View profile", icon: Eye, onClick: () => onViewProfile(student) },
            { label: "Add remark", icon: NotebookPen, onClick: () => onAddRemark(student) },
            { label: "Message guardian", icon: MessageSquare, onClick: () => onMessageGuardian(student) },
            "separator",
            { label: "View attendance", icon: CalendarCheck, onClick: () => onViewAttendance(student) },
            { label: "View marks", icon: PenLine, onClick: () => onViewMarks(student) },
          ]}
        />
      )}
    />
  );
}
