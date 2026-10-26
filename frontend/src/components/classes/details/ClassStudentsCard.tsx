import { Eye, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { PremiumEmptyState } from "@/components/ui/PremiumEmptyState";
import { DetailCard } from "@/components/ui/DetailCard";
import type { DetailStudent } from "@/api/types/classes";

const FEE_CFG = {
  Paid:    "bg-emerald-50 text-emerald-700 ring-emerald-500/30 dark:bg-emerald-950/40 dark:text-emerald-400",
  Due:     "bg-amber-50 text-amber-700 ring-amber-500/30 dark:bg-amber-950/40 dark:text-amber-400",
  Overdue: "bg-rose-50 text-rose-700 ring-rose-500/30 dark:bg-rose-950/40 dark:text-rose-400",
};
const RESULT_CFG = {
  Published: "bg-blue-50 text-blue-700 ring-blue-500/30 dark:bg-blue-950/40 dark:text-blue-400",
  Pending:   "bg-amber-50 text-amber-700 ring-amber-500/30 dark:bg-amber-950/40 dark:text-amber-400",
  "N/A":     "bg-muted text-muted-foreground ring-border/30",
};

function attColor(p: number) {
  if (p >= 90) return "text-emerald-600 dark:text-emerald-400";
  if (p >= 75) return "text-amber-600 dark:text-amber-400";
  return "text-rose-600 dark:text-rose-400";
}

function Badge({ label, cls }: { label: string; cls: string }) {
  return <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ring-1 ring-inset ${cls}`}>{label}</span>;
}

export function ClassStudentsCard({ students }: { students: DetailStudent[] }) {
  if (students.length === 0) {
    return (
      <DetailCard icon={Users} title="Students">
        <PremiumEmptyState title="No active students in this class." className="py-6" />
      </DetailCard>
    );
  }
  const navigate = useNavigate();
  return (
    <DetailCard
      icon={Users}
      title="Students"
      action={
        <Button variant="outline" size="sm" className="h-7 gap-1.5 text-[11px]"
          onClick={() => navigate("/students")}>
          <Users className="h-3 w-3" />View All Students
        </Button>
      }
    >
        <div className="overflow-x-auto">
          <table className="w-full text-[12.5px]">
            <thead>
              <tr className="border-b border-border/60">
                {["Admission No","Reg No","Name","Section","Roll","Gender","Attendance","Fee","Result",""].map((h) => (
                  <th key={h} className="pb-2 text-left font-medium text-muted-foreground whitespace-nowrap pr-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {students.map((s) => (
                <tr key={s.id} className="group hover:bg-muted/30 transition-colors">
                  <td className="py-2.5 pr-3 font-mono text-muted-foreground">{s.admissionNo}</td>
                  <td className="py-2.5 pr-3 font-mono text-muted-foreground">{s.registrationNo}</td>
                  <td className="py-2.5 pr-3 font-medium text-foreground whitespace-nowrap">{s.name}</td>
                  <td className="py-2.5 pr-3 text-muted-foreground">Sec {s.section}</td>
                  <td className="py-2.5 pr-3 text-muted-foreground">{s.roll === null ? "—" : `#${s.roll}`}</td>
                  <td className="py-2.5 pr-3 text-muted-foreground">{s.gender}</td>
                  <td className="py-2.5 pr-3">
                    <span className={`font-semibold ${attColor(s.attendancePct ?? 0)}`}>{s.attendancePct === null ? "—" : `${s.attendancePct}%`}</span>
                  </td>
                  <td className="py-2.5 pr-3"><Badge label={s.feeStatus}   cls={s.feeStatus === "—" ? "bg-muted text-muted-foreground" : FEE_CFG[s.feeStatus]} /></td>
                  <td className="py-2.5 pr-3"><Badge label={s.resultStatus} cls={RESULT_CFG[s.resultStatus]} /></td>
                  <td className="py-2.5">
                    <Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover:opacity-100"
                      onClick={() => navigate(`/students/${s.id}`)}>
                      <Eye className="h-3 w-3" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-[11px] text-muted-foreground">Showing {students.length} students · <button className="text-primary underline">View all</button></p>
    </DetailCard>
  );
}
