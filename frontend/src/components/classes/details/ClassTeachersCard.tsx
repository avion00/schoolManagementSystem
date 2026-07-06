import { Phone } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { DetailTeacher } from "@/data/classDetailData";

const ROLE_CFG = {
  "Class Teacher":     "bg-violet-50 text-violet-700 ring-violet-500/30 dark:bg-violet-950/40 dark:text-violet-400",
  "Subject Teacher":   "bg-blue-50 text-blue-700 ring-blue-500/30 dark:bg-blue-950/40 dark:text-blue-400",
  "Assistant Teacher": "bg-amber-50 text-amber-700 ring-amber-500/30 dark:bg-amber-950/40 dark:text-amber-400",
};

const PALETTE = ["bg-violet-500","bg-blue-500","bg-emerald-500","bg-amber-500","bg-rose-500","bg-sky-500"];

function initials(name: string) {
  const w = name.trim().split(" ");
  return (w[0][0] + (w[1]?.[0] ?? "")).toUpperCase();
}

export function ClassTeachersCard({ teachers }: { teachers: DetailTeacher[] }) {
  return (
    <Card className="border-border/60 shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-[14px] font-semibold">Assigned Teachers</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-[12.5px]">
            <thead>
              <tr className="border-b border-border/60">
                {["Teacher","Employee ID","Subject","Periods/Week","Section","Role","Contact"].map((h) => (
                  <th key={h} className="pb-2 pr-4 text-left font-medium text-muted-foreground whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {teachers.map((t, i) => (
                <tr key={t.id} className="hover:bg-muted/30 transition-colors">
                  <td className="py-2.5 pr-4">
                    <div className="flex items-center gap-2.5">
                      <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-white ${PALETTE[i % PALETTE.length]}`}>
                        {initials(t.name)}
                      </div>
                      <span className="font-medium text-foreground whitespace-nowrap">{t.name}</span>
                    </div>
                  </td>
                  <td className="py-2.5 pr-4 font-mono text-muted-foreground">{t.employeeId}</td>
                  <td className="py-2.5 pr-4 text-foreground">{t.subject}</td>
                  <td className="py-2.5 pr-4 text-center font-semibold text-foreground">{t.weeklyPeriods}</td>
                  <td className="py-2.5 pr-4 text-muted-foreground">{t.section}</td>
                  <td className="py-2.5 pr-4">
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ring-1 ring-inset ${ROLE_CFG[t.role]}`}>{t.role}</span>
                  </td>
                  <td className="py-2.5">
                    <a href={`tel:${t.contact}`} className="flex items-center gap-1 text-muted-foreground hover:text-primary transition-colors">
                      <Phone className="h-3 w-3" />{t.contact}
                    </a>
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
