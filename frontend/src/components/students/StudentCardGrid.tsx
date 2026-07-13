import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

import { StudentAvatar } from "@/components/students/StudentAvatar";
import { StudentStatusBadge } from "@/components/students/StudentStatusBadge";
import { Button } from "@/components/ui/button";
import { PremiumCard } from "@/components/ui/PremiumCard";
import { PremiumEmptyState } from "@/components/ui/PremiumEmptyState";
import { RowActionMenu } from "@/components/ui/RowActionMenu";
import type { Student } from "@/data/studentsData";

function StudentCard({ student, index }: { student: Student; index: number }) {
  const navigate = useNavigate();
  return (
    <PremiumCard hoverable className="t-row-in flex flex-col gap-3 p-4" style={{ "--row-index": index } as React.CSSProperties}>
      <div className="flex items-center gap-2.5">
        <StudentAvatar name={student.name} />
        <div className="min-w-0 flex-1">
          <p className="truncate text-[13px] font-medium text-foreground">{student.name}</p>
          <p className="truncate text-[11px] text-muted-foreground">{student.registrationNo}</p>
        </div>
        <RowActionMenu
          onView={() => navigate(`/students/${student.id}`)}
          onEdit={() => navigate(`/students/${student.id}/edit`)}
          onPrint={() => window.print()}
          onDownload={() => console.log("Download record:", student.registrationNo)}
          onMessage={() => console.log("Message guardian:", student.parentName)}
          onDelete={() => toast.error(`Delete ${student.name}? (static — no action taken)`, { duration: 2000 })}
        />
      </div>
      <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 text-[12px]">
        <span className="text-muted-foreground">Class</span>
        <span className="text-right text-foreground">{student.className}{student.section ? ` · ${student.section}` : ""}</span>
        <span className="text-muted-foreground">Roll</span>
        <span className="text-right tabular-nums text-foreground">{student.roll}</span>
        <span className="text-muted-foreground">Guardian</span>
        <span className="truncate text-right text-foreground">{student.parentName}</span>
        <span className="text-muted-foreground">Mobile</span>
        <span className="truncate text-right font-mono text-[11px] text-foreground">{student.mobile}</span>
      </div>
      <div className="flex items-center justify-between border-t border-neutral-200/70 pt-3 dark:border-neutral-800">
        <StudentStatusBadge status={student.status} />
        <Button variant="outline" size="sm" className="h-8 text-[12px]" onClick={() => navigate(`/students/${student.id}`)}>
          View profile
        </Button>
      </div>
    </PremiumCard>
  );
}

export function StudentCardGrid({
  students,
  hasActiveFilter,
  onResetFilters,
}: {
  students: Student[];
  hasActiveFilter: boolean;
  onResetFilters: () => void;
}) {
  if (students.length === 0) {
    return (
      <PremiumCard>
        <PremiumEmptyState
          title="No students found"
          description={hasActiveFilter ? "Try adjusting your search or filters." : "No students are enrolled yet."}
          action={hasActiveFilter ? <Button variant="outline" size="sm" onClick={onResetFilters}>Clear filters</Button> : undefined}
        />
      </PremiumCard>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {students.map((s, i) => <StudentCard key={s.id} student={s} index={i} />)}
    </div>
  );
}
