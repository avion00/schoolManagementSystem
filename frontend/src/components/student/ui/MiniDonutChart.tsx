export interface MiniDonutSegment {
  value: number;
  color: string;
}

/** Lightweight pure-SVG donut (no chart library) for a small sidebar composition widget. */
export function MiniDonutChart({
  segments,
  centerValue,
  centerLabel,
  size = 132,
  strokeWidth = 18,
}: {
  segments: MiniDonutSegment[];
  centerValue: number | string;
  centerLabel?: string;
  size?: number;
  strokeWidth?: number;
}) {
  const total = segments.reduce((s, x) => s + x.value, 0) || 1;
  const r = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * r;
  let acc = 0;

  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        {segments.map((seg, i) => {
          const frac = seg.value / total;
          const dash = frac * circumference;
          const offset = -acc;
          acc += dash;
          return (
            <circle
              key={i}
              cx={size / 2}
              cy={size / 2}
              r={r}
              fill="none"
              stroke={seg.color}
              strokeWidth={strokeWidth}
              strokeDasharray={`${dash} ${circumference - dash}`}
              strokeDashoffset={offset}
            />
          );
        })}
      </svg>
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-display text-xl font-bold text-foreground">{centerValue}</span>
        {centerLabel && <span className="text-[10px] text-muted-foreground">{centerLabel}</span>}
      </div>
    </div>
  );
}
