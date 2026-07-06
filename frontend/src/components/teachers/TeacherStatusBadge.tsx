import type { TeacherStatus } from "@/data/teachersData";

const CONFIG: Record<TeacherStatus, { label: string; ring: string; dot: string; text: string }> = {
  "active":   { label: "Active",   ring: "ring-emerald-500/30", dot: "bg-emerald-500", text: "text-emerald-700 dark:text-emerald-400" },
  "on leave": { label: "On Leave", ring: "ring-amber-500/30",   dot: "bg-amber-500",   text: "text-amber-700 dark:text-amber-400"     },
  "inactive": { label: "Inactive", ring: "ring-muted-foreground/30", dot: "bg-muted-foreground", text: "text-muted-foreground" },
  "resigned": { label: "Resigned", ring: "ring-rose-500/30",   dot: "bg-rose-500",   text: "text-rose-700 dark:text-rose-400"       },
};

export function TeacherStatusBadge({ status }: { status: TeacherStatus }) {
  const c = CONFIG[status];
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ring-1 ring-inset ${c.ring} ${c.text}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${c.dot}`} />
      {c.label}
    </span>
  );
}
