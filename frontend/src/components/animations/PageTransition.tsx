import { type ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Wraps page content with a smooth fade+rise+deblur enter animation on mount.
 * Use with React's key prop on route changes:
 *   <PageTransition key={location.pathname}>
 *     <Outlet />
 *   </PageTransition>
 * The key causes unmount/remount, firing the .t-page CSS animation fresh each time.
 */
export function PageTransition({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("t-page", className)}>
      {children}
    </div>
  );
}
