import { useState } from "react";

import { MessageModerationTable } from "@/components/messages/MessageModerationTable";
import { Card, CardContent } from "@/components/ui/card";
import { messagesService } from "@/lib/messagesService";
import { useAuth } from "@/lib/auth";
import { resolveCurrentChatUser } from "@/lib/messagesService";

export function MessageModerationPage() {
  const { user } = useAuth();
  const [, bump] = useState(0);
  if (!user) return null;
  const { id: currentUserId } = resolveCurrentChatUser(user);

  const reports = messagesService.getModerationReports();
  const stats = [
    { label: "Open", value: reports.filter((r) => r.status === "open").length },
    { label: "Reviewed", value: reports.filter((r) => r.status === "reviewed").length },
    { label: "Dismissed", value: reports.filter((r) => r.status === "dismissed").length },
    { label: "Actioned", value: reports.filter((r) => r.status === "actioned").length },
  ];

  function updateStatus(id: string, status: "reviewed" | "dismissed" | "actioned") {
    messagesService.updateModerationStatus(id, status, currentUserId);
    bump((n) => n + 1);
  }

  function handleDeleteMessage(reportId: string) {
    const report = reports.find((r) => r.id === reportId);
    if (report) messagesService.deleteMessage(report.messageId, true, currentUserId);
    updateStatus(reportId, "actioned");
  }

  function handleLockConversation(reportId: string) {
    const report = reports.find((r) => r.id === reportId);
    if (report) messagesService.toggleLock(report.conversationId, currentUserId);
    updateStatus(reportId, "actioned");
  }

  function handleExportEvidence(reportId: string) {
    const report = reports.find((r) => r.id === reportId);
    if (report) messagesService.logExport(report.conversationId, currentUserId, "json");
    updateStatus(reportId, "reviewed");
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {stats.map((s) => (
          <Card key={s.label} className="rounded-2xl border-border/60 shadow-sm">
            <CardContent className="p-4">
              <p className="text-[11px] text-muted-foreground">{s.label}</p>
              <p className="mt-1 text-xl font-semibold tabular-nums text-foreground">{s.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <MessageModerationTable
        reports={reports}
        onReview={(id) => updateStatus(id, "reviewed")}
        onDismiss={(id) => updateStatus(id, "dismissed")}
        onWarn={(id) => updateStatus(id, "actioned")}
        onDeleteMessage={handleDeleteMessage}
        onLockConversation={handleLockConversation}
        onExportEvidence={handleExportEvidence}
      />
    </div>
  );
}
