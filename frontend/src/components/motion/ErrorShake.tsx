import { useEffect, useRef, type ReactNode } from "react";

/**
 * Wraps content that should shake on validation failure. Increment `trigger`
 * (e.g. a failed-submit counter) each time it should replay — changing the
 * value re-fires the animation even if it's already mid-shake.
 */
export function ErrorShake({
  trigger,
  children,
  className,
}: {
  trigger: number;
  children: ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (trigger === 0) return;
    const el = ref.current;
    if (!el) return;
    el.classList.remove("t-shake");
    void el.offsetWidth;
    el.classList.add("t-shake");
  }, [trigger]);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
