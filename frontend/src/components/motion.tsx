import {
  useEffect,
  useLayoutEffect,
  useRef,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from "react";

import { cn } from "@/lib/utils";

/**
 * Block reveal — fades + rises + de-blurs into place on mount.
 * (transitions.dev "texts reveal", generalized to any block.)
 */
export function Reveal({
  children,
  delay = 0,
  className,
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.classList.remove("is-shown");
    void el.offsetHeight; // reflow so the transition replays
    const id = window.setTimeout(() => el.classList.add("is-shown"), 10);
    return () => window.clearTimeout(id);
  }, []);
  return (
    <div ref={ref} className={cn("t-reveal", className)} style={{ transitionDelay: `${delay}ms` }}>
      {children}
    </div>
  );
}

/**
 * Number pop-in — each character re-enters with a blurred slide; the last two
 * stagger. Re-animates whenever the value changes. (transitions.dev "number pop-in".)
 */
export function PopNumber({
  value,
  className,
}: {
  value: string | number;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const str = String(value);
  useEffect(() => {
    const group = ref.current;
    if (!group) return;
    group.classList.remove("is-animating");
    void group.offsetHeight;
    group.classList.add("is-animating");
  }, [str]);
  const chars = str.split("");
  return (
    <span ref={ref} className={cn("t-digit-group is-animating", className)}>
      {chars.map((ch, i) => (
        <span
          key={`${i}-${ch}`}
          className="t-digit"
          data-stagger={
            i === chars.length - 2 ? "1" : i === chars.length - 1 ? "2" : undefined
          }
        >
          {ch}
        </span>
      ))}
    </span>
  );
}

export interface SlidingTabOption {
  value: string;
  label: string;
}

/** Segmented control whose active pill slides between options. (transitions.dev "tabs sliding".) */
export function SlidingTabs({
  value,
  onValueChange,
  options,
  className,
}: {
  value: string;
  onValueChange: (v: string) => void;
  options: SlidingTabOption[];
  className?: string;
}) {
  const pillRef = useRef<HTMLSpanElement>(null);
  const btnRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  const move = (animate: boolean) => {
    const btn = btnRefs.current[value];
    const pill = pillRef.current;
    if (!btn || !pill) return;
    if (!animate) {
      const prev = pill.style.transition;
      pill.style.transition = "none";
      pill.style.transform = `translateX(${btn.offsetLeft}px)`;
      pill.style.width = `${btn.offsetWidth}px`;
      void pill.offsetWidth;
      pill.style.transition = prev;
    } else {
      pill.style.transform = `translateX(${btn.offsetLeft}px)`;
      pill.style.width = `${btn.offsetWidth}px`;
    }
  };

  useLayoutEffect(() => {
    move(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useEffect(() => {
    move(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);
  useEffect(() => {
    const onResize = () => move(false);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className={cn("t-tabs text-sm font-medium", className)} role="tablist">
      <span ref={pillRef} className="t-tabs-pill" aria-hidden="true" />
      {options.map((o) => (
        <button
          key={o.value}
          ref={(el) => {
            btnRefs.current[o.value] = el;
          }}
          role="tab"
          type="button"
          aria-selected={value === o.value}
          className="t-tab"
          onClick={() => onValueChange(o.value)}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

/** Animated success check — circle draw + check stroke + pop/blur. (transitions.dev "success check".) */
export function SuccessCheck({ size = 56, label }: { size?: number; label?: string }) {
  return (
    <div className="flex flex-col items-center gap-3">
      <span className="t-success-check">
        <svg viewBox="0 0 52 52" width={size} height={size} aria-hidden="true">
          <circle className="t-check-circle" cx="26" cy="26" r="24" />
          <path className="t-check-path" d="M14 27 l8 8 l16 -18" />
        </svg>
      </span>
      {label && <p className="text-sm font-medium">{label}</p>}
    </div>
  );
}

/** Pointer-tracked 3D tilt for cards. (transitions.dev "card hover tilt".) */
export function TiltCard({
  children,
  className,
  max = 6,
}: {
  children: ReactNode;
  className?: string;
  max?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);

  const onMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    el.style.setProperty("--rx", `${(-py * max).toFixed(2)}deg`);
    el.style.setProperty("--ry", `${(px * max).toFixed(2)}deg`);
    el.classList.add("is-tilting");
  };
  const onLeave = () => {
    const el = ref.current;
    if (!el) return;
    el.classList.remove("is-tilting");
    el.style.setProperty("--rx", "0deg");
    el.style.setProperty("--ry", "0deg");
  };

  return (
    <div
      ref={ref}
      className={cn("t-tilt", className)}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
    >
      {children}
    </div>
  );
}
