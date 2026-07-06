import { Award } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { SubjectData } from "@/data/subjectsData";

function Bar({ label, value, max, color }: { label: string; value: number; max: number; color: string }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-[12px]">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-semibold text-foreground">{value} <span className="text-muted-foreground font-normal">/ {max}</span></span>
      </div>
      <div className="h-2 rounded-full bg-muted">
        <div className={`h-2 rounded-full ${color}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between border-b border-border/50 py-2 last:border-0 text-[12.5px]">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium text-foreground">{value}</span>
    </div>
  );
}

export function SubjectMarksCard({ sub }: { sub: SubjectData }) {
  const hasTheory    = sub.theoryMarks    > 0;
  const hasPractical = sub.practicalMarks > 0;
  const hasInternal  = sub.internalMarks  > 0;

  return (
    <Card className="border-border/60 shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-[14px] font-semibold flex items-center gap-2">
          <Award className="h-4 w-4 text-muted-foreground" />
          Marks Structure
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* breakdown bars */}
        <div className="space-y-3">
          {hasTheory    && <Bar label="Theory Marks"    value={sub.theoryMarks}    max={sub.fullMarks} color="bg-blue-500"    />}
          {hasPractical && <Bar label="Practical Marks" value={sub.practicalMarks} max={sub.fullMarks} color="bg-violet-500"  />}
          {hasInternal  && <Bar label="Internal Marks"  value={sub.internalMarks}  max={sub.fullMarks} color="bg-amber-500"   />}
          <Bar label="Pass Marks" value={sub.passMarks} max={sub.fullMarks} color="bg-rose-400" />
        </div>

        <div className="h-px bg-border/60" />

        {/* summary */}
        <div>
          <InfoRow label="Full Marks"       value={`${sub.fullMarks}`}       />
          <InfoRow label="Pass Marks"       value={`${sub.passMarks} (${Math.round((sub.passMarks / sub.fullMarks) * 100)}%)`} />
          <InfoRow label="Theory Marks"     value={sub.theoryMarks    > 0 ? `${sub.theoryMarks}`    : "—"} />
          <InfoRow label="Practical Marks"  value={sub.practicalMarks > 0 ? `${sub.practicalMarks}` : "—"} />
          <InfoRow label="Internal Marks"   value={sub.internalMarks  > 0 ? `${sub.internalMarks}`  : "—"} />
          <InfoRow label="Exam Duration"    value={sub.examDuration}         />
          <InfoRow label="Credit Hours"     value={`${sub.creditHours}`}     />
          <InfoRow label="GPA Enabled"      value={sub.gpaEnabled     ? "Yes" : "No"} />
        </div>

        {/* requirement flags */}
        <div className="flex flex-wrap gap-2">
          {[
            { label: "Practical Required", val: sub.practicalRequired },
            { label: "Project Required",   val: sub.projectRequired   },
            { label: "Viva Required",      val: sub.vivaRequired      },
            { label: "Assignment Required",val: sub.assignmentRequired},
          ].map(({ label, val }) => (
            <span key={label}
              className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold ring-1 ring-inset ${
                val
                  ? "bg-emerald-50 text-emerald-700 ring-emerald-500/30 dark:bg-emerald-950/40 dark:text-emerald-400"
                  : "bg-muted text-muted-foreground ring-border/30"
              }`}>
              {label}: {val ? "Yes" : "No"}
            </span>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
