import { LineChartCard } from "@/components/charts/LineChartCard";
import { STATUS_COLORS } from "@/components/charts/palette";

export interface AttendanceTrendPoint {
  label: string;
  present: number;
  absent?: number;
}

/** Attendance rate over time — preset on LineChartCard. Pass `absent` too for a two-line comparison. */
export function AttendanceTrendChart({
  data,
  title = "Attendance Trend",
  subtitle,
  valueFormatter = (v) => `${v}%`,
}: {
  data: AttendanceTrendPoint[];
  title?: string;
  subtitle?: string;
  valueFormatter?: (v: number) => string;
}) {
  const hasAbsent = data.some((d) => d.absent !== undefined);
  return (
    <LineChartCard
      title={title}
      subtitle={subtitle}
      data={data}
      xKey="label"
      valueFormatter={valueFormatter}
      series={[
        { key: "present", label: "Present", color: STATUS_COLORS.good },
        ...(hasAbsent ? [{ key: "absent", label: "Absent", color: STATUS_COLORS.critical }] : []),
      ]}
    />
  );
}
