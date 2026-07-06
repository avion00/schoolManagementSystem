import { AlertCircle, CheckCircle2, CreditCard, DollarSign, FileText, Receipt } from "lucide-react";

import { PopNumber, Reveal, TiltCard } from "@/components/motion";
import { Badge, type BadgeProps } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import { useAuth } from "@/lib/auth";
import { cn } from "@/lib/utils";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip as RTooltip,
  XAxis,
  YAxis,
} from "recharts";

/* ── Static mock data ────────────────────────────────────────────────────── */

const accountantStats = [
  {
    id: "today",
    label: "Today's Collections",
    value: "$2,500",
    sub: "3 payments received",
    icon: DollarSign,
    iconCls: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  },
  {
    id: "monthly",
    label: "Monthly Revenue",
    value: "$12,000",
    sub: "Jul 2026 · target $15,000",
    icon: CreditCard,
    iconCls: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  },
  {
    id: "outstanding",
    label: "Outstanding Dues",
    value: "$17,600",
    sub: "Across 28 students",
    icon: AlertCircle,
    iconCls: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  },
  {
    id: "invoices",
    label: "Pending Invoices",
    value: "28",
    sub: "Require follow-up",
    icon: Receipt,
    iconCls: "bg-rose-500/10 text-rose-600 dark:text-rose-400",
  },
];

const collectionData = [
  { month: "Jan", collected: 8500, pending: 1500 },
  { month: "Feb", collected: 9200, pending: 1800 },
  { month: "Mar", collected: 10100, pending: 900  },
  { month: "Apr", collected: 9800, pending: 2200  },
  { month: "May", collected: 11200, pending: 800  },
  { month: "Jun", collected: 10800, pending: 1200 },
  { month: "Jul", collected: 12000, pending: 3000 },
];

const recentPayments = [
  { student: "Liam Smith",    invoice: "INV-2026-001", amount: "$2,500", date: "Jul 1, 2026",  status: "paid"    },
  { student: "Olivia Garcia", invoice: "INV-2026-002", amount: "$1,800", date: "Jun 30, 2026", status: "paid"    },
  { student: "Noah Smith",    invoice: "INV-2026-003", amount: "$2,500", date: "Jun 30, 2026", status: "partial" },
  { student: "Emma Brown",    invoice: "INV-2026-004", amount: "$1,800", date: "Jun 28, 2026", status: "paid"    },
  { student: "Aiden Lee",     invoice: "INV-2026-005", amount: "$2,500", date: "Jun 28, 2026", status: "overdue" },
];

const overdueStudents = [
  { student: "Aiden Lee",   class: "Grade 8-B", due: "$2,500", days: 35 },
  { student: "Zoe Martinez", class: "Grade 9-A", due: "$1,800", days: 28 },
  { student: "Lucas Brown",  class: "Grade 8-A", due: "$2,500", days: 21 },
  { student: "Mia Wilson",   class: "Grade 10",  due: "$2,000", days: 14 },
];

/* ── Helpers ─────────────────────────────────────────────────────────────── */

function paymentVariant(status: string): BadgeProps["variant"] {
  if (status === "paid") return "success";
  if (status === "partial") return "warning";
  if (status === "overdue") return "destructive";
  return "secondary";
}

interface TipProps {
  active?: boolean;
  label?: string;
  payload?: { dataKey: string; value: number; fill: string }[];
}

function ChartTip({ active, label, payload }: TipProps) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border bg-popover px-3 py-2 text-xs shadow-md">
      <p className="mb-1 font-semibold">{label}</p>
      {payload.map((p) => (
        <p key={p.dataKey} className="flex items-center gap-1.5">
          <span className="inline-block h-2 w-2 rounded-full" style={{ background: p.fill }} />
          <span className="capitalize text-muted-foreground">{p.dataKey}:</span>
          <span className="font-semibold">${p.value.toLocaleString()}</span>
        </p>
      ))}
    </div>
  );
}

/* ── Page ────────────────────────────────────────────────────────────────── */

export function AccountantDashboardPage() {
  const { user } = useAuth();
  const firstName = user?.full_name?.split(" ")[0] ?? "Accountant";

  return (
    <div className="space-y-4">
      {/* Greeting */}
      <Reveal>
        <div className="pb-1">
          <p className="text-base font-semibold tracking-tight text-foreground">
            Good morning, {firstName}
          </p>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Accounts Department · Greenwood High · Jul 1, 2026
          </p>
        </div>
      </Reveal>

      {/* Row 1 — stat cards */}
      <Reveal delay={60} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {accountantStats.map((stat) => {
          const Icon = stat.icon;
          return (
            <TiltCard key={stat.id} className="h-full">
              <Card className="h-full transition-shadow hover:shadow-md">
                <CardContent className="flex flex-col gap-3 p-5">
                  <span
                    className={cn(
                      "flex h-11 w-11 items-center justify-center rounded-xl",
                      stat.iconCls,
                    )}
                  >
                    <Icon className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="text-2xl font-bold tabular-nums text-foreground lg:text-3xl">
                      <PopNumber value={stat.value} />
                    </p>
                    <p className="mt-0.5 text-sm font-medium text-foreground">{stat.label}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">{stat.sub}</p>
                  </div>
                </CardContent>
              </Card>
            </TiltCard>
          );
        })}
      </Reveal>

      {/* Row 2 — collection chart + fee health */}
      <Reveal delay={120} className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Monthly Collections vs Pending</CardTitle>
            <CardDescription>Jan – Jul 2026 overview.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={collectionData}
                  barCategoryGap="30%"
                  barGap={2}
                  margin={{ left: -12, right: 4, top: 4 }}
                >
                  <CartesianGrid
                    vertical={false}
                    stroke="hsl(var(--border))"
                    strokeDasharray="3 3"
                  />
                  <XAxis
                    dataKey="month"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    tick={{ fontSize: 12 }}
                    stroke="hsl(var(--muted-foreground))"
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    tick={{ fontSize: 12 }}
                    stroke="hsl(var(--muted-foreground))"
                    width={42}
                    tickFormatter={(v: number) => `$${(v / 1000).toFixed(0)}k`}
                  />
                  <RTooltip
                    cursor={{ fill: "hsl(var(--muted))" }}
                    content={<ChartTip />}
                  />
                  <Bar
                    dataKey="collected"
                    fill="hsl(var(--primary))"
                    radius={[4, 4, 0, 0]}
                    maxBarSize={20}
                  />
                  <Bar
                    dataKey="pending"
                    fill="#f59e0b"
                    radius={[4, 4, 0, 0]}
                    maxBarSize={20}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-3 flex items-center gap-5 text-xs">
              <div className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-primary" />
                <span className="text-muted-foreground">Collected</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-amber-500" />
                <span className="text-muted-foreground">Pending</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Fee health */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Fee Health</CardTitle>
            <CardDescription>Outstanding balance summary.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-3 py-4 text-center">
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-amber-500/10">
              <AlertCircle className="h-7 w-7 text-amber-600 dark:text-amber-400" />
            </span>
            <div>
              <p className="text-3xl font-bold tabular-nums text-foreground">
                <PopNumber value="$17,600" />
              </p>
              <p className="mt-0.5 text-sm text-muted-foreground">Outstanding dues</p>
            </div>
            <div className="w-full space-y-1.5 rounded-lg bg-muted/40 p-3 text-left">
              {[
                { label: "0–30 days",  amount: "$8,200",  cls: "text-amber-600 dark:text-amber-400"  },
                { label: "31–60 days", amount: "$6,400",  cls: "text-orange-600 dark:text-orange-400" },
                { label: "60+ days",   amount: "$3,000",  cls: "text-rose-600 dark:text-rose-400"    },
              ].map((b) => (
                <div key={b.label} className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">{b.label}</span>
                  <span className={cn("font-semibold", b.cls)}>{b.amount}</span>
                </div>
              ))}
            </div>
            <Button variant="outline" size="sm" className="w-full">
              Review overdue invoices
            </Button>
          </CardContent>
        </Card>
      </Reveal>

      {/* Row 3 — recent payments + overdue students */}
      <Reveal delay={180} className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Recent Payments</CardTitle>
            <CardDescription>Latest fee transactions.</CardDescription>
          </CardHeader>
          <CardContent className="px-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="pl-6">Student</TableHead>
                  <TableHead>Invoice</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead className="pr-6 text-right">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentPayments.map((p) => (
                  <TableRow key={p.invoice}>
                    <TableCell className="pl-6 font-medium">{p.student}</TableCell>
                    <TableCell className="font-mono text-xs text-muted-foreground">
                      {p.invoice}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">{p.amount}</TableCell>
                    <TableCell className="pr-6 text-right">
                      <Badge variant={paymentVariant(p.status)}>{p.status}</Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Overdue Students</CardTitle>
            <CardDescription>Most urgent outstanding balances.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {overdueStudents.map((s) => (
              <div
                key={s.student}
                className="flex items-center gap-3 rounded-lg border border-border/50 p-2.5"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-rose-500/10">
                  <FileText className="h-4 w-4 text-rose-600 dark:text-rose-400" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{s.student}</p>
                  <p className="text-xs text-muted-foreground">{s.class}</p>
                </div>
                <div className="shrink-0 text-right">
                  <p className="text-sm font-semibold text-rose-600 dark:text-rose-400">
                    {s.due}
                  </p>
                  <p className="text-[11px] text-muted-foreground">{s.days}d overdue</p>
                </div>
              </div>
            ))}

            {/* Summary row */}
            <div className="flex items-center gap-2 rounded-lg bg-emerald-500/10 px-3 py-2">
              <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
              <p className="text-xs font-medium text-emerald-700 dark:text-emerald-400">
                56 students are fully paid-up this month.
              </p>
            </div>
          </CardContent>
        </Card>
      </Reveal>
    </div>
  );
}
