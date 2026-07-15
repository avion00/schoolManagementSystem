import { History } from "lucide-react";

import type { TicketActivity } from "@/data/teacherHelpData";

function timeLabel(iso: string) {
  return new Date(iso).toLocaleString(undefined, { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
}

export function TicketTimeline({ activities }: { activities: TicketActivity[] }) {
  if (activities.length === 0) {
    return <p className="text-[12px] text-muted-foreground">No activity yet.</p>;
  }
  return (
    <ol className="space-y-3">
      {activities.map((a) => (
        <li key={a.id} className="flex gap-2.5">
          <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
            <History className="h-3 w-3" />
          </span>
          <div className="min-w-0">
            <p className="text-[12.5px] text-foreground">{a.action}</p>
            <p className="text-[11px] text-muted-foreground">{timeLabel(a.at)}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}
