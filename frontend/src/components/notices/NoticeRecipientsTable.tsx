import { CheckCircle2, Clock } from "lucide-react";
import { PremiumDataTable, type PremiumDataTableColumn } from "@/components/ui/PremiumDataTable";
import type { RecipientRecord } from "@/api/types/notices";
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

  const readCount = recipients.filter((r) => r.readStatus === "Read").length;
  const ackCount  = recipients.filter((r) => r.acknowledged).length;

  const columns: PremiumDataTableColumn<RecipientRecord>[] = [
    { key: "name", header: "Recipient", render: (r) => <span className="font-medium text-foreground">{r.name}</span> },
    {
      key: "role", header: "Role", render: (r) => (
        <span className={cn("inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold", ROLE_COLORS[r.role])}>
          {r.role}
        </span>
      ),
    },
    { key: "classSection", header: "Class/Sec", render: (r) => <span className="text-muted-foreground">{r.classSection}</span> },
    {
      key: "readStatus", header: "Read Status", align: "center", render: (r) => (
        r.readStatus === "Read" ? (
          <span className="inline-flex items-center gap-1 text-emerald-600 font-medium">
            <CheckCircle2 className="h-3.5 w-3.5" />Read
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 text-muted-foreground">
            <Clock className="h-3.5 w-3.5" />Unread
          </span>
        )
      ),
    },
    { key: "readTime", header: "Read Time", render: (r) => <span className="text-[11px] text-muted-foreground">{r.readTime ?? "—"}</span> },
    {
      key: "acknowledged", header: "Acknowledged", align: "center", render: (r) => (
        r.acknowledged
          ? <CheckCircle2 className="h-4 w-4 text-emerald-500 mx-auto" />
          : <span className="text-muted-foreground text-[11px]">—</span>
      ),
    },
  ];

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-4 text-[12px]">
        <span className="text-muted-foreground">Total: <strong className="text-foreground">{recipients.length}</strong></span>
        <span className="text-emerald-600">Read: <strong>{readCount}</strong></span>
        <span className="text-rose-600">Unread: <strong>{recipients.length - readCount}</strong></span>
        <span className="text-violet-600">Acknowledged: <strong>{ackCount}</strong></span>
      </div>

      <PremiumDataTable
        columns={columns}
        rows={recipients}
        rowKey={(r) => r.id}
      />
    </div>
  );
}
