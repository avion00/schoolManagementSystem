import { cn } from "@/lib/utils";

/**
 * Animated notification dot badge using the t-badge-dot CSS animation
 * (diagonal slide-in + spring pop from transitions.css).
 *
 * Parent element must be position:relative.
 *
 * Usage:
 *   <button className="relative">
 *     <Bell className="h-4 w-4" />
 *     <NotificationBadge show={hasUnread} />
 *   </button>
 */
export function NotificationBadge({
  show = true,
  className,
}: {
  show?: boolean;
  className?: string;
}) {
  if (!show) return null;
  return (
    <span
      aria-hidden="true"
      className={cn(
        "t-badge-dot pointer-events-none",
        "absolute right-1.5 top-1.5",
        "h-[7px] w-[7px] rounded-full",
        "bg-primary ring-1 ring-card",
        className,
      )}
    />
  );
}
