import { useState } from "react";
import { Pencil } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { errorMessage } from "@/api/http";
import { useMe } from "@/api/settings";

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 py-2 text-[12.5px]">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium text-foreground">{value}</span>
    </div>
  );
}

const LANGUAGES: Record<string, string> = { en: "English", ne: "नेपाली (Nepali)" };

export function AccountProfileCard() {
  const { query, save } = useMe();
  const me = query.data;
  const [editOpen, setEditOpen] = useState(false);
  const [form, setForm] = useState({ full_name: "", phone: "", timezone: "", language: "en" });

  function openEdit() {
    if (!me) return;
    setForm({ full_name: me.full_name, phone: me.phone ?? "", timezone: me.timezone, language: me.language });
    setEditOpen(true);
  }

  function saveProfile() {
    if (!form.full_name.trim()) { toast.error("Your name is required."); return; }
    save.mutate({ ...form, full_name: form.full_name.trim(), phone: form.phone.trim() }, {
      onSuccess: () => { toast.success("Profile updated."); setEditOpen(false); },
      onError: (e) => toast.error(errorMessage(e)),
    });
  }

  return (
    <Card className="rounded-2xl border-border/60 shadow-elevated">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-[14px] font-semibold">Profile</CardTitle>
        <Button variant="outline" size="sm" className="h-7 gap-1.5 text-[11.5px]" onClick={openEdit} disabled={!me}>
          <Pencil className="h-3.5 w-3.5" /> Edit
        </Button>
      </CardHeader>
      <CardContent className="divide-y divide-border/50 pt-0">
        <Row label="Full Name" value={me?.full_name || "—"} />
        <Row label="Email" value={me?.email || "—"} />
        <Row label="Phone" value={me?.phone || "—"} />
        <Row label="Role" value={me?.roles?.join(", ") || (me?.is_platform_admin ? "Platform Admin" : "—")} />
        <Row label="Organization" value={me?.organization?.name ?? "—"} />
        <Row label="Timezone" value={me?.timezone || "—"} />
        <Row label="Language" value={LANGUAGES[me?.language ?? ""] ?? me?.language ?? "—"} />
        <Row label="Password last changed" value={me?.password_changed_at ? new Date(me.password_changed_at).toLocaleDateString() : "—"} />
      </CardContent>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Profile</DialogTitle>
            <DialogDescription>Your email is your sign-in and can only be changed by an administrator.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            {([["full_name", "Full Name"], ["phone", "Phone"], ["timezone", "Timezone"]] as const).map(([key, label]) => (
              <div key={key}>
                <label className="text-[12px] font-medium text-foreground">{label}</label>
                <input value={form[key]} onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                  className="mt-1 h-9 w-full rounded-lg border border-input bg-background px-3 text-[12px] text-foreground focus:outline-none focus:ring-1 focus:ring-ring" />
              </div>
            ))}
            <div>
              <label className="text-[12px] font-medium text-foreground">Language</label>
              <select value={form.language} onChange={(e) => setForm((f) => ({ ...f, language: e.target.value }))}
                className="mt-1 h-9 w-full rounded-lg border border-input bg-background px-3 text-[12px] text-foreground">
                {Object.entries(LANGUAGES).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </select>
            </div>
            <div className="flex justify-end gap-2 border-t border-border/40 pt-4">
              <Button variant="outline" size="sm" className="h-9 text-[12px]" onClick={() => setEditOpen(false)}>Cancel</Button>
              <Button size="sm" className="h-9 text-[12px]" disabled={save.isPending} onClick={saveProfile}>
                {save.isPending ? "Saving…" : "Save Changes"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
