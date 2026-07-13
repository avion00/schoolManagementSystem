interface TooltipPayloadItem {
  dataKey?: string;
  name?: string;
  value: number;
  color?: string;
  fill?: string;
}

/** Shared Recharts tooltip content — solid surface, dot-per-series, formatted value. */
export function ChartTooltip({
  active,
  label,
  payload,
  valueFormatter = (v: number) => v.toLocaleString(),
}: {
  active?: boolean;
  label?: string;
  payload?: TooltipPayloadItem[];
  valueFormatter?: (value: number) => string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="t-menu-surface t-tooltip rounded-lg px-3 py-2 text-xs">
      {label && <p className="mb-1.5 font-semibold text-foreground">{label}</p>}
      {payload.map((p, i) => (
        <p key={p.dataKey ?? i} className="flex items-center gap-1.5 py-0.5">
          <span className="inline-block h-2 w-2 shrink-0 rounded-full" style={{ background: p.color ?? p.fill }} />
          <span className="capitalize text-muted-foreground">{p.name ?? p.dataKey}:</span>
          <span className="font-semibold text-foreground">{valueFormatter(p.value)}</span>
        </p>
      ))}
    </div>
  );
}
