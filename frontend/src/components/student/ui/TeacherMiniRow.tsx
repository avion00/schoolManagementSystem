import { MessageSquare } from "lucide-react";

function initials(name: string) {
  const parts = name.trim().split(/\s+/);
  const first = parts[0]?.[0] ?? "";
  const last = parts.length > 1 ? parts[parts.length - 1][0] : "";
  return (first + last).toUpperCase();
}

/** Compact teacher row for the "My Teachers" sidebar list — avatar initials, name, subject, message action. */
export function TeacherMiniRow({ name, subject, onMessage }: { name: string; subject: string; onMessage: () => void }) {
  return (
    <div className="flex items-center gap-2.5 rounded-xl p-2 transition-colors hover:bg-muted/40">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-secondary text-[11px] font-semibold text-secondary-foreground">
        {initials(name)}
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-[12.5px] font-medium text-foreground">{name}</p>
        <p className="truncate text-[11px] text-muted-foreground">{subject}</p>
      </div>
      <button
        type="button"
        onClick={onMessage}
        aria-label={`Message ${name}`}
        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-primary/10 hover:text-primary"
      >
        <MessageSquare className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
