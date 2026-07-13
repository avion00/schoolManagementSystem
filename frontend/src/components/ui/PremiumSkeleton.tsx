import { cn } from "@/lib/utils";

/** Skeleton placeholder using the shared t-skeleton-pulse breathing animation
 *  (gentler than Tailwind's default animate-pulse) — for table/card/detail loading. */
export function PremiumSkeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("t-skeleton-pulse rounded-md bg-muted", className)} {...props} />;
}
