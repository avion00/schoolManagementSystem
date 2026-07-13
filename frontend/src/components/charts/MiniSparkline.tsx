import { Line, LineChart, ResponsiveContainer } from "recharts";

import { STATUS_COLORS } from "@/components/charts/palette";

/** Compact axis-less trend line for inline use inside a stat tile/card. */
export function MiniSparkline({
  data,
  dataKey = "value",
  color = STATUS_COLORS.good,
  height = 32,
  width = 80,
}: {
  data: Record<string, number>[];
  dataKey?: string;
  color?: string;
  height?: number;
  width?: number;
}) {
  return (
    <div style={{ width, height }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 2, bottom: 2, left: 2, right: 2 }}>
          <Line dataKey={dataKey} type="monotone" stroke={color} strokeWidth={2} dot={false} isAnimationActive />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
