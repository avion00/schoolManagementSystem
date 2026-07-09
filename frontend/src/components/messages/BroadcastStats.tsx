import type { Broadcast } from "@/data/messagesData";

export function BroadcastStats({ broadcast }: { broadcast: Broadcast }) {
  const deliveredPct = Math.round((broadcast.delivered / broadcast.audienceCount) * 100) || 0;
  const readPct = Math.round((broadcast.read / broadcast.audienceCount) * 100) || 0;

  return (
    <div className="grid grid-cols-3 gap-3">
      <div className="rounded-xl bg-muted/40 p-3 text-center">
        <p className="text-[17px] font-semibold tabular-nums text-foreground">{broadcast.audienceCount.toLocaleString()}</p>
        <p className="text-[10.5px] text-muted-foreground">Audience</p>
      </div>
      <div className="rounded-xl bg-muted/40 p-3 text-center">
        <p className="text-[17px] font-semibold tabular-nums text-emerald-600 dark:text-emerald-400">{deliveredPct}%</p>
        <p className="text-[10.5px] text-muted-foreground">Delivered ({broadcast.delivered.toLocaleString()})</p>
      </div>
      <div className="rounded-xl bg-muted/40 p-3 text-center">
        <p className="text-[17px] font-semibold tabular-nums text-primary">{readPct}%</p>
        <p className="text-[10.5px] text-muted-foreground">Read ({broadcast.read.toLocaleString()})</p>
      </div>
    </div>
  );
}
