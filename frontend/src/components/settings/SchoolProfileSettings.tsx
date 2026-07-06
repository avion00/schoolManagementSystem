import { useState } from "react";
import { School, MapPin, Phone, Globe, FileText, Upload } from "lucide-react";
import { Input } from "@/components/ui/input";
import { SettingsSection, SettingsField, SaveBar } from "./SettingsSection";
import { SCHOOL_PROFILE } from "@/data/settingsData";
import type { SchoolProfile } from "@/data/settingsData";

function useSave() {
  const [saving, setSaving] = useState(false);
  const [saved,  setSaved]  = useState(false);
  async function save(data: unknown) {
    setSaving(true); setSaved(false);
    await new Promise((r) => setTimeout(r, 600));
    console.log("School profile saved:", data);
    setSaving(false); setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }
  return { saving, saved, save };
}

export function SchoolProfileSettings() {
  const [form, setForm] = useState<SchoolProfile>({ ...SCHOOL_PROFILE });
  const [errors, setErrors] = useState<Partial<Record<keyof SchoolProfile, string>>>({});
  const { saving, saved, save } = useSave();

  function set<K extends keyof SchoolProfile>(k: K, v: SchoolProfile[K]) {
    setForm((f) => ({ ...f, [k]: v }));
    setErrors((e) => ({ ...e, [k]: undefined }));
  }

  function validate(): boolean {
    const e: typeof errors = {};
    if (!form.name.trim())  e.name  = "School name is required";
    if (!form.email.trim()) e.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = "Invalid email format";
    if (!form.phone.trim()) e.phone = "Phone is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function handleSave() { if (validate()) save(form); }
  function handleReset() { setForm({ ...SCHOOL_PROFILE }); setErrors({}); }

  const inputCls = (err?: string) =>
    `h-9 text-[13px] ${err ? "border-rose-500 focus-visible:ring-rose-300" : ""}`;

  return (
    <div className="space-y-5">
      {/* Logo */}
      <SettingsSection icon={School} title="School Identity" subtitle="Logo, name, and basic information">
        <div className="space-y-4">
          {/* Logo upload */}
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl border-2 border-dashed border-border bg-muted/30 text-muted-foreground">
              <School className="h-7 w-7" />
            </div>
            <div>
              <button className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-border px-3 text-[12px] font-medium text-foreground hover:bg-muted transition-colors">
                <Upload className="h-3.5 w-3.5" />
                Upload Logo
              </button>
              <p className="mt-1 text-[11px] text-muted-foreground">PNG, JPG. Max 2 MB. Recommended 200×200px.</p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <SettingsField label="School Name" required error={errors.name}>
              <Input value={form.name} onChange={(e) => set("name", e.target.value)} className={inputCls(errors.name)} />
            </SettingsField>
            <SettingsField label="School Code">
              <Input value={form.code} onChange={(e) => set("code", e.target.value)} className={inputCls()} />
            </SettingsField>
            <SettingsField label="Tagline" hint="Shown in reports and letters">
              <Input value={form.tagline} onChange={(e) => set("tagline", e.target.value)} className={inputCls()} />
            </SettingsField>
            <SettingsField label="Established Year">
              <Input type="number" value={form.establishedYear} onChange={(e) => set("establishedYear", Number(e.target.value))} className={inputCls()} />
            </SettingsField>
            <SettingsField label="Principal Name">
              <Input value={form.principalName} onChange={(e) => set("principalName", e.target.value)} className={inputCls()} />
            </SettingsField>
            <SettingsField label="Registration Number">
              <Input value={form.registrationNumber} onChange={(e) => set("registrationNumber", e.target.value)} className={inputCls()} />
            </SettingsField>
          </div>
        </div>
      </SettingsSection>

      {/* Contact */}
      <SettingsSection icon={Phone} title="Contact Information" subtitle="Email, phone, and website">
        <div className="grid gap-4 sm:grid-cols-2">
          <SettingsField label="Email Address" required error={errors.email}>
            <Input type="email" value={form.email} onChange={(e) => set("email", e.target.value)} className={inputCls(errors.email)} />
          </SettingsField>
          <SettingsField label="Phone Number" required error={errors.phone}>
            <Input value={form.phone} onChange={(e) => set("phone", e.target.value)} className={inputCls(errors.phone)} />
          </SettingsField>
          <SettingsField label="Website">
            <div className="relative">
              <Globe className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
              <Input value={form.website} onChange={(e) => set("website", e.target.value)} className={`pl-8 ${inputCls()}`} />
            </div>
          </SettingsField>
          <SettingsField label="Tax / VAT Number" hint="Optional">
            <Input value={form.taxNumber} onChange={(e) => set("taxNumber", e.target.value)} className={inputCls()} />
          </SettingsField>
        </div>
      </SettingsSection>

      {/* Address */}
      <SettingsSection icon={MapPin} title="School Address" subtitle="Physical location details">
        <div className="grid gap-4 sm:grid-cols-2">
          <SettingsField label="Street Address">
            <Input value={form.address} onChange={(e) => set("address", e.target.value)} className={inputCls()} />
          </SettingsField>
          <SettingsField label="City">
            <Input value={form.city} onChange={(e) => set("city", e.target.value)} className={inputCls()} />
          </SettingsField>
          <SettingsField label="State / Province">
            <Input value={form.state} onChange={(e) => set("state", e.target.value)} className={inputCls()} />
          </SettingsField>
          <SettingsField label="Country">
            <Input value={form.country} onChange={(e) => set("country", e.target.value)} className={inputCls()} />
          </SettingsField>
          <SettingsField label="Postal Code">
            <Input value={form.postalCode} onChange={(e) => set("postalCode", e.target.value)} className={inputCls()} />
          </SettingsField>
        </div>
      </SettingsSection>

      {/* Legal */}
      <SettingsSection icon={FileText} title="Legal & Compliance">
        <div className="grid gap-4 sm:grid-cols-2">
          <SettingsField label="Registration Number">
            <Input value={form.registrationNumber} onChange={(e) => set("registrationNumber", e.target.value)} className={inputCls()} />
          </SettingsField>
          <SettingsField label="Tax / VAT Number">
            <Input value={form.taxNumber} onChange={(e) => set("taxNumber", e.target.value)} className={inputCls()} />
          </SettingsField>
        </div>
      </SettingsSection>

      <SaveBar onSave={handleSave} onReset={handleReset} saving={saving} saved={saved} />
    </div>
  );
}
