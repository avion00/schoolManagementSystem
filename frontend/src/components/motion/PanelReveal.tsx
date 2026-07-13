import { useEffect, useRef, type ReactNode } from "react";

import { cn } from "@/lib/utils";

/**
 * Slide-in-from-edge reveal for side panels, drawers, and detail rails.
 * Unlike a modal, this assumes the panel is already positioned (fixed/absolute)
 * and just animates its entrance.
 */
export function PanelReveal({
  children,
  side = "right",
  className,
}: {
  children: ReactNode;
  side?: "left" | "right" | "top" | "bottom";
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.classList.remove("is-shown");
    void el.offsetHeight;
    const id = window.setTimeout(() => el.classList.add("is-shown"), 10);
    return () => window.clearTimeout(id);
  }, []);

  return (
    <div ref={ref} data-side={side} className={cn("t-panel", className)}>
      {children}
    </div>
  );
}
