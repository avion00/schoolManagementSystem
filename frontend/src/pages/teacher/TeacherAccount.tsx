import { useState } from "react";
import { toast } from "sonner";

import { AccountHero } from "@/components/account/AccountHero";
import { MySecuritySettings } from "@/components/settings/MySecuritySettings";
import { MySessionsSettings } from "@/components/settings/MySessionsSettings";
import { NotificationSettings } from "@/components/settings/NotificationSettings";
import { AppearanceSettings } from "@/components/settings/AppearanceSettings";
import { Reveal } from "@/components/motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PremiumTabs } from "@/components/ui/PremiumTabs";
import { teacherProfile } from "@/data/teacherDashboardData";
import { useAuth } from "@/lib/auth";

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 py-2 text-[12.5px]">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium text-foreground">{value}</span>
    </div>
  );
}

/** Teacher-specific profile detail (not the shared admin AccountProfileCard,
 *  whose Department/Designation rows are hardcoded to a Super Admin persona). */
function TeacherProfileDetails() {
  const { user } = useAuth();
  return (
    <Card className="rounded-2xl border-border/60 shadow-sm">
      <CardHeader>
        <CardTitle className="text-[13px] font-semibold">My Account / Profile</CardTitle>
      </CardHeader>
      <CardContent className="divide-y divide-border/40 pt-0">
        <Row label="Full Name" value={user?.full_name || teacherProfile.name} />
        <Row label="Email" value={user?.email || teacherProfile.email} />
        <Row label="Employee ID" value={teacherProfile.employeeId} />
        <Row label="Department" value={teacherProfile.department} />
        <Row label="Designation" value={teacherProfile.designation} />
        <Row label="Subjects" value={teacherProfile.subjects.join(", ")} />
        <Row label="Organization" value={user?.organization?.name ?? "—"} />
        <Row label="Joined" value={teacherProfile.joinDate} />
      </CardContent>
    </Card>
  );
}

type Tab = "profile" | "security" | "sessions" | "notifications" | "appearance";

const TABS: { value: Tab; label: string }[] = [
  { value: "profile", label: "Profile" },
  { value: "security", label: "Security" },
  { value: "sessions", label: "Sessions" },
  { value: "notifications", label: "Notifications" },
  { value: "appearance", label: "Appearance" },
];

function TabContent({ tab, onTabChange }: { tab: Tab; onTabChange: (tab: Tab) => void }) {
  switch (tab) {
    case "profile": return (
      <div className="space-y-4">
        <AccountHero onEditProfile={() => toast.info("Editing profile — coming soon")} onSecuritySettings={() => onTabChange("security")} />
        <TeacherProfileDetails />
      </div>
    );
    case "security": return <MySecuritySettings />;
    case "sessions": return <MySessionsSettings />;
    case "notifications": return <NotificationSettings />;
    case "appearance": return <AppearanceSettings />;
  }
}

/**
 * Teacher's personal account settings — profile, security, sessions,
 * notifications, appearance only. Deliberately excludes Access Control and
 * Roles & Permissions, which stay admin-only in the full Settings module.
 */
export function TeacherAccount() {
  const [tab, setTab] = useState<Tab>("profile");

  return (
    <div className="space-y-4">
      <Reveal>
        <div>
          <h1 className="text-lg font-semibold tracking-tight text-foreground">My Account</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">Manage your profile, security, and preferences.</p>
        </div>
      </Reveal>

      <Reveal delay={60}>
        <PremiumTabs value={tab} onValueChange={(v) => setTab(v as Tab)} options={TABS} />
      </Reveal>

      <Reveal delay={100}>
        <TabContent tab={tab} onTabChange={setTab} />
      </Reveal>
    </div>
  );
}
