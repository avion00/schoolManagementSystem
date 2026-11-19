import { Bell, Radio } from "lucide-react";
import { SettingsSection, ToggleRow } from "./SettingsSection";
import { SectionForm } from "./SectionForm";

const EVENTS: { key: string; label: string; sublabel: string }[] = [
  { key: "attendance_alert", label: "Absence alerts", sublabel: "Tell guardians when their child is marked absent" },
  { key: "fee_due_reminder", label: "Fee reminders", sublabel: "Remind guardians about invoices that fall due" },
  { key: "payment_received", label: "Payment received", sublabel: "Confirm payments to guardians" },
  { key: "exam_scheduled", label: "Exam schedule", sublabel: "Tell students and guardians about new papers" },
  { key: "result_published", label: "Results published", sublabel: "Tell students and guardians when results are out" },
  { key: "notice_published", label: "Notices", sublabel: "Notify readers when a notice is published" },
  { key: "message_received", label: "New messages", sublabel: "Notify people about new chat messages" },
  { key: "low_attendance_alert", label: "Low attendance", sublabel: "Warn about students with low attendance" },
];

/** Which school events send notifications, and through which channels. */
export function NotificationSettings() {
  return (
    <SectionForm section="notifications">
      {(draft, set, canEdit) => (<>
        <SettingsSection icon={Bell} title="Events" subtitle="Turn off an event to stop its notifications for everyone">
          <div className="space-y-1">
            {EVENTS.map((e) => (
              <ToggleRow key={e.key} label={e.label} sublabel={e.sublabel} disabled={!canEdit}
                checked={draft.events[e.key] ?? true}
                onChange={(v) => set({ events: { ...draft.events, [e.key]: v } })} />
            ))}
          </div>
        </SettingsSection>
        <SettingsSection icon={Radio} title="Channels">
          <div className="space-y-1">
            <ToggleRow label="In-app notifications" sublabel="Always on: the bell and the notifications page" checked disabled onChange={() => undefined} />
            <ToggleRow label="Email" sublabel="Also email people who have an email address (requires the server's mail settings)"
              disabled={!canEdit} checked={!!draft.channels.email} onChange={(v) => set({ channels: { ...draft.channels, email: v } })} />
          </div>
        </SettingsSection>
      </>)}
    </SectionForm>
  );
}
