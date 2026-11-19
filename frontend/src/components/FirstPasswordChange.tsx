import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { KeyRound } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { errorMessage } from "@/api/http";
import { useChangePassword } from "@/api/settings";
import { useAuth } from "@/lib/auth";

const inputCls = "h-10 w-full rounded-lg border border-input bg-background px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring";

/** Shown instead of the app until a user with a one-time password sets their own. */
export function FirstPasswordChange() {
  const { user, logout } = useAuth();
  const qc = useQueryClient();
  const change = useChangePassword();
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (next !== confirm) { toast.error("The new passwords don't match."); return; }
    change.mutate({ current_password: current, new_password: next, sign_out_other_sessions: true }, {
      onSuccess: () => { toast.success("Password set. Welcome!"); qc.invalidateQueries({ queryKey: ["me"] }); },
      onError: (err) => toast.error(errorMessage(err)),
    });
  }

  return (
    <div className="grid min-h-screen place-items-center bg-background px-4">
      <form onSubmit={submit} className="w-full max-w-sm space-y-4 rounded-2xl border border-border/60 bg-card p-6 shadow-sm">
        <div className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10"><KeyRound className="h-4 w-4 text-primary" /></span>
          <div>
            <p className="text-[15px] font-semibold">Set your password</p>
            <p className="text-[12px] text-muted-foreground">{user?.email}</p>
          </div>
        </div>
        <p className="text-[12.5px] text-muted-foreground">You signed in with a one-time password. Choose your own to continue.</p>
        <input type="password" autoComplete="current-password" required value={current} onChange={(e) => setCurrent(e.target.value)} placeholder="One-time password" className={inputCls} />
        <input type="password" autoComplete="new-password" required value={next} onChange={(e) => setNext(e.target.value)} placeholder="New password (at least 10 characters)" className={inputCls} />
        <input type="password" autoComplete="new-password" required value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder="Confirm new password" className={inputCls} />
        <Button type="submit" className="w-full" disabled={change.isPending}>{change.isPending ? "Saving…" : "Set Password"}</Button>
        <button type="button" onClick={() => logout()} className="w-full text-center text-[12px] text-muted-foreground hover:underline">Sign out</button>
      </form>
    </div>
  );
}
