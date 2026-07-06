import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Teacher } from "@/data/teachersData";
import type { TeacherEmploymentExtra } from "@/data/teacherDetailsData";

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 py-1.5">
      <span className="min-w-[140px] text-[12.5px] text-muted-foreground">{label}</span>
      <span className="text-right text-[13px] font-medium text-foreground">{value ?? "—"}</span>
    </div>
  );
}

function fmtDate(d: string) {
  return new Date(d).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
}

function yearsFrom(d: string) {
  const diff = (Date.now() - new Date(d).getTime()) / (1000 * 60 * 60 * 24 * 365.25);
  return Math.floor(diff);
}

export function TeacherEmploymentInfoCard({
  teacher,
  extra,
}: {
  teacher: Teacher;
  extra: TeacherEmploymentExtra;
}) {
  return (
    <Card className="border-border/60 shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-[14px] font-semibold">Employment Details</CardTitle>
      </CardHeader>
      <CardContent className="space-y-0 divide-y divide-border/40">
        <Row label="Employee ID"      value={<span className="font-mono">{teacher.employeeId}</span>} />
        <Row label="Staff Code"       value={<span className="font-mono">{teacher.staffCode}</span>} />
        <Row label="Designation"      value={teacher.designation} />
        <Row label="Department"       value={teacher.department} />
        <Row label="Primary Subject"  value={teacher.subject} />
        <Row
          label="Secondary Subjects"
          value={
            extra.secondarySubjects.length ? (
              <div className="flex flex-wrap gap-1 justify-end">
                {extra.secondarySubjects.map((s) => (
                  <Badge key={s} variant="secondary" className="text-[11px]">{s}</Badge>
                ))}
              </div>
            ) : "—"
          }
        />
        <Row label="Employment Type"  value={teacher.employmentType} />
        <Row label="Joining Date"     value={`${fmtDate(teacher.joiningDate)} (${yearsFrom(teacher.joiningDate)} yrs)`} />
        <Row label="Experience"       value={`${teacher.experienceYears} years`} />
        <Row label="Qualification"    value={teacher.qualification} />
        <Row label="Class Teacher of" value={extra.classTeacherOf || "—"} />
        <Row label="Weekly Periods"   value={`${extra.weeklyPeriods} periods`} />
        <Row
          label="Skills"
          value={
            extra.skills.length ? (
              <div className="flex flex-wrap gap-1 justify-end">
                {extra.skills.map((s) => (
                  <Badge key={s} variant="outline" className="text-[11px]">{s}</Badge>
                ))}
              </div>
            ) : "—"
          }
        />
        <Row
          label="Certifications"
          value={
            <div className="text-right space-y-0.5">
              {extra.certifications.map((c) => (
                <p key={c} className="text-[12px]">{c}</p>
              ))}
            </div>
          }
        />
      </CardContent>
    </Card>
  );
}
