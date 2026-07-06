import { CheckCircle2, Clock } from "lucide-react";
import type { RecipientRecord } from "@/data/noticesData";
import { cn } from "@/lib/utils";

const ROLE_COLORS: Record<string, string> = {
  Student: "bg-blue-50 text-blue-700 dark:bg-blue-950/30 dark:text-blue-300",
  Parent:  "bg-violet-50 text-violet-700 dark:bg-violet-950/30 dark:text-violet-300",
  Teacher: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-300",
  Staff:   "bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-300",
};

export function NoticeRecipientsTable({ recipients }: { recipients: RecipientRecord[] }) {
  if (recipients.length === 0) {
    return (
      <p className="text-[12px] text-muted-foreground text-center py-8">
        Detailed recipient data available after publishing.
      </p>
    );
  }

  const readCount   = recipients.filter((r) => r.readStatus === "Read").length;
  const ackCount    = recipients.filter((r) => r.acknowledged).length;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-4 text-[12px]">
        <span className="text-muted-foreground">Total: <strong className="text-foreground">{recipients.length}</strong></span>
        <span className="text-emerald-600">Read: <strong>{readCount}</strong></span>
        <span className="text-rose-600">Unread: <strong>{recipients.length - readCount}</strong></span>
        <span className="text-violet-600">Acknowledged: <strong>{ackCount}</strong></span>
      </div>

      <div className="overflow-x-auto rounded-xl border border-border/60">
        <table className="min-w-full text-[12px]">
          <thead className="bg-muted/40 border-b border-border/60">
            <tr>
              <th className="px-3 py-2.5 text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">Recipient</th>
              <th className="px-3 py-2.5 text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">Role</th>
              <th className="px-3 py-2.5 text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">Class/Sec</th>
              <th className="px-3 py-2.5 text-center text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">Read Status</th>
              <th className="px-3 py-2.5 text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">Read Time</th>
              <th className="px-3 py-2.5 text-center text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">Acknowledged</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/40">
            {recipients.map((r) => (
              <tr key={r.id} className="hover:bg-muted/20">
                <td className="px-3 py-2.5 font-medium text-foreground">{r.name}</td>
                <td className="px-3 py-2.5">
                  <span className={cn("inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold", ROLE_COLORS[r.role])}>
                    {r.role}
                  </span>
                </td>
                <td className="px-3 py-2.5 text-muted-foreground">{r.classSection}</td>
                <td className="px-3 py-2.5 text-center">
                  {r.readStatus === "Read" ? (
                    <span className="inline-flex items-center gap-1 text-emerald-600 font-medium">
                      <CheckCircle2 className="h-3.5 w-3.5" />Read
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-muted-foreground">
                      <Clock className="h-3.5 w-3.5" />Unread
                    </span>
                  )}
                </td>
                <td className="px-3 py-2.5 text-[11px] text-muted-foreground">{r.readTime ?? "—"}</td>
                <td className="px-3 py-2.5 text-center">
                  {r.acknowledged
                    ? <CheckCircle2 className="h-4 w-4 text-emerald-500 mx-auto" />
                    : <span className="text-muted-foreground text-[11px]">—</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
