import { ArrowUpRight, Link2 } from "lucide-react";
import { toast } from "sonner";

import type { RelatedRecord } from "@/data/helpDeskData";

export function RelatedRecordsCard({ records }: { records: RelatedRecord[] }) {
  if (records.length === 0) {
    return <p className="text-[12px] text-muted-foreground">No related records linked to this ticket.</p>;
  }
  return (
    <div className="space-y-1.5">
      {records.map((r) => (
        <button
          key={`${r.type}-${r.label}`}
          type="button"
          onClick={() => toast.info(`Opening ${r.type.toLowerCase()} record — ${r.label}`)}
          className="group flex w-full items-center gap-2.5 rounded-lg border border-border/60 px-3 py-2 text-left transition-colors hover:border-primary/30 hover:bg-muted/40"
        >
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-primary/10">
            <Link2 className="h-3.5 w-3.5 text-primary" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-[11px] text-muted-foreground">{r.type}</p>
            <p className="truncate text-[12.5px] font-medium text-foreground">{r.label}</p>
          </div>
          <ArrowUpRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground/50 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-primary" />
        </button>
      ))}
    </div>
  );
}
