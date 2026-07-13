import { Check, ChevronDown } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { cn } from "@/lib/utils";

export interface PremiumSelectOption {
  value: string;
  label: string;
}

type MenuState = "closed" | "open" | "closing";

/**
 * Fully custom single-select dropdown — never a native <select>, so the open
 * menu never falls back to raw OS chrome. Solid surface in both themes,
 * keyboard accessible (arrow keys, Enter, Escape), closes on outside click.
 */
export function PremiumSelect({
  value,
  onChange,
  options,
  placeholder = "Select…",
  className,
}: {
  value: string;
  onChange: (value: string) => void;
  options: PremiumSelectOption[];
  placeholder?: string;
  className?: string;
}) {
  const [state, setState] = useState<MenuState>("closed");
  const [highlighted, setHighlighted] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const selected = options.find((o) => o.value === value);

  useEffect(() => {
    if (state !== "closing") return;
    const id = window.setTimeout(() => setState("closed"), 150);
    return () => window.clearTimeout(id);
  }, [state]);

  useEffect(() => {
    if (state === "closed") return;
    function onPointerDown(e: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setState("closing");
    }
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        e.stopPropagation();
        setState("closing");
        triggerRef.current?.focus();
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        setHighlighted((h) => Math.min(h + 1, options.length - 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setHighlighted((h) => Math.max(h - 1, 0));
      } else if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        const opt = options[highlighted];
        if (opt) {
          onChange(opt.value);
          setState("closing");
          triggerRef.current?.focus();
        }
      }
    }
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [state, highlighted, options, onChange]);

  function toggle() {
    if (state === "open") {
      setState("closing");
      return;
    }
    const idx = options.findIndex((o) => o.value === value);
    setHighlighted(idx >= 0 ? idx : 0);
    setState("open");
  }

  return (
    <div ref={rootRef} className={cn("relative", className)}>
      <button
        ref={triggerRef}
        type="button"
        onClick={toggle}
        aria-haspopup="listbox"
        aria-expanded={state === "open"}
        className={cn(
          "flex h-11 w-full items-center justify-between gap-2 rounded-xl px-3.5 text-[13px] font-medium",
          "border border-neutral-200 bg-white text-foreground shadow-sm transition-colors",
          "hover:bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-ring",
          "dark:border-neutral-800 dark:bg-neutral-950 dark:hover:bg-neutral-900",
        )}
      >
        <span className="truncate">{selected?.label ?? placeholder}</span>
        <ChevronDown
          className={cn(
            "h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200",
            state === "open" && "rotate-180",
          )}
        />
      </button>

      {state !== "closed" && (
        <div
          role="listbox"
          data-origin="top-left"
          className={cn(
            "t-dropdown t-menu-surface absolute left-0 top-[calc(100%+6px)] z-50 max-h-64 w-full min-w-[11rem] overflow-y-auto rounded-xl p-1.5",
            state === "open" && "is-open",
            state === "closing" && "is-closing",
          )}
        >
          {options.map((opt, i) => (
            <button
              key={opt.value}
              type="button"
              role="option"
              aria-selected={opt.value === value}
              onMouseEnter={() => setHighlighted(i)}
              onClick={() => {
                onChange(opt.value);
                setState("closing");
                triggerRef.current?.focus();
              }}
              className={cn(
                "flex w-full items-center justify-between gap-2 rounded-lg px-2.5 py-2 text-left text-[13px] transition-colors",
                i === highlighted ? "bg-accent/70 text-foreground" : "text-foreground/85",
              )}
            >
              <span className="truncate">{opt.label}</span>
              {opt.value === value && <Check className="h-3.5 w-3.5 shrink-0 text-primary" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
