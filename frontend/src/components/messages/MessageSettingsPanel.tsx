import { useState } from "react";
import { Bell, MessageSquare, Shield, Users } from "lucide-react";

import { SettingsField, SettingsSection, SaveBar, ToggleRow } from "@/components/settings/SettingsSection";

interface MessagingSettings {
  allowStudentToStudent: boolean;
  allowParentToTeacher: boolean;
  requireApprovalForStudents: boolean;
  enableFileSharing: boolean;
  maxFileSizeMb: number;
  allowedFileTypes: string;
  retentionDays: number;
  enableReadReceipts: boolean;
  enableTypingIndicators: boolean;
  enableMessageEditDelete: boolean;
  enableModeration: boolean;
  blockedKeywords: string;
  notifyOnNewMessage: boolean;
  notifyOnMention: boolean;
}

const DEFAULT_SETTINGS: MessagingSettings = {
  allowStudentToStudent: false,
  allowParentToTeacher: true,
  requireApprovalForStudents: true,
  enableFileSharing: true,
  maxFileSizeMb: 10,
  allowedFileTypes: "jpg, png, pdf, docx, xlsx",
  retentionDays: 365,
  enableReadReceipts: true,
  enableTypingIndicators: true,
  enableMessageEditDelete: true,
  enableModeration: true,
  blockedKeywords: "spam, scam, promo",
  notifyOnNewMessage: true,
  notifyOnMention: true,
};

export function MessageSettingsPanel() {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  function set<K extends keyof MessagingSettings>(key: K, value: MessagingSettings[K]) {
    setSettings((s) => ({ ...s, [key]: value }));
    setSaved(false);
  }

  function handleSave() {
    setSaving(true);
    setTimeout(() => { setSaving(false); setSaved(true); }, 500);
  }

  return (
    <div className="space-y-4">
      <SettingsSection icon={Users} title="Messaging permissions" subtitle="Who can message whom across the school">
        <ToggleRow
          label="Allow student-to-student messaging"
          sublabel="Students can message classmates directly"
          checked={settings.allowStudentToStudent}
          onChange={(v) => set("allowStudentToStudent", v)}
        />
        <ToggleRow
          label="Allow parent-to-teacher messaging"
          sublabel="Parents can message their children's teachers directly"
          checked={settings.allowParentToTeacher}
          onChange={(v) => set("allowParentToTeacher", v)}
        />
        <ToggleRow
          label="Require approval for student messages"
          sublabel="New student conversations appear in Message Requests until approved"
          checked={settings.requireApprovalForStudents}
          onChange={(v) => set("requireApprovalForStudents", v)}
        />
      </SettingsSection>

      <SettingsSection icon={MessageSquare} title="Attachments & retention" subtitle="File sharing rules and message history">
        <ToggleRow label="Enable file sharing" sublabel="Allow images, documents, and other attachments" checked={settings.enableFileSharing} onChange={(v) => set("enableFileSharing", v)} />
        <div className="grid grid-cols-1 gap-4 pt-3 sm:grid-cols-2">
          <SettingsField label="Max file size (MB)">
            <input type="number" min={1} value={settings.maxFileSizeMb} onChange={(e) => set("maxFileSizeMb", Number(e.target.value))} className="h-9 w-full rounded-xl border border-input bg-background px-3 text-[13px] text-foreground focus:outline-none focus:ring-1 focus:ring-ring" />
          </SettingsField>
          <SettingsField label="Message retention (days)">
            <input type="number" min={1} value={settings.retentionDays} onChange={(e) => set("retentionDays", Number(e.target.value))} className="h-9 w-full rounded-xl border border-input bg-background px-3 text-[13px] text-foreground focus:outline-none focus:ring-1 focus:ring-ring" />
          </SettingsField>
        </div>
        <div className="pt-3">
          <SettingsField label="Allowed file types" hint="Comma-separated extensions">
            <input value={settings.allowedFileTypes} onChange={(e) => set("allowedFileTypes", e.target.value)} className="h-9 w-full rounded-xl border border-input bg-background px-3 text-[13px] text-foreground focus:outline-none focus:ring-1 focus:ring-ring" />
          </SettingsField>
        </div>
      </SettingsSection>

      <SettingsSection icon={Shield} title="Moderation & safety" subtitle="Content controls and message behavior">
        <ToggleRow label="Enable read receipts" checked={settings.enableReadReceipts} onChange={(v) => set("enableReadReceipts", v)} />
        <ToggleRow label="Enable typing indicators" checked={settings.enableTypingIndicators} onChange={(v) => set("enableTypingIndicators", v)} />
        <ToggleRow label="Enable message edit/delete" checked={settings.enableMessageEditDelete} onChange={(v) => set("enableMessageEditDelete", v)} />
        <ToggleRow label="Enable moderation" sublabel="Flagged and reported messages appear in the Moderation queue" checked={settings.enableModeration} onChange={(v) => set("enableModeration", v)} />
        <div className="pt-3">
          <SettingsField label="Blocked keywords" hint="Comma-separated words that auto-flag a message for review">
            <input value={settings.blockedKeywords} onChange={(e) => set("blockedKeywords", e.target.value)} className="h-9 w-full rounded-xl border border-input bg-background px-3 text-[13px] text-foreground focus:outline-none focus:ring-1 focus:ring-ring" />
          </SettingsField>
        </div>
      </SettingsSection>

      <SettingsSection icon={Bell} title="Notifications" subtitle="When users are notified about messages">
        <ToggleRow label="Notify on new message" checked={settings.notifyOnNewMessage} onChange={(v) => set("notifyOnNewMessage", v)} />
        <ToggleRow label="Notify when mentioned" checked={settings.notifyOnMention} onChange={(v) => set("notifyOnMention", v)} />
      </SettingsSection>

      <SaveBar onSave={handleSave} onReset={() => { setSettings(DEFAULT_SETTINGS); setSaved(false); }} saving={saving} saved={saved} />
    </div>
  );
}
