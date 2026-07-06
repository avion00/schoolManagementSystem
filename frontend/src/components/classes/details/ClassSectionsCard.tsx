import { Eye, Pencil, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ClassSection } from "@/data/classesData";

const SECTION_COLORS = [
  "border-l-violet-500", "border-l-blue-500", "border-l-emerald-500",
  "border-l-amber-500",  "border-l-rose-500",
];

function pctBar(v: number) {
  const color = v >= 90 ? "bg-emerald-500" : v >= 75 ? "bg-amber-500" : "bg-rose-500";
  return (
    <div className="mt-1 h-1 w-full overflow-hidden rounded-full bg-muted">
      <div className={`h-full rounded-full ${color}`} style={{ width: `${v}%` }} />
    </div>
  );
}

export function ClassSectionsCard({ sections }: { sections: ClassSection[] }) {
  return (
    <Card className="border-border/60 shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-[14px] font-semibold">Sections</CardTitle>
          <Badge variant="outline" className="text-[11px]">{sections.length} sections</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className={`grid gap-4 ${sections.length > 2 ? "sm:grid-cols-2 lg:grid-cols-3" : "sm:grid-cols-2"}`}>
          {sections.map((section, i) => {
            const usedPct = Math.round((section.totalStudents / section.capacity) * 100);
            const accent  = SECTION_COLORS[i % SECTION_COLORS.length];
            return (
              <div key={section.id} className={`rounded-xl border border-border/60 border-l-4 ${accent} bg-card p-4 shadow-sm hover:shadow-md transition-all`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-[13px] font-bold text-primary">
                      {section.sectionName}
                    </div>
                    <div>
                      <p className="text-[13px] font-semibold text-foreground">Section {section.sectionName}</p>
                      <p className="text-[11px] text-muted-foreground">{section.sectionCode}</p>
                    </div>
                  </div>
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ring-1 ring-inset ${
                    section.status === "active"
                      ? "bg-emerald-50 text-emerald-700 ring-emerald-500/30 dark:bg-emerald-950/40 dark:text-emerald-400"
                      : "bg-muted text-muted-foreground ring-border/30"
                  }`}>{section.status}</span>
                </div>

                <div className="mt-3 grid grid-cols-2 gap-2 text-[12px]">
                  <div>
                    <span className="text-muted-foreground">Class Teacher</span>
                    <p className="font-medium text-foreground">{section.classTeacher}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Room</span>
                    <p className="font-medium text-foreground">{section.room}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Students</span>
                    <p className="font-medium text-foreground">{section.totalStudents} / {section.capacity}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Gender</span>
                    <p className="font-medium text-foreground">♂{section.maleStudents} · ♀{section.femaleStudents}</p>
                  </div>
                </div>

                {/* Capacity bar */}
                <div className="mt-3">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-muted-foreground">Capacity</span>
                    <span className="font-medium">{usedPct}%</span>
                  </div>
                  {pctBar(usedPct)}
                </div>

                {/* Attendance */}
                <div className="mt-2">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-muted-foreground">Attendance</span>
                    <span className={`font-medium ${section.attendanceAverage >= 90 ? "text-emerald-600" : section.attendanceAverage >= 75 ? "text-amber-600" : "text-rose-600"}`}>
                      {section.attendanceAverage}%
                    </span>
                  </div>
                  {pctBar(section.attendanceAverage)}
                </div>

                {/* Actions */}
                <div className="mt-3 flex gap-1.5">
                  <Button variant="outline" size="sm" className="h-7 flex-1 gap-1 text-[11px]">
                    <Eye className="h-3 w-3" />View
                  </Button>
                  <Button variant="ghost" size="sm" className="h-7 flex-1 gap-1 text-[11px]">
                    <Users className="h-3 w-3" />Students
                  </Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7">
                    <Pencil className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
