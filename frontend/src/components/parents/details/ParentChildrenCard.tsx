import { BookOpen, ClipboardList, Eye, Wallet } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { ParentAvatar } from "@/components/parents/ParentAvatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { LinkedChild } from "@/data/parentsData";
import type { ChildAcademic } from "@/data/parentDetailsData";

const STUDENT_STATUS_CFG = {
  active:      "bg-emerald-50 text-emerald-700 ring-emerald-500/30 dark:bg-emerald-950/40 dark:text-emerald-400",
  inactive:    "bg-muted text-muted-foreground ring-border/30",
  transferred: "bg-amber-50 text-amber-700 ring-amber-500/30 dark:bg-amber-950/40 dark:text-amber-400",
  graduated:   "bg-blue-50 text-blue-700 ring-blue-500/30 dark:bg-blue-950/40 dark:text-blue-400",
};

const CHILD_ACCENT = [
  "border-l-violet-500",
  "border-l-blue-500",
  "border-l-emerald-500",
  "border-l-amber-500",
];

function ChildCard({ child, academic, index }: {
  child: LinkedChild;
  academic?: ChildAcademic;
  index: number;
}) {
  const navigate = useNavigate();
  const accent = CHILD_ACCENT[index % CHILD_ACCENT.length];

  return (
    <div className={`rounded-xl border border-border/60 border-l-4 ${accent} bg-card p-4 shadow-sm transition-all hover:shadow-md`}>
      {/* Top row */}
      <div className="flex items-start gap-3">
        <ParentAvatar name={child.name} size="md" />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-[14px] font-semibold text-foreground">{child.name}</p>
            <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ring-1 ring-inset ${STUDENT_STATUS_CFG[child.status]}`}>
              {child.status.charAt(0).toUpperCase() + child.status.slice(1)}
            </span>
          </div>
          <p className="text-[12px] text-muted-foreground">
            {child.className} · Section {child.section} · Roll #{child.roll}
          </p>
        </div>
      </div>

      {/* Details grid */}
      <div className="mt-3 grid grid-cols-2 gap-2 text-[12px]">
        <div>
          <span className="text-muted-foreground">Admission No</span>
          <p className="font-medium text-foreground">{child.admissionNo}</p>
        </div>
        <div>
          <span className="text-muted-foreground">Reg No</span>
          <p className="font-medium text-foreground">{child.registrationNo}</p>
        </div>
        <div>
          <span className="text-muted-foreground">Gender</span>
          <p className="font-medium text-foreground">{child.gender}</p>
        </div>
        <div>
          <span className="text-muted-foreground">Class</span>
          <p className="font-medium text-foreground">{child.className} {child.section}</p>
        </div>
      </div>

      {/* Quick stats */}
      {academic && (
        <div className="mt-3 grid grid-cols-3 gap-2">
          <div className="rounded-lg bg-muted/50 p-2 text-center">
            <p className="text-[13px] font-bold text-foreground">{academic.attendancePct}%</p>
            <p className="text-[10px] text-muted-foreground">Attendance</p>
          </div>
          <div className="rounded-lg bg-muted/50 p-2 text-center">
            <p className="text-[13px] font-bold text-foreground">{academic.latestExamPct}%</p>
            <p className="text-[10px] text-muted-foreground">Last Exam</p>
          </div>
          <div className={`rounded-lg p-2 text-center ${academic.dueFees > 0 ? "bg-rose-50 dark:bg-rose-950/30" : "bg-emerald-50 dark:bg-emerald-950/30"}`}>
            <p className={`text-[13px] font-bold ${academic.dueFees > 0 ? "text-rose-600 dark:text-rose-400" : "text-emerald-600 dark:text-emerald-400"}`}>
              {academic.dueFees > 0 ? `NPR ${academic.dueFees.toLocaleString()}` : "Cleared"}
            </p>
            <p className="text-[10px] text-muted-foreground">Due Fees</p>
          </div>
        </div>
      )}

      {/* Action buttons */}
      <div className="mt-3 flex flex-wrap gap-1.5">
        <Button variant="outline" size="sm" className="h-7 gap-1 text-[11px]" onClick={() => navigate(`/students/${child.studentId}`)}>
          <Eye className="h-3 w-3" />View Student
        </Button>
        <Button variant="ghost" size="sm" className="h-7 gap-1 text-[11px]">
          <ClipboardList className="h-3 w-3" />Attendance
        </Button>
        <Button variant="ghost" size="sm" className="h-7 gap-1 text-[11px]">
          <BookOpen className="h-3 w-3" />Results
        </Button>
        <Button variant="ghost" size="sm" className="h-7 gap-1 text-[11px]">
          <Wallet className="h-3 w-3" />Fees
        </Button>
      </div>
    </div>
  );
}

export function ParentChildrenCard({
  children,
  academicData,
}: {
  children: LinkedChild[];
  academicData: ChildAcademic[];
}) {
  if (children.length === 0) {
    return (
      <Card className="border-border/60 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-[14px] font-semibold">Linked Children</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-muted">
              <Eye className="h-5 w-5" />
            </div>
            <p className="text-sm font-medium">No linked children yet.</p>
            <p className="mt-1 text-[12px]">Add children from the Edit Parent form.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border/60 shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-[14px] font-semibold">Linked Children</CardTitle>
          <Badge variant="outline" className="text-[11px]">{children.length} {children.length === 1 ? "child" : "children"}</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className={`grid gap-4 ${children.length === 1 ? "" : "md:grid-cols-2"}`}>
          {children.map((child, i) => (
            <ChildCard
              key={child.id}
              child={child}
              academic={academicData.find((a) => a.studentId === child.studentId)}
              index={i}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
