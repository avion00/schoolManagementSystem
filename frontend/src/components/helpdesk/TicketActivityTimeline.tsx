import type { TicketActivity } from "@/data/helpDeskData";

function formatWhen(iso: string) {
  return new Date(iso).toLocaleString(undefined, {
    month: "short", day: "numeric", hour: "numeric", minute: "2-digit",
  });
}

export function TicketActivityTimeline({ activities }: { activities: TicketActivity[] }) {
  const sorted = [...activities].sort((a, b) => new Date(a.at).getTime() - new Date(b.at).getTime());

  return (
    <ol className="relative space-y-4 pl-4">
      <div className="absolute bottom-1 left-[3px] top-1 w-px bg-border" aria-hidden="true" />
      {sorted.map((a) => (
        <li key={a.id} className="relative pl-4">
          <span className="absolute -left-[1px] top-1 h-[7px] w-[7px] -translate-x-1/2 rounded-full bg-primary ring-2 ring-card" />
          <p className="text-[12.5px] font-medium leading-snug text-foreground">{a.action}</p>
          <p className="mt-0.5 text-[11px] text-muted-foreground">{a.by} · {formatWhen(a.at)}</p>
        </li>
      ))}
    </ol>
  );
}
