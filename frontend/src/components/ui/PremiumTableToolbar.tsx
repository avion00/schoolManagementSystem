import { FilterX } from "lucide-react";
import type { ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { PremiumSearchInput } from "@/components/ui/PremiumSearchInput";

/** Search + filter controls row above a PremiumDataTable, with an optional reset action. */
export function PremiumTableToolbar({
  search,
  onSearchChange,
  searchPlaceholder,
  filters,
  hasActiveFilter,
  onReset,
  trailing,
}: {
  search: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder?: string;
  filters?: ReactNode;
  hasActiveFilter?: boolean;
  onReset?: () => void;
  trailing?: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2.5">
      <PremiumSearchInput value={search} onChange={onSearchChange} placeholder={searchPlaceholder} className="min-w-[240px] flex-1 sm:max-w-sm" />
      {filters}
      {hasActiveFilter && onReset && (
        <Button variant="ghost" size="sm" onClick={onReset} className="gap-1.5 text-muted-foreground hover:text-foreground">
          <FilterX className="h-4 w-4" />
          Reset
        </Button>
      )}
      {trailing && <div className="ml-auto flex items-center gap-2">{trailing}</div>}
    </div>
  );
}
