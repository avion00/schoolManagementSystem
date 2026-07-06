import { useQuery } from "@tanstack/react-query";
import { CalendarCheck, GraduationCap, ReceiptText, ScrollText } from "lucide-react";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip as RTooltip } from "recharts";

import { Reveal } from "@/components/motion";
import { SectionCard } from "@/components/SectionCard";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAuth } from "@/lib/auth";
import { getMyDashboard } from "@/lib/portal";

export function StudentDashboardPage() {
  const { user } = useAuth();
  const { data, isLoading } = useQuery({
    queryKey: ["my-dashboard"],
    queryFn: getMyDashboard,
  });

  const p = data?.profile;
  const att = data?.attendance;
  const presentLike =
    (att?.by_status?.present ?? 0) +
    (att?.by_status?.late ?? 0) +
    (att?.by_status?.half_day ?? 0);
  const otherDays = (att?.total ?? 0) - presentLike;
  const attPie = [
    { name: "Present", value: presentLike, color: "#10b981" },
    { name: "Other", value: otherDays, color: "#e2e8f0" },
  ];
  const result = data?.latest_result;

  return (
    <div className="space-y-4">
      {/* Compact student greeting — differs meaningfully from the "Dashboard" header title */}
      {(p || !isLoading) && (
        <Reveal>
          <div className="pb-1">
            <p className="text-base font-semibold tracking-tight text-foreground">
              Hello, {p?.first_name || user?.full_name?.split(" ")[0] || "Student"}
            </p>
            <p className="mt-0.5 text-sm text-muted-foreground">
              {p
                ? `${[p.class_level_name, p.section_name].filter(Boolean).join(" ")} · Roll ${p.roll_number || "—"}`
                : "Your student portal"}
            </p>
          </div>
        </Reveal>
      )}

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-[140px]" />)}
        </div>
      ) : (
        <Reveal delay={60} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <SectionCard
            label="Attendance"
            value={att?.present_pct == null ? "—" : `${att.present_pct}%`}
            icon={CalendarCheck}
            footer="Present overall"
            sub={`${att?.total ?? 0} days recorded`}
          />
          <SectionCard
            label="Fees outstanding"
            value={String(data?.fees.outstanding ?? 0)}
            icon={ReceiptText}
            footer="Outstanding balance"
            sub={`Paid ${data?.fees.paid ?? 0} of ${data?.fees.billed ?? 0}`}
          />
          <SectionCard
            label="Published exams"
            value={String(data?.published_exams ?? 0)}
            icon={ScrollText}
            footer="Results available"
            sub="See the Results tab"
          />
          <SectionCard
            label="Admission #"
            value={p?.admission_number ?? "—"}
            icon={GraduationCap}
            footer="Your student ID"
            sub={`${p?.class_level_name ?? ""} ${p?.section_name ?? ""}`.trim() || "—"}
          />
        </Reveal>
      )}

      <Reveal delay={120} className="grid gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Attendance</CardTitle>
            <CardDescription>Overall</CardDescription>
          </CardHeader>
          <CardContent>
            {att?.total ? (
              <div className="relative h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={attPie} dataKey="value" nameKey="name" innerRadius={54} outerRadius={76} strokeWidth={0}>
                      {attPie.map((d) => <Cell key={d.name} fill={d.color} />)}
                    </Pie>
                    <RTooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-3xl font-bold">{att.present_pct ?? 0}%</span>
                  <span className="text-xs text-muted-foreground">present</span>
                </div>
              </div>
            ) : (
              <p className="py-16 text-center text-sm text-muted-foreground">No attendance yet.</p>
            )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg">
              {result ? `Latest result · ${result.exam}` : "Latest result"}
            </CardTitle>
            <CardDescription>
              {result?.percentage != null ? `${result.percentage}% overall` : "No published results yet"}
            </CardDescription>
          </CardHeader>
          <CardContent className="px-0">
            {result?.subjects.length ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="pl-6">Subject</TableHead>
                    <TableHead>Marks</TableHead>
                    <TableHead>Full</TableHead>
                    <TableHead className="pr-6 text-right">Result</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {result.subjects.map((s) => {
                    const passed =
                      !s.is_absent && s.marks_obtained != null && s.marks_obtained >= s.pass_marks;
                    return (
                      <TableRow key={s.subject}>
                        <TableCell className="pl-6 font-medium">{s.subject}</TableCell>
                        <TableCell>{s.is_absent ? "Absent" : s.marks_obtained ?? "—"}</TableCell>
                        <TableCell>{s.full_marks}</TableCell>
                        <TableCell className="pr-6 text-right">
                          <Badge variant={passed ? "success" : "destructive"}>
                            {s.is_absent ? "Absent" : passed ? "Pass" : "Fail"}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            ) : (
              <p className="px-6 py-16 text-center text-sm text-muted-foreground">
                Results will appear here once published.
              </p>
            )}
          </CardContent>
        </Card>
      </Reveal>
    </div>
  );
}
