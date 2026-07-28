import type { ReactNode } from "react";

import { Reveal } from "@/components/motion";
import { cn } from "@/lib/utils";

export type StudentCardTier = "spotlight" | "standard" | "quiet";

const TIER_CLASS: Record<StudentCardTier, string> = {
  spotlight:
    "rounded-3xl border border-primary/15 bg-gradient-to-br from-primary/[0.06] via-card to-violet-500/[0.05] shadow-[0_1px_2px_rgb(15_23_42/0.06),0_16px_36px_-16px_rgb(79_70_229/0.25)] dark:from-primary/[0.09] dark:via-card dark:to-violet-500/[0.07] dark:shadow-[0_1px_2px_rgb(0_0_0/0.4),0_16px_36px_-16px_rgb(99_102_241/0.25)]",
  standard: "rounded-2xl border border-border/60 bg-card shadow-elevated",
  quiet: "rounded-2xl border border-transparent bg-muted/40",
};

/**
 * Tiered card surface — the "not every card is equal" primitive. spotlight =
 * gradient-tinted featured panel with a soft glow shadow; standard = the
 * normal elevated card; quiet = a flat, low-emphasis supporting surface.
 */
export function StudentInsightCard({
  tier = "standard",
  className,
  children,
  reveal = true,
}: {
  tier?: StudentCardTier;
  className?: string;
  children: ReactNode;
  reveal?: boolean;
}) {
  const content = <div className={cn(TIER_CLASS[tier], className)}>{children}</div>;
  return reveal ? <Reveal>{content}</Reveal> : content;
}
