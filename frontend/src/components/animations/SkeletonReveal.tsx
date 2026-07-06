import { type ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Shows a skeleton placeholder while loading, then cross-fades to real content.
 * The skeleton pulses gently (.t-skeleton-pulse); on load the content enters
 * with a subtle fade+rise (.t-content-in).
 *
 * Usage:
 *   <SkeletonReveal
 *     loading={isLoading}
 *     skeleton={<Skeleton className="h-40 w-full" />}
 *   >
 *     <MyContent />
 *   </SkeletonReveal>
 */
export function SkeletonReveal({
  loading,
  skeleton,
  children,
  className,
}: {
  loading: boolean;
  skeleton: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  if (loading) {
    return (
      <div className={cn("t-skeleton-pulse", className)}>
        {skeleton}
      </div>
    );
  }
  return (
    <div className={cn("t-content-in", className)}>
      {children}
    </div>
  );
}
