import { useState } from "react";
import { AlertCircle, Eye, XCircle, CheckCheck } from "lucide-react";

import { MessageModerationTable } from "@/components/messages/MessageModerationTable";
import { CATEGORICAL_COLORS, STATUS_COLORS } from "@/components/charts/palette";
import { Reveal } from "@/components/motion";
import { KPITrendCard } from "@/components/ui/KPITrendCard";
import { METRIC_TONES } from "@/components/ui/MetricCard";
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
    {
      label: "Open", value: reports.filter((r) => r.status === "open").length, icon: AlertCircle, tone: METRIC_TONES.amber,
      sparkColor: STATUS_COLORS.warning,
    },
    {
      label: "Reviewed", value: reports.filter((r) => r.status === "reviewed").length, icon: Eye, tone: METRIC_TONES.blue,
      sparkColor: CATEGORICAL_COLORS[0],
    },
    {
      label: "Dismissed", value: reports.filter((r) => r.status === "dismissed").length, icon: XCircle, tone: METRIC_TONES.red,
      sparkColor: STATUS_COLORS.critical,
    },
    {
      label: "Actioned", value: reports.filter((r) => r.status === "actioned").length, icon: CheckCheck, tone: METRIC_TONES.green,
      sparkColor: STATUS_COLORS.good,
    },
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
        {stats.map((s, i) => (
          <Reveal key={s.label} delay={i * 40}>
            <KPITrendCard
              label={s.label}
              value={s.value}
              icon={s.icon}
              iconCls={s.tone}
              sparklineColor={s.sparkColor}
            />
          </Reveal>
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
