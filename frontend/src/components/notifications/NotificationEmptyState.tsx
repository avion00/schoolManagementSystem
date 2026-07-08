import { Bell, type LucideIcon } from "lucide-react";

import { Button } from "@/components/ui/button";

export function NotificationEmptyState({
  icon: Icon = Bell,
  title,
  description,
  onReset,
}: {
  icon?: LucideIcon;
  title: string;
  description: string;
  onReset?: () => void;
}) {
  return (
    <div className="flex flex-col items-center gap-2 rounded-2xl border border-border/60 bg-card py-16 text-center shadow-sm">
      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
        <Icon className="h-5 w-5 text-muted-foreground" />
      </span>
      <p className="mt-1 text-[13px] font-medium text-foreground">{title}</p>
      <p className="max-w-xs text-[12px] text-muted-foreground">{description}</p>
      {onReset && (
        <Button variant="outline" size="sm" className="mt-2 h-8 text-[12px]" onClick={onReset}>
          Reset filters
        </Button>
      )}
    </div>
  );
}
