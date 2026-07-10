import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import { Card } from "@/components/ui/card";
import { SettingsSidebar } from "@/components/settings/SettingsSidebar";
import { MyProfileSettings }        from "@/components/settings/MyProfileSettings";
import { MySecuritySettings }       from "@/components/settings/MySecuritySettings";
import { MySessionsSettings }       from "@/components/settings/MySessionsSettings";
import { SchoolProfileSettings }    from "@/components/settings/SchoolProfileSettings";
import { AcademicYearSettings }     from "@/components/settings/AcademicYearSettings";
import { NotificationSettings }     from "@/components/settings/NotificationSettings";
import { FeeSettings }              from "@/components/settings/FeeSettings";
import { AttendanceSettings }       from "@/components/settings/AttendanceSettings";
import { ExamSettings }             from "@/components/settings/ExamSettings";
import { AppearanceSettings }       from "@/components/settings/AppearanceSettings";
import { SecuritySettings }         from "@/components/settings/SecuritySettings";
import { BackupSettings }           from "@/components/settings/BackupSettings";
import { UsersPage }                from "@/routes/UsersPage";
import { RolesPermissionsPage }     from "@/routes/RolesPermissionsPage";
import { AuditLogsPage }            from "@/routes/AuditLogsPage";
import type { SettingsPanel }       from "@/components/settings/SettingsSidebar";

const PANEL_PATH: Record<SettingsPanel, string> = {
  "my-profile":  "/settings/my-profile",
  "my-security": "/settings/my-security",
  "my-sessions": "/settings/my-sessions",
  school:        "/settings/school-profile",
  academic:      "/settings/academic-year",
  users:         "/settings/users",
  roles:         "/settings/roles-permissions",
  access:        "/settings/access-control",
  security:      "/settings/security",
  audit:         "/settings/audit-logs",
  attendance:    "/settings/attendance",
  exams:         "/settings/exam-grading",
  fees:          "/settings/fees",
  notifications: "/settings/notifications",
  appearance:    "/settings/appearance",
  backup:        "/settings/backup",
};

function panelFromPath(pathname: string): SettingsPanel {
  const entry = (Object.entries(PANEL_PATH) as [SettingsPanel, string][]).find(([, p]) => p === pathname);
  return entry ? entry[0] : "school";
}

const PANEL_LABELS: Record<SettingsPanel, string> = {
  "my-profile": "My Profile", "my-security": "My Security", "my-sessions": "My Sessions",
  school: "School Profile", academic: "Academic Year", users: "Users",
  roles: "Roles & Permissions", access: "Access Control", security: "Security",
  audit: "Audit Logs", attendance: "Attendance Settings", exams: "Exam & Grading",
  fees: "Fee Settings", notifications: "Notifications", appearance: "Appearance",
  backup: "Backup & Export",
};

function PanelContent({ panel }: { panel: SettingsPanel }) {
  switch (panel) {
    case "my-profile":    return <MyProfileSettings />;
    case "my-security":   return <MySecuritySettings />;
    case "my-sessions":   return <MySessionsSettings />;
    case "school":        return <SchoolProfileSettings />;
    case "academic":      return <AcademicYearSettings />;
    case "users":         return <UsersPage />;
    case "roles":         return <RolesPermissionsPage />;
    case "access":        return <UsersPage />;
    case "notifications": return <NotificationSettings />;
    case "fees":          return <FeeSettings />;
    case "attendance":    return <AttendanceSettings />;
    case "exams":         return <ExamSettings />;
    case "appearance":    return <AppearanceSettings />;
    case "security":      return <SecuritySettings />;
    case "backup":        return <BackupSettings />;
    case "audit":         return <AuditLogsPage />;
  }
}

export function SettingsPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [activePanel, setActivePanel] = useState<SettingsPanel>(() => panelFromPath(location.pathname));
  useEffect(() => { setActivePanel(panelFromPath(location.pathname)); }, [location.pathname]);

  function handlePanelChange(next: SettingsPanel) {
    setActivePanel(next);
    navigate(PANEL_PATH[next]);
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-6 items-start">
        {/* ── Left nav panel ──────────────────────────────────── */}
        <aside className="hidden w-56 shrink-0 lg:block">
          <Card className="rounded-2xl p-3 shadow-sm sticky top-4">
            <SettingsSidebar active={activePanel} onChange={handlePanelChange} />
          </Card>
        </aside>

        {/* ── Mobile nav ──────────────────────────────────────── */}
        <div className="w-full lg:hidden">
          <select
            value={activePanel}
            onChange={(e) => handlePanelChange(e.target.value as SettingsPanel)}
            className="mb-4 h-10 w-full rounded-xl border border-input bg-background px-3 text-[13px] text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          >
            {(Object.keys(PANEL_PATH) as SettingsPanel[]).map((k) => (
              <option key={k} value={k}>{PANEL_LABELS[k]}</option>
            ))}
          </select>
        </div>

        {/* ── Right content panel ─────────────────────────────── */}
        <main className="min-w-0 flex-1">
          <PanelContent panel={activePanel} />
        </main>
      </div>
    </div>
  );
}
