import { useEffect, useLayoutEffect, useRef } from "react";
import { Monitor, Moon, Sun } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useTheme } from "@/lib/theme";
import { cn } from "@/lib/utils";

type ThemeValue = "light" | "dark" | "system";

const OPTIONS: { value: ThemeValue; icon: LucideIcon; label: string }[] = [
  { value: "light",  icon: Sun,     label: "Light"  },
  { value: "dark",   icon: Moon,    label: "Dark"   },
  { value: "system", icon: Monitor, label: "System" },
];

/*
 * Three-icon segmented toggle — pill slides between Sun / Moon / Monitor.
 * Uses the same ref-based translateX mechanic as SlidingTabs in motion.tsx
 * (transitions.dev "tabs sliding"). No external animation library required.
 */
export function AppearanceToggle() {
  const { theme, setTheme } = useTheme();
  const pillRef = useRef<HTMLSpanElement>(null);
  const btnRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const movePill = (animate: boolean) => {
    const idx = OPTIONS.findIndex((o) => o.value === theme);
    const btn = btnRefs.current[idx];
    const pill = pillRef.current;
    if (!btn || !pill) return;

    if (!animate) {
      const prev = pill.style.transition;
      pill.style.transition = "none";
      pill.style.transform = `translateX(${btn.offsetLeft}px)`;
      pill.style.width  = `${btn.offsetWidth}px`;
      void pill.offsetWidth; // force reflow so "none" takes effect
      pill.style.transition = prev;
    } else {
      pill.style.transform = `translateX(${btn.offsetLeft}px)`;
      pill.style.width  = `${btn.offsetWidth}px`;
    }
  };

  // Place pill instantly on first paint — no flash
  useLayoutEffect(() => {
    movePill(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Animate pill whenever theme changes
  useEffect(() => {
    movePill(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [theme]);

  // Re-snap (no animation) when window is resized
  useEffect(() => {
    const snap = () => movePill(false);
    window.addEventListener("resize", snap);
    return () => window.removeEventListener("resize", snap);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [theme]);

  return (
    <div
      role="group"
      aria-label="Appearance"
      /* Outer track — same look as t-tabs but icon-sized */
      className={cn(
        "relative inline-flex items-center rounded-full",
        "h-8 gap-0 p-[3px]",
        "border border-border/60",
        "bg-muted/60",
      )}
    >
      {/* Sliding pill — purely visual, sits behind the icon buttons */}
      <span
        ref={pillRef}
        aria-hidden="true"
        className="pointer-events-none absolute left-0 top-[3px] rounded-full bg-background shadow-sm"
        style={{
          height: "calc(100% - 6px)", // tracks container padding
          transition:
            "transform 250ms cubic-bezier(0.22,1,0.36,1), width 250ms cubic-bezier(0.22,1,0.36,1)",
          willChange: "transform, width",
        }}
      />

      {OPTIONS.map(({ value, icon: Icon, label }, idx) => {
        const isActive = theme === value;
        return (
          <Tooltip key={value}>
            <TooltipTrigger asChild>
              <button
                ref={(el) => { btnRefs.current[idx] = el; }}
                type="button"
                aria-label={label}
                aria-pressed={isActive}
                onClick={() => setTheme(value)}
                className={cn(
                  /* Geometry — square, centered icon */
                  "relative z-10 flex h-[26px] w-[26px] items-center justify-center rounded-full",
                  /* Interaction */
                  "cursor-pointer select-none",
                  "transition-colors duration-150",
                  /* Colors */
                  isActive
                    ? "text-foreground"
                    : "text-muted-foreground/60 hover:text-foreground/80",
                )}
              >
                <Icon
                  className={cn(
                    "transition-[transform,opacity] duration-[250ms] [transition-timing-function:cubic-bezier(0.22,1,0.36,1)]",
                    isActive
                      ? "h-[13px] w-[13px] scale-110 opacity-100"
                      : "h-[13px] w-[13px] scale-95 opacity-70",
                  )}
                />
              </button>
            </TooltipTrigger>
            <TooltipContent
              side="bottom"
              sideOffset={6}
              className="text-[11px] font-medium"
            >
              {label}
            </TooltipContent>
          </Tooltip>
        );
      })}
    </div>
  );
}
