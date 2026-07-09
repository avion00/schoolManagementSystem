import { useState } from "react";

import { MessageRequestsTable } from "@/components/messages/MessageRequestsTable";
import { messagesService } from "@/lib/messagesService";

export function MessageRequestsPage() {
  const [, bump] = useState(0);
  const requests = messagesService.getMessageRequests();
  const pendingCount = requests.filter((r) => r.status === "pending").length;

  function updateStatus(id: string, status: "approved" | "rejected" | "blocked") {
    messagesService.updateRequestStatus(id, status);
    bump((n) => n + 1);
  }

  return (
    <div className="space-y-4">
      <p className="text-[13px] text-muted-foreground">
        {pendingCount} pending request{pendingCount !== 1 ? "s" : ""} awaiting review — students and restricted roles need approval before messaging certain users.
      </p>
      <MessageRequestsTable
        requests={requests}
        onApprove={(id) => updateStatus(id, "approved")}
        onReject={(id) => updateStatus(id, "rejected")}
        onBlock={(id) => updateStatus(id, "blocked")}
      />
    </div>
  );
}
