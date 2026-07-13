import * as React from "react";
import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

export interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon: LucideIcon;
  label: string;
  size?: "sm" | "md" | "lg";
  variant?: "ghost" | "outline" | "solid";
}

const SIZE_CLASS = { sm: "h-7 w-7", md: "h-8 w-8", lg: "h-9 w-9" };
const ICON_SIZE_CLASS = { sm: "h-3.5 w-3.5", md: "h-4 w-4", lg: "h-4.5 w-4.5" };
const VARIANT_CLASS = {
  ghost: "text-muted-foreground hover:bg-accent/70 hover:text-foreground",
  outline: "border border-input text-foreground hover:bg-accent/70",
  solid: "bg-primary text-primary-foreground hover:bg-primary/90",
};

export const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(function IconButton(
  { icon: Icon, label, size = "md", variant = "ghost", className, ...props },
  ref,
) {
  return (
    <button
      ref={ref}
      type="button"
      aria-label={label}
      title={label}
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-lg transition-all duration-150 active:scale-95 disabled:pointer-events-none disabled:opacity-40",
        SIZE_CLASS[size],
        VARIANT_CLASS[variant],
        className,
      )}
      {...props}
    >
      <Icon className={ICON_SIZE_CLASS[size]} />
    </button>
  );
});
