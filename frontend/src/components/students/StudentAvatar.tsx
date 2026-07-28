import { cn } from "@/lib/utils";

function initials(name: string) {
  const parts = name.trim().split(/\s+/);
  const first = parts[0]?.[0] ?? "";
  const last = parts[parts.length - 1]?.[0] ?? "";
  return (first + (parts.length > 1 ? last : "")).toUpperCase();
}

interface StudentAvatarProps {
  name: string;
  src?: string;
  size?: "sm" | "md";
  className?: string;
}

export function StudentAvatar({ name, src, size = "sm", className }: StudentAvatarProps) {
  const dim = size === "sm" ? "h-8 w-8 text-[11px]" : "h-9 w-9 text-xs";

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
        "inline-flex shrink-0 items-center justify-center rounded-full bg-secondary font-semibold text-secondary-foreground ring-1 ring-border/40",
        dim,
        className,
      )}
      aria-hidden="true"
    >
      {initials(name)}
    </span>
  );
}
