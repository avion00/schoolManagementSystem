import { useId } from "react";
import { Area, AreaChart, ResponsiveContainer } from "recharts";

import { STATUS_COLORS } from "@/components/charts/palette";

/** Compact axis-less trend area for inline use inside a stat tile/card. */
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
  width?: number | string;
}) {
  const gradientId = `sparkline-fill-${useId()}`;
  return (
    <div style={{ width, height }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 2, bottom: 2, left: 2, right: 2 }}>
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.35} />
              <stop offset="100%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <Area
            dataKey={dataKey}
            type="monotone"
            stroke={color}
            strokeWidth={2}
            fill={`url(#${gradientId})`}
            dot={false}
            isAnimationActive
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
