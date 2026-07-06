import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getMyProfile, updateMyProfile } from "@/lib/portal";

function Field({ label, value }: { label: string; value: string | null }) {
  return (
    <div className="space-y-1">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-sm font-medium">{value || "—"}</p>
    </div>
  );
}

export function StudentProfilePage() {
  const queryClient = useQueryClient();
  const { data } = useQuery({ queryKey: ["my-profile"], queryFn: getMyProfile });
  const [form, setForm] = useState({ phone: "", email: "", address: "" });
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (data) setForm({ phone: data.phone, email: data.email, address: data.address });
  }, [data]);

  const mutation = useMutation({
    mutationFn: () => updateMyProfile(form),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-profile"] });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    },
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">My Profile</h1>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{data?.full_name ?? "—"}</CardTitle>
          <CardDescription>Admission {data?.admission_number ?? "—"}</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          <Field label="Class" value={data?.class_level_name ?? null} />
          <Field label="Section" value={data?.section_name ?? null} />
          <Field label="Roll number" value={data?.roll_number ?? null} />
          <Field label="Academic year" value={data?.academic_year_name ?? null} />
          <Field label="Date of birth" value={data?.date_of_birth ?? null} />
          <Field label="Gender" value={data?.gender ?? null} />
          <Field label="Blood group" value={data?.blood_group ?? null} />
          <Field label="Guardian" value={data?.guardian_name ?? null} />
          <Field label="Status" value={data?.status ?? null} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Contact details</CardTitle>
          <CardDescription>You can update these.</CardDescription>
        </CardHeader>
        <CardContent>
          <form
            className="grid gap-4 sm:grid-cols-2"
            onSubmit={(e) => {
              e.preventDefault();
              mutation.mutate();
            }}
          >
            <div className="space-y-2">
              <Label>Phone</Label>
              <Input value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input type="email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label>Address</Label>
              <Input value={form.address} onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))} />
            </div>
            <div className="flex items-center gap-3 sm:col-span-2">
              <Button type="submit" disabled={mutation.isPending}>
                {mutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                Save changes
              </Button>
              {saved && <span className="text-sm text-emerald-600">Saved.</span>}
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
