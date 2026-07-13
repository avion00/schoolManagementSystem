export interface TeacherTimelineItem {
  id: string;
  title: string;
  detail: string;
  timestamp: string;
}

/** Generic connected-dot timeline — used for "My Activity" and any other chronological list. */
export function TeacherTimeline({ items }: { items: TeacherTimelineItem[] }) {
  return (
    <ol className="space-y-3">
      {items.map((item, i) => (
        <li key={item.id} className="relative flex gap-3 pl-1">
          <div className="flex flex-col items-center">
            <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-primary" />
            {i < items.length - 1 && <span className="mt-1 w-px flex-1 bg-border/60" />}
          </div>
          <div className="min-w-0 pb-1">
            <p className="text-[12.5px] font-medium text-foreground">{item.title}</p>
            <p className="text-[11.5px] text-muted-foreground">{item.detail}</p>
            <p className="mt-0.5 text-[10.5px] text-muted-foreground/60">{item.timestamp}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}
