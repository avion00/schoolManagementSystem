import { useEffect, useRef, type ComponentType } from "react";
import { cn } from "@/lib/utils";

/**
 * Wraps a Lucide-style icon component and plays a scale+rotate+blur enter
 * animation each time the icon reference changes (e.g. Sun → Moon → Monitor).
 *
 * Usage:
 *   <IconSwap icon={theme === "dark" ? Moon : Sun} iconClassName="h-4 w-4" />
 */
export function IconSwap({
  icon: Icon,
  className,
  iconClassName,
}: {
  icon: ComponentType<{ className?: string }>;
  className?: string;
  iconClassName?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const prevKey = useRef<string>("");
  const key = Icon.displayName ?? Icon.name ?? "";

  useEffect(() => {
    if (prevKey.current !== "" && prevKey.current !== key) {
      const el = ref.current;
      if (!el) return;
      el.classList.remove("t-icon-enter");
      void el.offsetHeight; // force reflow so animation re-fires
      el.classList.add("t-icon-enter");
    }
    prevKey.current = key;
  }, [key]);

  return (
    <span
      ref={ref}
      className={cn("inline-flex items-center justify-center t-icon-enter", className)}
    >
      <Icon className={iconClassName} />
    </span>
  );
}
