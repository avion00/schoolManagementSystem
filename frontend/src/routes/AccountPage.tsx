import { useEffect, useState } from "react";
import { ShieldCheck } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";

import { AccountHero } from "@/components/account/AccountHero";
import { AccountPreferencesCard } from "@/components/account/AccountPreferencesCard";
import { AccountProfileCard } from "@/components/account/AccountProfileCard";
import { ActiveSessionsCard } from "@/components/account/ActiveSessionsCard";
import { NotificationPreferencesCard } from "@/components/account/NotificationPreferencesCard";
import { SecurityOverviewCard } from "@/components/account/SecurityOverviewCard";
import { Reveal, SlidingTabs } from "@/components/motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/lib/auth";

type AccountTab = "overview" | "profile" | "security" | "sessions" | "preferences";

const TAB_OPTIONS: { value: AccountTab; label: string }[] = [
  { value: "overview", label: "Overview" },
  { value: "profile", label: "Profile" },
  { value: "security", label: "Security" },
  { value: "sessions", label: "Sessions" },
  { value: "preferences", label: "Preferences" },
];

function tabFromPath(pathname: string): AccountTab {
  if (pathname === "/account/profile") return "profile";
  if (pathname === "/account/security") return "security";
  if (pathname === "/account/sessions") return "sessions";
  if (pathname === "/account/preferences") return "preferences";
  return "overview";
}

const TAB_PATH: Partial<Record<AccountTab, string>> = {
  profile: "/account/profile",
  security: "/account/security",
  sessions: "/account/sessions",
  preferences: "/account/preferences",
};

function AdminAccessPointerCard() {
  const navigate = useNavigate();
  return (
    <Card className="rounded-2xl border-border/60 shadow-sm">
      <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <ShieldCheck className="h-4.5 w-4.5" />
          </span>
          <div>
            <p className="text-[13px] font-semibold text-foreground">Need to manage users and permissions?</p>
            <p className="mt-0.5 text-[12px] text-muted-foreground">
              User accounts, roles, and access control are managed from the system Settings area.
            </p>
          </div>
        </div>
        <Button size="sm" className="h-8 shrink-0 gap-1.5 text-[12px]" onClick={() => navigate("/settings/access-control")}>
          Open Access Control
        </Button>
      </CardContent>
    </Card>
  );
}

export function AccountPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { hasPermission } = useAuth();
  // "overview" has no dedicated sub-route, so the active tab can't be derived
  // from the URL alone — track it in local state and resync from the path on
  // direct navigation (e.g. sidebar links, back button).
  const [tab, setTab] = useState<AccountTab>(() => tabFromPath(location.pathname));
  useEffect(() => { setTab(tabFromPath(location.pathname)); }, [location.pathname]);

  function handleTabChange(next: AccountTab) {
    setTab(next);
    const path = TAB_PATH[next];
    if (path) navigate(path);
  }

  const canManageAccess = hasPermission("user.manage") || hasPermission("role.manage");

  return (
    <div className="space-y-4">
      <Reveal className="overflow-x-auto">
        <SlidingTabs value={tab} onValueChange={(v) => handleTabChange(v as AccountTab)} options={TAB_OPTIONS} className="w-max" />
      </Reveal>

      {tab === "overview" && (
        <div className="space-y-4">
          <AccountHero onEditProfile={() => handleTabChange("profile")} onSecuritySettings={() => handleTabChange("security")} />
          <AccountProfileCard />
          <SecurityOverviewCard onManageSessions={() => handleTabChange("sessions")} />
          {canManageAccess && <AdminAccessPointerCard />}
        </div>
      )}

      {tab === "profile" && <AccountProfileCard />}

      {tab === "security" && <SecurityOverviewCard onManageSessions={() => handleTabChange("sessions")} />}

      {tab === "sessions" && <ActiveSessionsCard />}

      {tab === "preferences" && (
        <div className="space-y-4">
          <AccountPreferencesCard />
          <NotificationPreferencesCard />
        </div>
      )}
    </div>
  );
}
