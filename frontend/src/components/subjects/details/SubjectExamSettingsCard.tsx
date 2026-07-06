import { ClipboardList } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { SubjectData } from "@/data/subjectsData";

function Row({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="flex items-center justify-between border-b border-border/50 py-2.5 last:border-0 text-[12.5px]">
      <span className="text-muted-foreground">{label}</span>
      <span className={`font-medium ${accent ? "text-primary" : "text-foreground"}`}>{value}</span>
    </div>
  );
}

function Flag({ label, enabled }: { label: string; enabled: boolean }) {
  return (
    <div className={`flex items-center justify-between rounded-lg px-3 py-2 text-[12px] ${
      enabled ? "bg-emerald-50 dark:bg-emerald-950/30" : "bg-muted/40"
    }`}>
      <span className={enabled ? "text-emerald-700 dark:text-emerald-400" : "text-muted-foreground"}>{label}</span>
      <span className={`text-[11px] font-semibold ${enabled ? "text-emerald-600 dark:text-emerald-400" : "text-muted-foreground"}`}>
        {enabled ? "Required" : "Not Required"}
      </span>
    </div>
  );
}

export function SubjectExamSettingsCard({ sub }: { sub: SubjectData }) {
  return (
    <Card className="border-border/60 shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-[14px] font-semibold flex items-center gap-2">
          <ClipboardList className="h-4 w-4 text-muted-foreground" />
          Exam &amp; Assessment Settings
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Row label="Subject Type"   value={sub.type}         />
          <Row label="Exam Duration"  value={sub.examDuration} />
          <Row label="Full Marks"     value={`${sub.fullMarks}`} />
          <Row label="Pass Marks"     value={`${sub.passMarks} (${Math.round((sub.passMarks / sub.fullMarks) * 100)}%)`} />
          <Row label="Theory Marks"   value={sub.theoryMarks    > 0 ? `${sub.theoryMarks}`    : "N/A"} />
          <Row label="Practical Marks"value={sub.practicalMarks > 0 ? `${sub.practicalMarks}` : "N/A"} />
          <Row label="Internal Marks" value={sub.internalMarks  > 0 ? `${sub.internalMarks}`  : "N/A"} />
          <Row label="Credit Hours"   value={`${sub.creditHours}`} />
          <Row label="GPA Enabled"    value={sub.gpaEnabled ? "Yes" : "No"} accent={sub.gpaEnabled} />
          <Row label="Academic Year"  value={sub.academicYear}  />
        </div>

        <div className="h-px bg-border/60" />

        <div className="space-y-2">
          <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide mb-2">Assessment Requirements</p>
          <Flag label="Practical Exam"  enabled={sub.practicalRequired} />
          <Flag label="Project Work"    enabled={sub.projectRequired}   />
          <Flag label="Viva / Oral"     enabled={sub.vivaRequired}      />
          <Flag label="Assignments"     enabled={sub.assignmentRequired}/>
        </div>
      </CardContent>
    </Card>
  );
}
