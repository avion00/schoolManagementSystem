import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

/** Single label/value cell with an optional icon — used inside StudentProfileInfoGrid. */
export function ProfileInfoItem({ label, value, icon: Icon }: { label: string; value: string; icon?: LucideIcon }) {
  return (
    <div className="flex items-start gap-2.5">
      {Icon && (
        <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Icon className="h-3.5 w-3.5" />
        </span>
      )}
      <div className="min-w-0">
        <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
        <p className="mt-0.5 truncate text-[13.5px] font-medium text-foreground">{value}</p>
      </div>
    </div>
  );
}

/** Responsive info grid — 3 cols desktop, 2 tablet, 1 mobile. Wrap ProfileInfoItem children. */
export function ProfileInfoGrid({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("grid gap-x-6 gap-y-5 sm:grid-cols-2 lg:grid-cols-3", className)}>{children}</div>;
}
