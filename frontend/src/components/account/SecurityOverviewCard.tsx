import { useState } from "react";
import {
  AlertTriangle, FileClock, KeyRound, Laptop2, Mail, Phone, ShieldCheck, ShieldOff,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { SECURITY_SETTINGS } from "@/data/accountData";
import { cn } from "@/lib/utils";

function StatusRow({
  icon: Icon, label, ok, okLabel, badLabel,
}: {
  icon: typeof ShieldCheck; label: string; ok: boolean; okLabel: string; badLabel: string;
}) {
  return (
    <div className="flex items-center justify-between gap-3 py-2 text-[12.5px]">
      <span className="flex items-center gap-2 text-muted-foreground"><Icon className="h-3.5 w-3.5" /> {label}</span>
      <span className={cn("rounded-full px-2 py-0.5 text-[11px] font-medium",
        ok ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300"
           : "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300")}>
        {ok ? okLabel : badLabel}
      </span>
    </div>
  );
}

export function SecurityOverviewCard({ onManageSessions }: { onManageSessions: () => void }) {
  const navigate = useNavigate();
  const [twoFactor, setTwoFactor] = useState(SECURITY_SETTINGS.twoFactorEnabled);
  const [pwOpen, setPwOpen] = useState(false);
  const [pwForm, setPwForm] = useState({ current: "", next: "", confirm: "" });
  const [pwError, setPwError] = useState<string | null>(null);
  const [pwShake, setPwShake] = useState(false);

  function toggle2fa() {
    const next = !twoFactor;
    setTwoFactor(next);
    console.log("2FA toggled:", next);
    toast.success(next ? "Two-factor authentication enabled." : "Two-factor authentication disabled.");
  }

  function submitPasswordChange() {
    if (!pwForm.current || !pwForm.next || pwForm.next !== pwForm.confirm) {
      setPwError(!pwForm.next || !pwForm.current ? "All fields are required." : "New password and confirmation do not match.");
      setPwShake(true);
      window.setTimeout(() => setPwShake(false), 450);
      return;
    }
    console.log("Password changed");
    toast.success("Password changed successfully.");
    setPwOpen(false);
    setPwForm({ current: "", next: "", confirm: "" });
    setPwError(null);
  }

  return (
    <Card className="rounded-2xl border-border/60 shadow-sm">
      <CardHeader><CardTitle className="text-[13px] font-semibold">Security Overview</CardTitle></CardHeader>
      <CardContent className="divide-y divide-border/40 pt-0">
        <StatusRow icon={KeyRound} label="Password Status" ok={SECURITY_SETTINGS.passwordStatus === "Strong"} okLabel="Strong" badLabel={SECURITY_SETTINGS.passwordStatus} />
        <StatusRow icon={ShieldCheck} label="Two-Factor Authentication" ok={twoFactor} okLabel="Enabled" badLabel="Disabled" />
        <StatusRow icon={Mail} label="Email Verification" ok={SECURITY_SETTINGS.emailVerified} okLabel="Verified" badLabel="Unverified" />
        <StatusRow icon={Phone} label="Phone Verification" ok={SECURITY_SETTINGS.phoneVerified} okLabel="Verified" badLabel="Unverified" />
        <div className="flex items-center justify-between gap-3 py-2 text-[12.5px]">
          <span className="text-muted-foreground">Last Password Change</span>
          <span className="font-medium text-foreground">{SECURITY_SETTINGS.lastPasswordChange}</span>
        </div>
        <StatusRow icon={AlertTriangle} label="Login Alerts" ok={SECURITY_SETTINGS.loginAlertsEnabled} okLabel="On" badLabel="Off" />
        <div className="flex items-center justify-between gap-3 py-2 text-[12.5px]">
          <span className="flex items-center gap-2 text-muted-foreground"><Laptop2 className="h-3.5 w-3.5" /> Trusted Devices</span>
          <span className="font-medium text-foreground">{SECURITY_SETTINGS.trustedDeviceCount}</span>
        </div>
        <div className="flex items-center justify-between gap-3 py-2 text-[12.5px]">
          <span className="text-muted-foreground">Failed Login Attempts</span>
          <span className="font-medium text-rose-600 dark:text-rose-400">{SECURITY_SETTINGS.failedLoginCount}</span>
        </div>
      </CardContent>
      <div className="flex flex-wrap gap-2 border-t border-border/40 p-4">
        <Button variant="outline" size="sm" className="h-8 gap-1.5 text-[12px]" onClick={() => setPwOpen(true)}>
          <KeyRound className="h-3.5 w-3.5" /> Change Password
        </Button>
        <Button variant="outline" size="sm" className="h-8 gap-1.5 text-[12px]" onClick={toggle2fa}>
          {twoFactor ? <ShieldOff className="h-3.5 w-3.5" /> : <ShieldCheck className="h-3.5 w-3.5" />}
          {twoFactor ? "Disable 2FA" : "Enable 2FA"}
        </Button>
        <Button variant="outline" size="sm" className="h-8 gap-1.5 text-[12px]" onClick={onManageSessions}>
          <Laptop2 className="h-3.5 w-3.5" /> Manage Trusted Devices
        </Button>
        <Button variant="outline" size="sm" className="h-8 gap-1.5 text-[12px]" onClick={() => navigate("/settings/audit-logs")}>
          <FileClock className="h-3.5 w-3.5" /> View Security Logs
        </Button>
      </div>

      <Dialog open={pwOpen} onOpenChange={setPwOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change Password</DialogTitle>
            <DialogDescription>Choose a strong password you don't use elsewhere.</DialogDescription>
          </DialogHeader>
          <div className={cn("space-y-3", pwShake && "t-shake")}>
            <div>
              <label className="text-[12px] font-medium text-foreground">Current Password</label>
              <input type="password" value={pwForm.current} onChange={(e) => { setPwForm((f) => ({ ...f, current: e.target.value })); setPwError(null); }}
                className="mt-1 h-9 w-full rounded-lg border border-input bg-background px-3 text-[12px] text-foreground focus:outline-none focus:ring-1 focus:ring-ring" />
            </div>
            <div>
              <label className="text-[12px] font-medium text-foreground">New Password</label>
              <input type="password" value={pwForm.next} onChange={(e) => { setPwForm((f) => ({ ...f, next: e.target.value })); setPwError(null); }}
                className="mt-1 h-9 w-full rounded-lg border border-input bg-background px-3 text-[12px] text-foreground focus:outline-none focus:ring-1 focus:ring-ring" />
            </div>
            <div>
              <label className="text-[12px] font-medium text-foreground">Confirm New Password</label>
              <input type="password" value={pwForm.confirm} onChange={(e) => { setPwForm((f) => ({ ...f, confirm: e.target.value })); setPwError(null); }}
                className="mt-1 h-9 w-full rounded-lg border border-input bg-background px-3 text-[12px] text-foreground focus:outline-none focus:ring-1 focus:ring-ring" />
            </div>
            {pwError && <p className="text-[11px] text-rose-500">{pwError}</p>}
            <div className="flex justify-end gap-2 border-t border-border/40 pt-4">
              <Button variant="outline" size="sm" className="h-9 text-[12px]" onClick={() => setPwOpen(false)}>Cancel</Button>
              <Button size="sm" className="h-9 text-[12px]" onClick={submitPasswordChange}>Update Password</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
