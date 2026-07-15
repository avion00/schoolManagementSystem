import { Eye, Inbox, X } from "lucide-react";
import { useMemo, useState } from "react";

import { SlidingTabs } from "@/components/motion";
import { TicketPriorityBadge } from "@/components/teacher/help/TicketPriorityBadge";
import { TicketStatusBadge } from "@/components/teacher/help/TicketStatusBadge";
import { PremiumDataTable, type PremiumDataTableColumn } from "@/components/ui/PremiumDataTable";
import { PremiumDropdownMenu } from "@/components/ui/PremiumDropdownMenu";
import { MY_REQUEST_STATUS_TABS, type MyRequest } from "@/data/teacherHelpData";

const TABS = [{ value: "All", label: "All" }, ...MY_REQUEST_STATUS_TABS.map((s) => ({ value: s, label: s }))];

export function MyRequestsTable({
  requests,
  onView,
  onClose,
}: {
  requests: MyRequest[];
  onView: (id: string) => void;
  onClose: (id: string) => void;
}) {
  const [tab, setTab] = useState("All");

  const rows = useMemo(
    () => (tab === "All" ? requests : requests.filter((r) => r.status === tab)),
    [requests, tab],
  );

  const columns: PremiumDataTableColumn<MyRequest>[] = [
    { key: "id", header: "Ticket ID", render: (r) => <span className="font-mono text-[12px] text-muted-foreground">{r.id}</span> },
    { key: "title", header: "Subject", render: (r) => <span className="font-medium text-foreground">{r.title}</span> },
    { key: "category", header: "Category", render: (r) => <span className="text-muted-foreground">{r.category}</span> },
    { key: "sentTo", header: "Sent To", render: (r) => r.sentTo },
    { key: "priority", header: "Priority", render: (r) => <TicketPriorityBadge priority={r.priority} /> },
    { key: "status", header: "Status", render: (r) => <TicketStatusBadge status={r.status} /> },
    { key: "lastUpdated", header: "Last Update", render: (r) => <span className="text-muted-foreground">{r.lastUpdated}</span> },
  ];

  return (
    <div className="space-y-3">
      <div className="-mx-1 overflow-x-auto px-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <SlidingTabs value={tab} onValueChange={setTab} options={TABS} className="w-max" />
      </div>
      <PremiumDataTable
        columns={columns}
        rows={rows}
        rowKey={(r) => r.id}
        emptyIcon={Inbox}
        emptyTitle="No requests here"
        emptyDescription="Requests you submit will show up in this tab."
        rowActions={(r) => (
          <PremiumDropdownMenu
            trigger={
              <button type="button" aria-label="Request actions" className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:bg-accent/70 hover:text-foreground">
                <Eye className="h-4 w-4" />
              </button>
            }
            items={[
              { label: "View request", icon: Eye, onClick: () => onView(r.id) },
              ...(r.status !== "Closed" ? [{ label: "Close request", icon: X, onClick: () => onClose(r.id) }] : []),
            ]}
          />
        )}
      />
    </div>
  );
}
