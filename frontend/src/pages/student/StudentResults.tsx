import { Download, MessageSquare, Printer } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

import { BarChartCard } from "@/components/charts/BarChartCard";
import { LineChartCard } from "@/components/charts/LineChartCard";
import { Reveal } from "@/components/motion";
import { Button } from "@/components/ui/button";
import { PremiumBadge } from "@/components/ui/PremiumBadge";
import { PremiumCard } from "@/components/ui/PremiumCard";
import { PremiumSelect } from "@/components/ui/PremiumSelect";
import { results } from "@/data/studentDashboardData";

export function StudentResults() {
  const navigate = useNavigate();
  const [term, setTerm] = useState(results[0].term);
  const current = results.find((r) => r.term === term)!;

  const subjectMarks = current.subjects.map((s) => ({ subject: s.subject.length > 10 ? `${s.subject.slice(0, 9)}…` : s.subject, total: s.total }));
  const trend = results.slice().reverse().map((r) => ({ term: r.term, percentage: r.percentage }));

  return (
    <div className="space-y-4">
      <Reveal>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-lg font-semibold tracking-tight text-foreground">My Results</h1>
            <p className="mt-0.5 text-[13px] text-muted-foreground">Only published results are shown.</p>
          </div>
          <div className="w-40"><PremiumSelect value={term} onChange={setTerm} options={results.map((r) => ({ value: r.term, label: r.term }))} /></div>
        </div>
      </Reveal>

      <Reveal delay={40}>
        <PremiumCard className="p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-[13.5px] font-semibold text-foreground">{current.term}</p>
              <p className="text-[12.5px] text-muted-foreground">
                {current.percentage}% overall · GPA {current.gpa}{current.rank && ` · Rank ${current.rank}`}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <PremiumBadge label={current.overallResult} tone={current.overallResult === "Pass" ? "success" : "danger"} />
              <Button variant="outline" size="sm" className="h-8 gap-1.5 text-[12px]" onClick={() => toast.success("Downloading marksheet…")}>
                <Download className="h-3.5 w-3.5" /> Marksheet
              </Button>
              <Button variant="outline" size="sm" className="h-8 gap-1.5 text-[12px]" onClick={() => window.print()}>
                <Printer className="h-3.5 w-3.5" /> Print
              </Button>
              <Button variant="outline" size="sm" className="h-8 gap-1.5 text-[12px]" onClick={() => navigate("/student/messages")}>
                <MessageSquare className="h-3.5 w-3.5" /> Ask teacher
              </Button>
            </div>
          </div>

          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-[12.5px]">
              <thead>
                <tr className="border-b border-border/60 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                  <th className="py-2">Subject</th>
                  <th className="py-2">Theory</th>
                  <th className="py-2">Practical</th>
                  <th className="py-2">Internal</th>
                  <th className="py-2">Total</th>
                  <th className="py-2">Full Marks</th>
                  <th className="py-2">Grade</th>
                  <th className="py-2">Result</th>
                  <th className="py-2">Remark</th>
                </tr>
              </thead>
              <tbody>
                {current.subjects.map((s) => (
                  <tr key={s.subject} className="border-b border-border/40">
                    <td className="py-2 font-medium text-foreground">{s.subject}</td>
                    <td className="py-2 text-muted-foreground">{s.theory}</td>
                    <td className="py-2 text-muted-foreground">{s.practical}</td>
                    <td className="py-2 text-muted-foreground">{s.internal}</td>
                    <td className="py-2 font-medium text-foreground">{s.total}</td>
                    <td className="py-2 text-muted-foreground">{s.fullMarks}</td>
                    <td className="py-2 text-foreground">{s.grade}</td>
                    <td className="py-2"><PremiumBadge label={s.result} tone={s.result === "Pass" ? "success" : "danger"} /></td>
                    <td className="py-2 text-muted-foreground">{s.remark}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </PremiumCard>
      </Reveal>

      <Reveal delay={80} className="grid gap-4 lg:grid-cols-2">
        <BarChartCard title="Subject marks" subtitle={current.term} data={subjectMarks} xKey="subject" series={[{ key: "total", label: "Marks", color: "#6366f1" }]} />
        <LineChartCard title="Performance trend" subtitle="Percentage across terms" data={trend} xKey="term" series={[{ key: "percentage", label: "Percentage", color: "#10b981" }]} valueFormatter={(v) => `${v}%`} />
      </Reveal>
    </div>
  );
}
