import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ClassSubject } from "@/data/classesData";

const TYPE_CFG = {
  Compulsory: "bg-blue-50 text-blue-700 ring-blue-500/30 dark:bg-blue-950/40 dark:text-blue-400",
  Optional:   "bg-amber-50 text-amber-700 ring-amber-500/30 dark:bg-amber-950/40 dark:text-amber-400",
};

const SUBJECT_COLORS: Record<string, string> = {
  English:           "bg-blue-500",
  Mathematics:       "bg-violet-500",
  Science:           "bg-emerald-500",
  "Social Studies":  "bg-amber-500",
  "Computer Science":"bg-rose-500",
  Nepali:            "bg-orange-500",
  "Moral Science":   "bg-pink-500",
  "Optional Math":   "bg-indigo-500",
  Account:           "bg-teal-500",
  Physics:           "bg-sky-500",
  Chemistry:         "bg-lime-600",
  Biology:           "bg-green-500",
};

export function ClassSubjectsCard({ subjects }: { subjects: ClassSubject[] }) {
  return (
    <Card className="border-border/60 shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-[14px] font-semibold">Subjects</CardTitle>
          <Badge variant="outline" className="text-[11px]">{subjects.length} subjects</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-[12.5px]">
            <thead>
              <tr className="border-b border-border/60">
                {["Code","Subject","Teacher","Periods/Week","Full Marks","Pass Marks","Type","Status"].map((h) => (
                  <th key={h} className="pb-2 pr-4 text-left font-medium text-muted-foreground whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {subjects.map((s) => {
                const dot = SUBJECT_COLORS[s.subjectName] ?? "bg-muted-foreground";
                return (
                  <tr key={s.subjectCode} className="hover:bg-muted/30 transition-colors">
                    <td className="py-2.5 pr-4 font-mono text-muted-foreground">{s.subjectCode}</td>
                    <td className="py-2.5 pr-4">
                      <div className="flex items-center gap-2">
                        <div className={`h-2.5 w-2.5 shrink-0 rounded-full ${dot}`} />
                        <span className="font-medium text-foreground whitespace-nowrap">{s.subjectName}</span>
                      </div>
                    </td>
                    <td className="py-2.5 pr-4 text-muted-foreground whitespace-nowrap">{s.teacher}</td>
                    <td className="py-2.5 pr-4 text-center font-semibold text-foreground">{s.weeklyPeriods}</td>
                    <td className="py-2.5 pr-4 text-center text-foreground">{s.fullMarks}</td>
                    <td className="py-2.5 pr-4 text-center text-foreground">{s.passMarks}</td>
                    <td className="py-2.5 pr-4">
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ring-1 ring-inset ${TYPE_CFG[s.type]}`}>{s.type}</span>
                    </td>
                    <td className="py-2.5">
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ring-1 ring-inset ${
                        s.status === "active"
                          ? "bg-emerald-50 text-emerald-700 ring-emerald-500/30 dark:bg-emerald-950/40 dark:text-emerald-400"
                          : "bg-muted text-muted-foreground ring-border/30"
                      }`}>{s.status}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
