import { useState } from "react";
import {
  FileClock, KeyRound, Laptop2, Mail, ShieldCheck,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { errorMessage } from "@/api/http";
import { useChangePassword, useMe, useSessions } from "@/api/settings";
import { cn } from "@/lib/utils";

export function SecurityOverviewCard({ onManageSessions }: { onManageSessions: () => void }) {
  const navigate = useNavigate();
  const me = useMe().query.data;
  const sessions = useSessions().query.data ?? [];
  const change = useChangePassword();
  const [pwOpen, setPwOpen] = useState(false);
  const [pwForm, setPwForm] = useState({ current: "", next: "", confirm: "", signOutOthers: true });
  const [pwError, setPwError] = useState<string | null>(null);
  const [pwShake, setPwShake] = useState(false);

  function shake(msg: string) {
    setPwError(msg);
    setPwShake(true);
    window.setTimeout(() => setPwShake(false), 450);
  }

  function submitPasswordChange() {
    if (!pwForm.current || !pwForm.next) return shake("All fields are required.");
    if (pwForm.next !== pwForm.confirm) return shake("New password and confirmation do not match.");
    change.mutate({ current_password: pwForm.current, new_password: pwForm.next, sign_out_other_sessions: pwForm.signOutOthers }, {
      onSuccess: (r) => {
        toast.success(r.other_sessions_revoked ? `Password changed. Signed out ${r.other_sessions_revoked} other session(s).` : "Password changed.");
        setPwOpen(false);
        setPwForm({ current: "", next: "", confirm: "", signOutOthers: true });
        setPwError(null);
      },
      onError: (e) => shake(errorMessage(e)),
    });
  }

  return (
    <Card className="rounded-2xl border-border/60 shadow-elevated">
      <CardHeader><CardTitle className="text-[13px] font-semibold">Security Overview</CardTitle></CardHeader>
      <CardContent className="divide-y divide-border/40 pt-0">
        <div className="flex items-center justify-between gap-3 py-2 text-[12.5px]">
          <span className="flex items-center gap-2 text-muted-foreground"><KeyRound className="h-3.5 w-3.5" /> Last Password Change</span>
          <span className="font-medium text-foreground">{me?.password_changed_at ? new Date(me.password_changed_at).toLocaleDateString() : "Not recorded"}</span>
        </div>
        <div className="flex items-center justify-between gap-3 py-2 text-[12.5px]">
          <span className="flex items-center gap-2 text-muted-foreground"><Mail className="h-3.5 w-3.5" /> Sign-in Email</span>
          <span className="font-medium text-foreground">{me?.email ?? "—"}</span>
        </div>
        <div className="flex items-center justify-between gap-3 py-2 text-[12.5px]">
          <span className="flex items-center gap-2 text-muted-foreground"><Laptop2 className="h-3.5 w-3.5" /> Signed-in Devices</span>
          <span className="font-medium text-foreground">{sessions.length}</span>
        </div>
        <div className="flex items-center justify-between gap-3 py-2 text-[12.5px]">
          <span className="flex items-center gap-2 text-muted-foreground"><ShieldCheck className="h-3.5 w-3.5" /> Lockout Protection</span>
          <span className="font-medium text-foreground">On (set by your school)</span>
        </div>
      </CardContent>
      <div className="flex flex-wrap gap-2 border-t border-border/40 p-4">
        <Button variant="outline" size="sm" className="h-8 gap-1.5 text-[12px]" onClick={() => setPwOpen(true)}>
          <KeyRound className="h-3.5 w-3.5" /> Change Password
        </Button>
        <Button variant="outline" size="sm" className="h-8 gap-1.5 text-[12px]" onClick={onManageSessions}>
          <Laptop2 className="h-3.5 w-3.5" /> Manage Signed-in Devices
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
            <label className="flex items-center gap-2 text-[12px] text-muted-foreground">
              <input type="checkbox" checked={pwForm.signOutOthers} onChange={(e) => setPwForm((f) => ({ ...f, signOutOthers: e.target.checked }))} className="h-3.5 w-3.5" />
              Sign out my other devices
            </label>
            {pwError && <p className="text-[11px] text-rose-500">{pwError}</p>}
            <div className="flex justify-end gap-2 border-t border-border/40 pt-4">
              <Button variant="outline" size="sm" className="h-9 text-[12px]" onClick={() => setPwOpen(false)}>Cancel</Button>
              <Button size="sm" className="h-9 text-[12px]" disabled={change.isPending} onClick={submitPasswordChange}>{change.isPending ? "Updating…" : "Update Password"}</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
