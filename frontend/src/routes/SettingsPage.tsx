import { useState } from "react";
import { Card } from "@/components/ui/card";
import { SettingsSidebar } from "@/components/settings/SettingsSidebar";
import { SchoolProfileSettings }    from "@/components/settings/SchoolProfileSettings";
import { AcademicYearSettings }     from "@/components/settings/AcademicYearSettings";
import { UserSettings }             from "@/components/settings/UserSettings";
import { RolesPermissionsSettings } from "@/components/settings/RolesPermissionsSettings";
import { NotificationSettings }     from "@/components/settings/NotificationSettings";
import { FeeSettings }              from "@/components/settings/FeeSettings";
import { AttendanceSettings }       from "@/components/settings/AttendanceSettings";
import { ExamSettings }             from "@/components/settings/ExamSettings";
import { AppearanceSettings }       from "@/components/settings/AppearanceSettings";
import { SecuritySettings }         from "@/components/settings/SecuritySettings";
import { BackupSettings }           from "@/components/settings/BackupSettings";
import { AuditLogsSettings }        from "@/components/settings/AuditLogsSettings";
import type { SettingsPanel }       from "@/components/settings/SettingsSidebar";

const PANEL_TITLES: Record<SettingsPanel, string> = {
  school:        "School Profile",
  academic:      "Academic Year",
  users:         "Admin Users",
  roles:         "Roles & Permissions",
  notifications: "Notification Settings",
  fees:          "Fee Settings",
  attendance:    "Attendance Settings",
  exams:         "Exam & Grading",
  appearance:    "Appearance",
  security:      "Security",
  backup:        "Backup & Export",
  audit:         "Audit Logs",
};

const PANEL_SUBTITLES: Record<SettingsPanel, string> = {
  school:        "School name, logo, contact, and address information",
  academic:      "Academic year dates, admission status, and result settings",
  users:         "Manage administrator accounts and access",
  roles:         "Configure what each role can view, edit, and export",
  notifications: "Choose notification channels and trigger events",
  fees:          "Currency, late fees, payment methods, and fee categories",
  attendance:    "Attendance type, thresholds, and notification rules",
  exams:         "Pass marks, GPA, grade scale, and exam controls",
  appearance:    "Theme mode, accent color, and interface preferences",
  security:      "Password policy, session timeout, and 2FA",
  backup:        "Automated backups, data export, and storage",
  audit:         "Full history of all administrative actions",
};

function PanelContent({ panel }: { panel: SettingsPanel }) {
  switch (panel) {
    case "school":        return <SchoolProfileSettings />;
    case "academic":      return <AcademicYearSettings />;
    case "users":         return <UserSettings />;
    case "roles":         return <RolesPermissionsSettings />;
    case "notifications": return <NotificationSettings />;
    case "fees":          return <FeeSettings />;
    case "attendance":    return <AttendanceSettings />;
    case "exams":         return <ExamSettings />;
    case "appearance":    return <AppearanceSettings />;
    case "security":      return <SecuritySettings />;
    case "backup":        return <BackupSettings />;
    case "audit":         return <AuditLogsSettings />;
  }
}

export function SettingsPage() {
  const [activePanel, setActivePanel] = useState<SettingsPanel>("school");

  return (
    <div className="space-y-4">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Settings</h1>
        <p className="mt-0.5 text-[13px] text-muted-foreground">
          Manage school configuration, users, roles, and system preferences
        </p>
      </div>

      <div className="flex gap-6 items-start">
        {/* ── Left nav panel ──────────────────────────────────── */}
        <aside className="hidden w-56 shrink-0 lg:block">
          <Card className="rounded-2xl p-3 shadow-sm sticky top-4">
            <SettingsSidebar active={activePanel} onChange={setActivePanel} />
          </Card>
        </aside>

        {/* ── Mobile nav ──────────────────────────────────────── */}
        <div className="w-full lg:hidden">
          <select
            value={activePanel}
            onChange={(e) => setActivePanel(e.target.value as SettingsPanel)}
            className="mb-4 h-10 w-full rounded-xl border border-input bg-background px-3 text-[13px] text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          >
            {(Object.entries(PANEL_TITLES) as [SettingsPanel, string][]).map(([k, v]) => (
              <option key={k} value={k}>{v}</option>
            ))}
          </select>
        </div>

        {/* ── Right content panel ─────────────────────────────── */}
        <main className="min-w-0 flex-1">
          {/* Panel header */}
          <div className="mb-5">
            <h2 className="text-lg font-bold text-foreground">{PANEL_TITLES[activePanel]}</h2>
            <p className="mt-0.5 text-[13px] text-muted-foreground">{PANEL_SUBTITLES[activePanel]}</p>
          </div>

          <PanelContent panel={activePanel} />
        </main>
      </div>
    </div>
  );
}
