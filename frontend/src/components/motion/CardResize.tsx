import { useEffect, useRef, useState, type ReactNode } from "react";

import { cn } from "@/lib/utils";

/**
 * Smoothly animates its own height to match its content's natural height —
 * for cards whose content changes size (expanding a section, filtering a
 * list, revealing extra fields) without a hard cut.
 */
export function CardResize({ children, className }: { children: ReactNode; className?: string }) {
  const innerRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState<number | "auto">("auto");

  useEffect(() => {
    const el = innerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => setHeight(entry.contentRect.height));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return (
    <div className={cn("t-card-resize", className)} style={{ height }}>
      <div ref={innerRef}>{children}</div>
    </div>
  );
}
