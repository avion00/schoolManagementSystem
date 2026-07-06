import { useState } from "react";
import { Bell, Mail, Smartphone, Radio } from "lucide-react";
import { SettingsSection, ToggleRow, SaveBar } from "./SettingsSection";
import { NOTIFICATION_SETTINGS } from "@/data/settingsData";
import type { NotificationSettings as NS } from "@/data/settingsData";
import { cn } from "@/lib/utils";

const CHANNEL_ICONS = {
  inApp: { Icon: Bell,       label: "In-app",    color: "text-blue-600",    bg: "bg-blue-50 dark:bg-blue-950/40"    },
  email: { Icon: Mail,       label: "Email",     color: "text-emerald-600", bg: "bg-emerald-50 dark:bg-emerald-950/40" },
  sms:   { Icon: Smartphone, label: "SMS",       color: "text-violet-600",  bg: "bg-violet-50 dark:bg-violet-950/40" },
  push:  { Icon: Radio,      label: "Push",      color: "text-amber-600",   bg: "bg-amber-50 dark:bg-amber-950/40"  },
};

const EVENT_LABELS: Record<keyof NS["events"], string> = {
  admissionCreated:    "New admission created",
  attendanceAlert:     "Attendance absent alert",
  feeDueReminder:      "Fee due reminder",
  examScheduled:       "Exam schedule published",
  resultPublished:     "Results published",
  noticePublished:     "Notice/announcement published",
  messageReceived:     "New message received",
  paymentReceived:     "Payment received",
  lowAttendanceAlert:  "Low attendance warning",
  leaveApproved:       "Leave request approved",
};

const AUDIENCE_LABELS: Record<keyof NS["audiences"], string> = {
  parents:  "Parents",
  teachers: "Teachers",
  students: "Students",
  staff:    "Staff",
};

export function NotificationSettings() {
  const [s, setS] = useState<NS>({ ...NOTIFICATION_SETTINGS, events: { ...NOTIFICATION_SETTINGS.events }, channels: { ...NOTIFICATION_SETTINGS.channels }, audiences: { ...NOTIFICATION_SETTINGS.audiences } });
  const [saving, setSaving] = useState(false);
  const [saved,  setSaved]  = useState(false);

  function setChannel(k: keyof NS["channels"], v: boolean) {
    setS((p) => ({ ...p, channels: { ...p.channels, [k]: v } }));
  }
  function setEvent(k: keyof NS["events"], v: boolean) {
    setS((p) => ({ ...p, events: { ...p.events, [k]: v } }));
  }
  function setAudience(k: keyof NS["audiences"], v: boolean) {
    setS((p) => ({ ...p, audiences: { ...p.audiences, [k]: v } }));
  }

  async function handleSave() {
    setSaving(true); setSaved(false);
    await new Promise((r) => setTimeout(r, 600));
    console.log("Notification settings saved:", s);
    setSaving(false); setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  return (
    <div className="space-y-5">
      {/* Channels */}
      <SettingsSection icon={Bell} title="Notification Channels"
        subtitle="Choose how notifications are delivered">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {(Object.keys(CHANNEL_ICONS) as (keyof typeof CHANNEL_ICONS)[]).map((ch) => {
            const { Icon, label, color, bg } = CHANNEL_ICONS[ch];
            const active = s.channels[ch as keyof NS["channels"]];
            return (
              <button
                key={ch}
                onClick={() => setChannel(ch as keyof NS["channels"], !active)}
                className={cn(
                  "flex flex-col items-center gap-2.5 rounded-2xl border-2 p-4 transition-all",
                  active ? "border-primary bg-primary/5" : "border-border hover:border-primary/40",
                  ch === "sms" || ch === "push" ? "opacity-60" : "",
                )}
              >
                <div className={cn("flex h-10 w-10 items-center justify-center rounded-xl", bg)}>
                  <Icon className={cn("h-5 w-5", color)} />
                </div>
                <p className="text-[12px] font-medium text-foreground">{label}</p>
                {(ch === "sms" || ch === "push") && (
                  <span className="text-[10px] text-muted-foreground">Coming soon</span>
                )}
              </button>
            );
          })}
        </div>
      </SettingsSection>

      {/* Events */}
      <SettingsSection icon={Bell} title="Notification Events"
        subtitle="Choose which events trigger notifications">
        <div className="divide-y divide-border rounded-xl border border-border overflow-hidden">
          {(Object.keys(s.events) as (keyof NS["events"])[]).map((key) => (
            <ToggleRow
              key={key}
              label={EVENT_LABELS[key]}
              checked={s.events[key]}
              onChange={(v) => setEvent(key, v)}
            />
          ))}
        </div>
      </SettingsSection>

      {/* Audiences */}
      <SettingsSection icon={Bell} title="Default Audiences"
        subtitle="Which user groups receive notifications by default">
        <div className="divide-y divide-border rounded-xl border border-border overflow-hidden">
          {(Object.keys(s.audiences) as (keyof NS["audiences"])[]).map((key) => (
            <ToggleRow
              key={key}
              label={AUDIENCE_LABELS[key]}
              checked={s.audiences[key]}
              onChange={(v) => setAudience(key, v)}
            />
          ))}
        </div>
      </SettingsSection>

      <SaveBar onSave={handleSave} onReset={() => setS({ ...NOTIFICATION_SETTINGS, events: { ...NOTIFICATION_SETTINGS.events }, channels: { ...NOTIFICATION_SETTINGS.channels }, audiences: { ...NOTIFICATION_SETTINGS.audiences } })} saving={saving} saved={saved} />
    </div>
  );
}
