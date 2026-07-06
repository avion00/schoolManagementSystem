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
import { getMyFees } from "@/lib/portal";

function statusVariant(status: string): BadgeProps["variant"] {
  if (status === "paid") return "success";
  if (status === "partial") return "warning";
  if (status === "overdue") return "destructive";
  return "secondary";
}

export function StudentFeesPage() {
  const { data, isLoading } = useQuery({ queryKey: ["my-fees"], queryFn: getMyFees });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">My Fees</h1>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-2"><CardDescription>Billed</CardDescription></CardHeader>
          <CardContent><div className="text-2xl font-bold">{data?.summary.billed ?? 0}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardDescription>Paid</CardDescription></CardHeader>
          <CardContent><div className="text-2xl font-bold">{data?.summary.paid ?? 0}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardDescription>Outstanding</CardDescription></CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">
              {data?.summary.outstanding ?? 0}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Invoice</TableHead>
              <TableHead>Issued</TableHead>
              <TableHead>Due</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Paid</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {!isLoading && data?.invoices.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                  No invoices.
                </TableCell>
              </TableRow>
            )}
            {data?.invoices.map((inv) => (
              <TableRow key={inv.id}>
                <TableCell className="font-mono text-xs">{inv.number}</TableCell>
                <TableCell>{inv.issue_date}</TableCell>
                <TableCell>{inv.due_date ?? "—"}</TableCell>
                <TableCell>{inv.total_amount}</TableCell>
                <TableCell>{inv.paid_amount}</TableCell>
                <TableCell>
                  <Badge variant={statusVariant(inv.status)}>{inv.status}</Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
