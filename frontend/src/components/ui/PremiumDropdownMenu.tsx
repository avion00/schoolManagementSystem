import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

export interface PremiumMenuAction {
  label: string;
  icon?: LucideIcon;
  onClick?: () => void;
  danger?: boolean;
  disabled?: boolean;
}
export type PremiumMenuEntry = PremiumMenuAction | "separator" | { heading: string };

/**
 * The one canonical dropdown menu for the whole app — user profile menu,
 * table row actions, filter menus, column settings, export menus. Built on
 * Radix's DropdownMenu (portal + collision detection + focus trap + escape +
 * outside-click all included, essential inside a scrollable table), styled
 * with a solid surface and the same scale+fade morph feel as the
 * transitions.dev menu-dropdown pattern — driven by Radix's own
 * data-state lifecycle instead of hand-rolled open/closing state.
 */
export function PremiumDropdownMenu({
  trigger,
  items,
  align = "end",
  side = "bottom",
  width = "w-56",
}: {
  trigger: ReactNode;
  items: PremiumMenuEntry[];
  align?: "start" | "end" | "center";
  side?: "top" | "right" | "bottom" | "left";
  width?: string;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>{trigger}</DropdownMenuTrigger>
      <DropdownMenuContent align={align} side={side} className={cn("rounded-xl p-1.5", width)}>
        {items.map((entry, i) => {
          if (entry === "separator") return <DropdownMenuSeparator key={i} />;
          if ("heading" in entry) {
            return (
              <DropdownMenuLabel key={i} className="px-2 py-1.5 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground/70">
                {entry.heading}
              </DropdownMenuLabel>
            );
          }
          const Icon = entry.icon;
          return (
            <DropdownMenuItem
              key={entry.label}
              onClick={entry.onClick}
              disabled={entry.disabled}
              className={cn(
                "flex cursor-pointer items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13px] font-medium",
                entry.danger
                  ? "text-destructive focus:bg-destructive/10 focus:text-destructive"
                  : "text-foreground/85 focus:bg-accent/70 focus:text-foreground",
              )}
            >
              {Icon && <Icon className="h-3.5 w-3.5 shrink-0" />}
              {entry.label}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
