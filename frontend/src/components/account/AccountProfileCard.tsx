import { useState } from "react";
import { Camera, Pencil } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { PROFILE_EXTRAS } from "@/data/accountData";
import { useAuth } from "@/lib/auth";

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 py-2 text-[12.5px]">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium text-foreground">{value}</span>
    </div>
  );
}

export function AccountProfileCard() {
  const { user } = useAuth();
  const [editOpen, setEditOpen] = useState(false);
  const [form, setForm] = useState({
    fullName: user?.full_name ?? "",
    phone: PROFILE_EXTRAS.phone,
    department: PROFILE_EXTRAS.department,
    designation: PROFILE_EXTRAS.designation,
    timezone: PROFILE_EXTRAS.timezone,
    language: PROFILE_EXTRAS.language,
  });

  function saveProfile() {
    console.log("Profile updated:", form);
    toast.success("Profile updated successfully.");
    setEditOpen(false);
  }

  return (
    <Card className="rounded-2xl border-border/60 shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle className="text-[13px] font-semibold">My Account / Profile</CardTitle>
        <div className="flex gap-1.5">
          <Button variant="outline" size="sm" className="h-7 gap-1.5 text-[11.5px]" onClick={() => toast.info("Avatar upload — coming soon.")}>
            <Camera className="h-3.5 w-3.5" /> Change Avatar
          </Button>
          <Button variant="outline" size="sm" className="h-7 gap-1.5 text-[11.5px]" onClick={() => setEditOpen(true)}>
            <Pencil className="h-3.5 w-3.5" /> Edit Profile
          </Button>
        </div>
      </CardHeader>
      <CardContent className="divide-y divide-border/40 pt-0">
        <Row label="Full Name" value={user?.full_name || "—"} />
        <Row label="Email" value={user?.email || "—"} />
        <Row label="Phone" value={PROFILE_EXTRAS.phone} />
        <Row label="Role" value={user?.roles?.join(", ") || "Super Admin"} />
        <Row label="Department" value={PROFILE_EXTRAS.department} />
        <Row label="Designation" value={PROFILE_EXTRAS.designation} />
        <Row label="Organization" value={user?.organization?.name ?? "—"} />
        <Row label="Timezone" value={PROFILE_EXTRAS.timezone} />
        <Row label="Language" value={PROFILE_EXTRAS.language} />
        <Row label="Account Status" value="Active" />
        <Row label="Created Date" value={PROFILE_EXTRAS.createdDate} />
        <Row label="Last Updated" value={PROFILE_EXTRAS.lastUpdated} />
      </CardContent>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Profile</DialogTitle>
            <DialogDescription>Update your contact and profile information.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            {([
              ["fullName", "Full Name"], ["phone", "Phone"], ["department", "Department"],
              ["designation", "Designation"], ["timezone", "Timezone"], ["language", "Language"],
            ] as const).map(([key, label]) => (
              <div key={key}>
                <label className="text-[12px] font-medium text-foreground">{label}</label>
                <input
                  value={form[key]}
                  onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                  className="mt-1 h-9 w-full rounded-lg border border-input bg-background px-3 text-[12px] text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                />
              </div>
            ))}
            <div className="flex justify-end gap-2 border-t border-border/40 pt-4">
              <Button variant="outline" size="sm" className="h-9 text-[12px]" onClick={() => setEditOpen(false)}>Cancel</Button>
              <Button size="sm" className="h-9 text-[12px]" onClick={saveProfile}>Save Changes</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
