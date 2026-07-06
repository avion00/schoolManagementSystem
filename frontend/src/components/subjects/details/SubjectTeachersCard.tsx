import { Mail, Phone, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { SubjectTeacher } from "@/data/subjectDetailData";

const PALETTE = [
  "bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300",
  "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
  "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
  "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
  "bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300",
];

function initials(name: string) {
  return name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
}

export function SubjectTeachersCard({ teachers }: { teachers: SubjectTeacher[] }) {
  return (
    <Card className="border-border/60 shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-[14px] font-semibold flex items-center gap-2">
            <Users className="h-4 w-4 text-muted-foreground" />
            Assigned Teachers
          </CardTitle>
          <span className="text-[11px] text-muted-foreground">{teachers.length} teachers</span>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-[12.5px]">
            <thead>
              <tr className="border-b border-border/60">
                {["Teacher","Employee ID","Department","Assigned Classes","Weekly Load","Contact"].map((h) => (
                  <th key={h} className="pb-2 text-left font-medium text-muted-foreground whitespace-nowrap pr-4">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {teachers.map((t, i) => (
                <tr key={t.id} className="hover:bg-muted/30 transition-colors">
                  <td className="py-3 pr-4">
                    <div className="flex items-center gap-2.5">
                      <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[11px] font-bold ${PALETTE[i % PALETTE.length]}`}>
                        {initials(t.name)}
                      </div>
                      <span className="font-medium text-foreground whitespace-nowrap">{t.name}</span>
                    </div>
                  </td>
                  <td className="py-3 pr-4 font-mono text-muted-foreground">{t.employeeId}</td>
                  <td className="py-3 pr-4 text-muted-foreground">{t.department}</td>
                  <td className="py-3 pr-4 text-muted-foreground max-w-[180px]">{t.classes}</td>
                  <td className="py-3 pr-4 text-muted-foreground">{t.weeklyLoad} periods</td>
                  <td className="py-3 pr-4">
                    <div className="flex flex-col gap-0.5">
                      <span className="flex items-center gap-1 text-muted-foreground">
                        <Mail className="h-3 w-3" />{t.email}
                      </span>
                      <span className="flex items-center gap-1 text-muted-foreground">
                        <Phone className="h-3 w-3" />{t.contact}
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {teachers.length === 0 && (
          <p className="py-8 text-center text-[13px] text-muted-foreground">No teachers assigned.</p>
        )}
      </CardContent>
    </Card>
  );
}
