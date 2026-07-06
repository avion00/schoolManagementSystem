import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ClassExam } from "@/data/classDetailData";

const STATUS_CFG = {
  Upcoming:  "bg-blue-50 text-blue-700 ring-blue-500/30 dark:bg-blue-950/40 dark:text-blue-400",
  Completed: "bg-emerald-50 text-emerald-700 ring-emerald-500/30 dark:bg-emerald-950/40 dark:text-emerald-400",
  Cancelled: "bg-rose-50 text-rose-700 ring-rose-500/30 dark:bg-rose-950/40 dark:text-rose-400",
};

export function ClassExamsCard({ exams }: { exams: ClassExam[] }) {
  return (
    <Card className="border-border/60 shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-[14px] font-semibold">Exams</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-[12.5px]">
            <thead>
              <tr className="border-b border-border/60">
                {["Exam Name","Subject","Date","Time","Full Marks","Status"].map((h) => (
                  <th key={h} className="pb-2 pr-4 text-left font-medium text-muted-foreground whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {exams.map((exam) => (
                <tr key={exam.id} className="hover:bg-muted/30 transition-colors">
                  <td className="py-2.5 pr-4 font-medium text-foreground whitespace-nowrap">{exam.name}</td>
                  <td className="py-2.5 pr-4 text-muted-foreground">{exam.subject}</td>
                  <td className="py-2.5 pr-4 text-muted-foreground whitespace-nowrap">
                    {new Date(exam.date).toLocaleDateString("en-US", { day:"numeric", month:"short", year:"numeric" })}
                  </td>
                  <td className="py-2.5 pr-4 text-muted-foreground">{exam.time}</td>
                  <td className="py-2.5 pr-4 text-center font-semibold text-foreground">{exam.fullMarks}</td>
                  <td className="py-2.5">
                    <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold ring-1 ring-inset ${STATUS_CFG[exam.status]}`}>
                      {exam.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
