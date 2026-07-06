import { useQuery } from "@tanstack/react-query";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getMyResults } from "@/lib/portal";

export function StudentResultsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["my-results"],
    queryFn: getMyResults,
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">My Results</h1>
      <p className="text-muted-foreground">Only published results are shown.</p>

      {isLoading && <p className="text-sm text-muted-foreground">Loading…</p>}
      {!isLoading && data?.length === 0 && (
        <Card>
          <CardContent className="py-10 text-center text-muted-foreground">
            No published results yet.
          </CardContent>
        </Card>
      )}

      {data?.map((exam) => (
        <Card key={exam.exam_id}>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg">{exam.exam}</CardTitle>
              <CardDescription>
                Total {exam.obtained} / {exam.full}
              </CardDescription>
            </div>
            {exam.percentage != null && (
              <Badge variant={exam.percentage >= 40 ? "success" : "destructive"}>
                {exam.percentage}%
              </Badge>
            )}
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Subject</TableHead>
                  <TableHead>Marks</TableHead>
                  <TableHead>Full</TableHead>
                  <TableHead>Result</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {exam.subjects.map((s) => {
                  const passed =
                    !s.is_absent &&
                    s.marks_obtained != null &&
                    s.marks_obtained >= s.pass_marks;
                  return (
                    <TableRow key={s.subject}>
                      <TableCell className="font-medium">{s.subject}</TableCell>
                      <TableCell>{s.is_absent ? "Absent" : s.marks_obtained ?? "—"}</TableCell>
                      <TableCell>{s.full_marks}</TableCell>
                      <TableCell>
                        <Badge variant={passed ? "success" : "destructive"}>
                          {s.is_absent ? "Absent" : passed ? "Pass" : "Fail"}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
