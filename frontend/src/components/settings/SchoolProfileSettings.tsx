import { useEffect, useRef, useState } from "react";
import { School, MapPin, FileText, Upload } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { PremiumSkeleton } from "@/components/ui/PremiumSkeleton";
import { SettingsSection, SettingsField, SaveBar } from "./SettingsSection";
import { fileObjectUrl, uploadFile } from "@/api/files";
import { errorMessage } from "@/api/http";
import { useSchoolProfile, type SchoolProfile } from "@/api/settings";
import { useAuth } from "@/lib/auth";

type Form = Pick<SchoolProfile, "name" | "principal_name" | "email" | "phone" | "website" | "address" | "city" | "state" | "country" | "postal_code" | "registration_number" | "tax_number">;
const FIELDS: (keyof Form)[] = ["name", "principal_name", "email", "phone", "website", "address", "city", "state", "country", "postal_code", "registration_number", "tax_number"];

function toForm(p: SchoolProfile): Form {
  return Object.fromEntries(FIELDS.map((k) => [k, (p[k] as string | undefined) ?? ""])) as Form;
}

/** The school's own details: shown on invoices, receipts, report cards, admit cards and notices. */
export function SchoolProfileSettings() {
  const { query, save } = useSchoolProfile();
  const { hasPermission } = useAuth();
  const canEdit = hasPermission("settings.manage");
  const [form, setForm] = useState<Form | null>(null);
  const [errors, setErrors] = useState<Partial<Record<keyof Form, string>>>({});
  const [saved, setSaved] = useState(false);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => { if (query.data && !form) setForm(toForm(query.data)); }, [query.data, form]);
  useEffect(() => {
    const url = query.data?.logo?.download_url;
    if (url) fileObjectUrl(url).then(setLogoUrl).catch(() => setLogoUrl(null));
  }, [query.data?.logo?.download_url]);

  if (query.isLoading || !form) return <PremiumSkeleton className="h-96 w-full rounded-2xl" />;

  function set<K extends keyof Form>(k: K, v: string) {
    setForm((f) => (f ? { ...f, [k]: v } : f));
    setErrors((e) => ({ ...e, [k]: undefined }));
  }

  function handleSave() {
    if (!form) return;
    const e: typeof errors = {};
    if (!form.name?.trim()) e.name = "School name is required";
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = "Invalid email format";
    setErrors(e);
    if (Object.keys(e).length) return;
    save.mutate(form, {
      onSuccess: () => { setSaved(true); setTimeout(() => setSaved(false), 3000); toast.success("School profile saved."); },
      onError: (err) => toast.error(errorMessage(err)),
    });
  }

  async function uploadLogo(file: File) {
    try {
      const stored = await uploadFile(file);
      await save.mutateAsync({ logo_id: stored.id });
      toast.success("Logo updated.");
    } catch (err) {
      toast.error(errorMessage(err));
    }
  }

  const inputCls = (err?: string) => `h-9 text-[13px] ${err ? "border-rose-500 focus-visible:ring-rose-300" : ""}`;
  const text = (k: keyof Form, label: string, opts: { required?: boolean; hint?: string; type?: string } = {}) => (
    <SettingsField label={label} required={opts.required} hint={opts.hint} error={errors[k]}>
      <Input type={opts.type} value={form[k] ?? ""} disabled={!canEdit} onChange={(e) => set(k, e.target.value)} className={inputCls(errors[k])} />
    </SettingsField>
  );

  return (
    <div className="space-y-5">
      <SettingsSection icon={School} title="School Identity" subtitle="Used on invoices, receipts, report cards, admit cards and notices">
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed border-border bg-muted/30 text-muted-foreground">
              {logoUrl ? <img src={logoUrl} alt="School logo" className="h-full w-full object-contain" /> : <School className="h-7 w-7" />}
            </div>
            {canEdit && (
              <div>
                <button type="button" onClick={() => fileRef.current?.click()}
                  className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-border px-3 text-[12px] font-medium text-foreground hover:bg-muted transition-colors">
                  <Upload className="h-3.5 w-3.5" />
                  {save.isPending ? "Uploading…" : "Upload Logo"}
                </button>
                <input ref={fileRef} type="file" accept="image/png,image/jpeg,image/webp" className="hidden"
                  onChange={(e) => { const f = e.target.files?.[0]; e.target.value = ""; if (f) void uploadLogo(f); }} />
                <p className="mt-1 text-[11px] text-muted-foreground">PNG or JPG. Recommended 200×200px.</p>
              </div>
            )}
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {text("name", "School Name", { required: true })}
            <SettingsField label="School Code" hint="Set when the school was created">
              <Input value={query.data?.code ?? ""} disabled className={inputCls()} />
            </SettingsField>
            {text("principal_name", "Principal Name")}
            {text("email", "Email", { type: "email" })}
            {text("phone", "Phone")}
            {text("website", "Website")}
          </div>
        </div>
      </SettingsSection>

      <SettingsSection icon={MapPin} title="Address">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">{text("address", "Street Address")}</div>
          {text("city", "City")}
          {text("state", "State / Province")}
          {text("country", "Country")}
          {text("postal_code", "Postal Code")}
        </div>
      </SettingsSection>

      <SettingsSection icon={FileText} title="Registration">
        <div className="grid gap-4 sm:grid-cols-2">
          {text("registration_number", "Registration Number")}
          {text("tax_number", "PAN / VAT Number")}
        </div>
      </SettingsSection>

      {canEdit && <SaveBar onSave={handleSave} onReset={() => { if (query.data) setForm(toForm(query.data)); setErrors({}); }} saving={save.isPending} saved={saved} />}
    </div>
  );
}
