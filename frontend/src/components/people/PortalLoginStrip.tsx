import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Copy, KeyRound, UserCheck } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { PremiumCard } from "@/components/ui/PremiumCard";
import { errorMessage, get, post } from "@/api/http";
import { useAuth } from "@/lib/auth";

type Kind = "students" | "teachers" | "guardians";
const WHO: Record<Kind, string> = { students: "student", teachers: "teacher", guardians: "parent" };

/** Shows whether this person can sign in, and lets staff create their portal login. */
export function PortalLoginStrip({ kind, id }: { kind: Kind; id: string }) {
  const { hasPermission } = useAuth();
  const qc = useQueryClient();
  const record = useQuery({
    queryKey: ["portal-login", kind, id],
    queryFn: () => get<{ has_login: boolean; email?: string }>(`/${kind}/${id}/`),
  });
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [created, setCreated] = useState<{ email: string; temporary_password: string } | null>(null);
  const create = useMutation({
    mutationFn: () => post<{ email: string; temporary_password: string }>(`/${kind}/${id}/create-login/`, email.trim() ? { email: email.trim() } : {}),
    onSuccess: (d) => { setCreated(d); qc.invalidateQueries({ queryKey: ["portal-login", kind, id] }); },
    onError: (e) => toast.error(errorMessage(e)),
  });

  if (!record.data) return null;
  const canCreate = hasPermission("user.manage");

  return (
    <PremiumCard className="flex flex-wrap items-center gap-3 px-4 py-3">
      {record.data.has_login ? (
        <><UserCheck className="h-4 w-4 text-emerald-600" /><span className="text-[12.5px]">This {WHO[kind]} has a portal login.</span></>
      ) : (
        <>
          <KeyRound className="h-4 w-4 text-muted-foreground" />
          <span className="flex-1 text-[12.5px] text-muted-foreground">No portal login yet. Create one so this {WHO[kind]} can sign in.</span>
          {canCreate && (
            <Button size="sm" className="h-8" onClick={() => { setEmail(record.data?.email ?? ""); setCreated(null); setOpen(true); }}>Create Login</Button>
          )}
        </>
      )}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>{created ? "Login created" : "Create portal login"}</DialogTitle>
            <DialogDescription>
              {created ? "Share these details privately. They'll be asked to choose their own password at first sign-in." : "They will sign in with this email."}
            </DialogDescription>
          </DialogHeader>
          {created ? (
            <div className="space-y-2 text-[13px]">
              <p>Email: <span className="font-medium">{created.email}</span></p>
              <p className="flex items-center gap-2">One-time password: <code className="rounded bg-muted px-2 py-0.5 font-mono">{created.temporary_password}</code>
                <button type="button" title="Copy" onClick={() => navigator.clipboard.writeText(created.temporary_password).then(() => toast.success("Copied."))}><Copy className="h-3.5 w-3.5" /></button>
              </p>
              <Button className="mt-2 w-full" onClick={() => setOpen(false)}>Done</Button>
            </div>
          ) : (
            <div className="space-y-3">
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email address"
                className="h-9 w-full rounded-lg border border-input bg-background px-3 text-[13px] focus:outline-none focus:ring-1 focus:ring-ring" />
              <Button className="w-full" disabled={create.isPending || !email.trim()} onClick={() => create.mutate()}>
                {create.isPending ? "Creating…" : "Create Login"}
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </PremiumCard>
  );
}
