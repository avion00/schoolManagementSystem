import { useQuery } from "@tanstack/react-query";

import { Badge, type BadgeProps } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getMyAttendance, getMyAttendanceSummary } from "@/lib/portal";

function statusVariant(status: string): BadgeProps["variant"] {
  if (status === "present") return "success";
  if (status === "absent") return "destructive";
  if (status === "holiday") return "secondary";
  return "warning";
}

export function StudentAttendancePage() {
  const summary = useQuery({
    queryKey: ["my-attendance-summary"],
    queryFn: getMyAttendanceSummary,
  });
  const list = useQuery({
    queryKey: ["my-attendance"],
    queryFn: () => getMyAttendance(1),
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">My Attendance</h1>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Present</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {summary.data?.present_pct == null ? "—" : `${summary.data.present_pct}%`}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Days recorded</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.data?.total ?? 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Absences</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.data?.by_status?.absent ?? 0}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Remark</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {list.data?.results.length === 0 && (
              <TableRow>
                <TableCell colSpan={3} className="h-24 text-center text-muted-foreground">
                  No attendance records yet.
                </TableCell>
              </TableRow>
            )}
            {list.data?.results.map((r) => (
              <TableRow key={r.id}>
                <TableCell>{r.date}</TableCell>
                <TableCell>
                  <Badge variant={statusVariant(r.status)}>{r.status}</Badge>
                </TableCell>
                <TableCell className="text-muted-foreground">{r.remark || "—"}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
