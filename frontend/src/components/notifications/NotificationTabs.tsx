import { SlidingTabs } from "@/components/motion";
import type { AppNotification } from "@/data/notificationsData";

export type NotificationTab = "all" | "unread" | "urgent" | "approvals" | "billing" | "system" | "archived";

export function matchesTab(n: AppNotification, tab: NotificationTab): boolean {
  switch (tab) {
    case "all": return n.status !== "archived";
    case "unread": return n.status === "unread";
    case "urgent": return n.priority === "urgent" && n.status !== "archived";
    case "approvals": return n.isApproval === true;
    case "billing": return (n.category === "Fees" || n.category === "Billing" || n.category === "Payroll") && n.status !== "archived";
    case "system": return (n.category === "System" || n.category === "Security") && n.status !== "archived";
    case "archived": return n.status === "archived";
  }
}

export function NotificationTabs({
  notifications, value, onValueChange,
}: {
  notifications: AppNotification[];
  value: NotificationTab;
  onValueChange: (v: NotificationTab) => void;
}) {
  const tabs: { value: NotificationTab; label: string }[] = [
    { value: "all", label: "All" },
    { value: "unread", label: "Unread" },
    { value: "urgent", label: "Urgent" },
    { value: "approvals", label: "Approvals" },
    { value: "billing", label: "Billing" },
    { value: "system", label: "System" },
    { value: "archived", label: "Archived" },
  ];

  const options = tabs.map((t) => ({
    value: t.value,
    label: `${t.label} (${notifications.filter((n) => matchesTab(n, t.value)).length})`,
  }));

  return <SlidingTabs value={value} onValueChange={(v) => onValueChange(v as NotificationTab)} options={options} className="w-max" />;
}
