import { BadgeCheck, Shield, UserCog } from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PROFILE_EXTRAS } from "@/data/accountData";
import { useAuth } from "@/lib/auth";

function initialsOf(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  return parts.length ? (parts[0][0] + (parts[1]?.[0] ?? "")).toUpperCase() : "U";
}

export function AccountHero({
  onEditProfile,
  onSecuritySettings,
}: {
  onEditProfile: () => void;
  onSecuritySettings: () => void;
}) {
  const { user } = useAuth();
  const name = user?.full_name || user?.email || "Super Admin";
  const roleLabel = user?.is_platform_admin ? "Platform Admin" : user?.roles?.[0] ?? "Super Admin";

  return (
    <Card className="overflow-hidden rounded-2xl border-border/60 bg-gradient-to-br from-primary/[0.06] via-card to-card shadow-sm">
      <CardContent className="flex flex-col gap-5 p-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <Avatar className="h-16 w-16 shrink-0 border border-border/60">
            <AvatarFallback className="bg-primary/10 text-lg font-bold text-primary">{initialsOf(name)}</AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-lg font-semibold text-foreground">{name}</h2>
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-medium text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300">
                <BadgeCheck className="h-3 w-3" /> Verified
              </span>
              <span className="inline-flex items-center rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-medium text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300">
                Active
              </span>
            </div>
            <p className="mt-0.5 text-[12.5px] text-muted-foreground">{user?.email}</p>
            <p className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[11.5px] text-muted-foreground">
              <span className="rounded-md bg-muted px-1.5 py-0.5 font-medium text-foreground">{roleLabel}</span>
              <span>{user?.organization?.name ?? "Online Dashboard / School Management"}</span>
              <span>· Last login {PROFILE_EXTRAS.lastLogin}</span>
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 sm:flex sm:shrink-0">
          <Button size="sm" variant="outline" className="h-8 gap-1.5 text-[12px]" onClick={onEditProfile}>
            <UserCog className="h-3.5 w-3.5" /> Edit Profile
          </Button>
          <Button size="sm" variant="outline" className="h-8 gap-1.5 text-[12px]" onClick={onSecuritySettings}>
            <Shield className="h-3.5 w-3.5" /> Security Settings
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
