import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { AlertCircle, Eye, XCircle, CheckCheck } from "lucide-react";

import { MessageModerationTable } from "@/components/messages/MessageModerationTable";
import { Reveal } from "@/components/motion";
import { KPITrendCard } from "@/components/ui/KPITrendCard";
import { METRIC_TONES } from "@/components/ui/MetricCard";
import { errorMessage } from "@/api/http";
import { messagesService } from "@/lib/messagesService";
import { useAuth } from "@/lib/auth";

export function MessageModerationPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [, bump] = useState(0);
  useEffect(() => messagesService.subscribe(() => bump((n) => n + 1)), []);
  if (!user) return null;
  const fail = (e: unknown) => toast.error(errorMessage(e));

  const reports = messagesService.getModerationReports();
  const stats = [
    {
      label: "Open", value: reports.filter((r) => r.status === "open").length, icon: AlertCircle, tone: METRIC_TONES.amber,
    },
    {
      label: "Reports", value: reports.length, icon: Eye, tone: METRIC_TONES.blue,
    },
    {
      label: "Dismissed", value: reports.filter((r) => r.status === "dismissed").length, icon: XCircle, tone: METRIC_TONES.red,
    },
    {
      label: "Actioned", value: reports.filter((r) => r.status === "actioned").length, icon: CheckCheck, tone: METRIC_TONES.green,
    },
  ];

  function decide(id: string, status: "dismissed" | "actioned") {
    const resolution = window.prompt(status === "actioned" ? "Remove this message? Note for the record (optional):" : "Dismiss this report? Note (optional):");
    if (resolution === null) return;
    messagesService.updateModerationStatus(id, status, resolution)
      .then(() => toast.success(status === "actioned" ? "Message removed." : "Report dismissed."))
      .catch(fail);
  }

  function handleLockConversation(reportId: string) {
    const report = reports.find((r) => r.id === reportId);
    if (!report || !window.confirm("Lock this conversation? Nobody can send messages until it's unlocked.")) return;
    messagesService.loadConversation(report.conversationId)
      .catch(() => undefined)
      .then(() => messagesService.toggleLock(report.conversationId))
      .then(() => toast.success("Conversation locked."))
      .catch(fail);
  }

  function handleExportEvidence(reportId: string) {
    const report = reports.find((r) => r.id === reportId);
    if (!report) return;
    messagesService.exportConversation(report.conversationId).then((data) => {
      const url = URL.createObjectURL(new Blob([JSON.stringify({ report, ...data }, null, 2)], { type: "application/json" }));
      const a = Object.assign(document.createElement("a"), { href: url, download: `report-${report.id}.json` });
      a.click();
      URL.revokeObjectURL(url);
    }).catch(fail);
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
            />
          </Reveal>
        ))}
      </div>

      <MessageModerationTable
        reports={reports}
        onReview={(id) => {
          const r = reports.find((x) => x.id === id);
          if (r) navigate(`/messages/chats/${r.conversationId}`);
        }}
        onDismiss={(id) => decide(id, "dismissed")}
        onWarn={(id) => {
          const r = reports.find((x) => x.id === id);
          if (!r?.senderId) return;
          messagesService.findOrCreateDirectConversation({ otherUserId: r.senderId })
            .then((c) => c && navigate(`/messages/chats/${c.id}`)).catch(fail);
        }}
        onDeleteMessage={(id) => decide(id, "actioned")}
        onLockConversation={handleLockConversation}
        onExportEvidence={handleExportEvidence}
      />
    </div>
  );
}
