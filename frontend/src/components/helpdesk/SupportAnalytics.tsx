import { useMemo } from "react";
import {
  Bar, BarChart, CartesianGrid, Cell, Line, LineChart, ResponsiveContainer,
  Tooltip as RTooltip, XAxis, YAxis,
} from "recharts";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  CATEGORY_OPTIONS, PRIORITY_OPTIONS, ROLE_OPTIONS, STATUS_OPTIONS, type SupportTicket,
} from "@/data/helpDeskData";

const PRIORITY_COLOR: Record<string, string> = { Low: "#94a3b8", Normal: "#2a78d6", High: "#eda100", Urgent: "#e34948" };
const STATUS_COLOR: Record<string, string> = {
  New: "#2a78d6", Open: "#0ea5e9", Assigned: "#6366f1", "In Progress": "#a855f7",
  "Waiting for User": "#eda100", "Waiting for Department": "#eda100", Escalated: "#e34948",
  Resolved: "#1baf7a", Closed: "#94a3b8", Reopened: "#eb6834",
};
const SERIES_BLUE = "#2a78d6";

function ChartTip({ active, label, payload }: { active?: boolean; label?: string; payload?: { value: number; payload: { fill?: string } }[] }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border bg-popover px-3 py-2 text-xs shadow-md">
      <p className="font-semibold">{label}</p>
      <p className="text-muted-foreground">{payload[0].value} ticket{payload[0].value === 1 ? "" : "s"}</p>
    </div>
  );
}

function HorizontalBarCard({
  title, data,
}: {
  title: string;
  data: { name: string; value: number; fill: string }[];
}) {
  const height = Math.max(140, data.length * 28);
  return (
    <Card className="rounded-2xl border-border/60 shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-[13px] font-semibold">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div style={{ height }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} layout="vertical" margin={{ left: 8, right: 16, top: 0, bottom: 0 }} barCategoryGap="22%">
              <CartesianGrid horizontal={false} stroke="hsl(var(--border))" strokeDasharray="3 3" />
              <XAxis type="number" hide />
              <YAxis
                type="category" dataKey="name" tickLine={false} axisLine={false}
                width={110} tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))"
              />
              <RTooltip cursor={{ fill: "hsl(var(--muted))" }} content={<ChartTip />} />
              <Bar dataKey="value" radius={[0, 4, 4, 0]} maxBarSize={14}>
                {data.map((d) => <Cell key={d.name} fill={d.fill} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

function TrendCard({ title, data, dataKey, formatValue }: {
  title: string; data: { day: string; value: number }[]; dataKey: string; formatValue: (v: number) => string;
}) {
  return (
    <Card className="rounded-2xl border-border/60 shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-[13px] font-semibold">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-44">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ left: -20, right: 8, top: 4, bottom: 0 }}>
              <CartesianGrid vertical={false} stroke="hsl(var(--border))" strokeDasharray="3 3" />
              <XAxis dataKey="day" tickLine={false} axisLine={false} tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
              <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" width={40} />
              <RTooltip
                cursor={{ stroke: "hsl(var(--muted-foreground))", strokeDasharray: "3 3" }}
                content={({ active, label, payload }) =>
                  active && payload?.length ? (
                    <div className="rounded-lg border bg-popover px-3 py-2 text-xs shadow-md">
                      <p className="font-semibold">{label}</p>
                      <p className="text-muted-foreground">{formatValue(payload[0].value as number)}</p>
                    </div>
                  ) : null
                }
              />
              <Line type="monotone" dataKey={dataKey} stroke={SERIES_BLUE} strokeWidth={2} dot={{ r: 3, fill: SERIES_BLUE }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

export function SupportAnalytics({ tickets }: { tickets: SupportTicket[] }) {
  const byCategory = useMemo(() =>
    CATEGORY_OPTIONS
      .map((c) => ({ name: c, value: tickets.filter((t) => t.category === c).length, fill: SERIES_BLUE }))
      .filter((d) => d.value > 0)
      .sort((a, b) => b.value - a.value),
  [tickets]);

  const byPriority = useMemo(() =>
    PRIORITY_OPTIONS.map((p) => ({ name: p, value: tickets.filter((t) => t.priority === p).length, fill: PRIORITY_COLOR[p] })),
  [tickets]);

  const byStatus = useMemo(() =>
    STATUS_OPTIONS
      .map((s) => ({ name: s, value: tickets.filter((t) => t.status === s).length, fill: STATUS_COLOR[s] }))
      .filter((d) => d.value > 0),
  [tickets]);

  const byRole = useMemo(() =>
    ROLE_OPTIONS
      .map((r) => ({ name: r, value: tickets.filter((t) => t.requester.role === r).length, fill: SERIES_BLUE }))
      .filter((d) => d.value > 0)
      .sort((a, b) => b.value - a.value),
  [tickets]);

  const trendDays = useMemo(() => {
    const days = Array.from({ length: 14 }, (_, i) => 13 - i);
    return days.map((daysAgo) => {
      const dayStart = new Date(); dayStart.setHours(0, 0, 0, 0); dayStart.setDate(dayStart.getDate() - daysAgo);
      const dayEnd = new Date(dayStart); dayEnd.setDate(dayEnd.getDate() + 1);
      const label = dayStart.toLocaleDateString(undefined, { month: "short", day: "numeric" });

      const resolvedCount = tickets.filter((t) => {
        if (t.status !== "Resolved" && t.status !== "Closed") return false;
        const u = new Date(t.updatedAt).getTime();
        return u >= dayStart.getTime() && u < dayEnd.getTime();
      }).length;

      const createdThatDay = tickets.filter((t) => {
        const c = new Date(t.createdAt).getTime();
        return c >= dayStart.getTime() && c < dayEnd.getTime() && t.messages.length > 1;
      });
      const avgResponseHours = createdThatDay.length
        ? createdThatDay.reduce((sum, t) => sum + (new Date(t.messages[1].timestamp).getTime() - new Date(t.createdAt).getTime()), 0)
          / createdThatDay.length / 3600_000
        : 0;

      return { day: label, resolved: resolvedCount, responseHours: Math.round(avgResponseHours * 10) / 10 };
    });
  }, [tickets]);

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
        <HorizontalBarCard title="Tickets by Category" data={byCategory} />
        <HorizontalBarCard title="Tickets by Requester Role" data={byRole} />
        <HorizontalBarCard title="Tickets by Priority" data={byPriority} />
        <HorizontalBarCard title="Tickets by Status" data={byStatus} />
      </div>
      <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
        <TrendCard title="Resolution Trend — last 14 days" data={trendDays.map((d) => ({ day: d.day, value: d.resolved }))} dataKey="value"
          formatValue={(v) => `${v} resolved`} />
        <TrendCard title="Response Time Trend — last 14 days" data={trendDays.map((d) => ({ day: d.day, value: d.responseHours }))} dataKey="value"
          formatValue={(v) => `${v}h avg. first response`} />
      </div>
    </div>
  );
}
