import { cn } from "@/lib/utils";

const PALETTE = [
  "bg-blue-500/15 text-blue-700 dark:text-blue-400",
  "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400",
  "bg-violet-500/15 text-violet-700 dark:text-violet-400",
  "bg-amber-500/15 text-amber-700 dark:text-amber-400",
  "bg-rose-500/15 text-rose-700 dark:text-rose-400",
  "bg-sky-500/15 text-sky-700 dark:text-sky-400",
  "bg-pink-500/15 text-pink-700 dark:text-pink-400",
  "bg-teal-500/15 text-teal-700 dark:text-teal-400",
];

function initials(name: string) {
  const parts = name.trim().split(/\s+/);
  const first = parts[0]?.[0] ?? "";
  const last = parts[parts.length - 1]?.[0] ?? "";
  return (first + (parts.length > 1 ? last : "")).toUpperCase();
}

function colorIndex(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return Math.abs(hash) % PALETTE.length;
}

interface StudentAvatarProps {
  name: string;
  src?: string;
  size?: "sm" | "md";
  className?: string;
}

export function StudentAvatar({ name, src, size = "sm", className }: StudentAvatarProps) {
  const dim = size === "sm" ? "h-8 w-8 text-[11px]" : "h-9 w-9 text-xs";
  const palette = PALETTE[colorIndex(name)];

  if (src) {
    return (
      <img
        src={src}
        alt={name}
        className={cn("rounded-full object-cover ring-1 ring-border/60", dim, className)}
      />
    );
  }

  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-full font-semibold ring-1 ring-border/40",
        dim,
        palette,
        className,
      )}
      aria-hidden="true"
    >
      {initials(name)}
    </span>
  );
}
