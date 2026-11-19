import { useState } from "react";
import { Send } from "lucide-react";
import { toast } from "sonner";

import { FormField, fieldInputClass, scrollToFirstError } from "@/components/billing/forms/FormField";
import { Button } from "@/components/ui/button";
import { VENDOR_CATEGORY_VALUE, useSaveVendor } from "@/api/billing";
import { errorMessage } from "@/api/http";
import { VENDOR_CATEGORY_OPTIONS, type Vendor, type VendorCategory } from "@/api/types/billing";

interface FormData {
  name: string; category: VendorCategory; contactPerson: string; phone: string; email: string;
  address: string; taxId: string; active: boolean;
}

export function VendorForm({ vendor, onSaved, onCancel }: { vendor?: Vendor; onSaved: () => void; onCancel?: () => void }) {
  const [form, setForm] = useState<FormData>(() => ({
    name: vendor?.vendorName ?? "", category: vendor?.category ?? "Other", contactPerson: vendor?.contactPerson ?? "",
    phone: vendor?.phone ?? "", email: vendor?.email ?? "", address: vendor?.address ?? "", taxId: vendor?.taxId ?? "",
    active: vendor ? vendor.status === "Active" : true,
  }));
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});
  const [attempt, setAttempt] = useState(0);
  const save = useSaveVendor();

  function set<K extends keyof FormData>(key: K, value: FormData[K]) {
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((e) => ({ ...e, [key]: undefined }));
  }

  function handleSubmit() {
    const e: typeof errors = {};
    if (!form.name.trim()) e.name = "Vendor name is required.";
    if (form.email && !/^\S+@\S+\.\S+$/.test(form.email)) e.email = "Enter a valid email.";
    setErrors(e);
    setAttempt((n) => n + 1);
    if (Object.values(e).some(Boolean)) { scrollToFirstError(e); return; }
    save.mutate({
      id: vendor?.id,
      body: {
        name: form.name.trim(), category: VENDOR_CATEGORY_VALUE[form.category], contact_person: form.contactPerson.trim(),
        phone: form.phone.trim(), email: form.email.trim(), address: form.address.trim(), tax_id: form.taxId.trim(),
        status: form.active ? "active" : "inactive",
      },
    }, {
      onSuccess: () => { toast.success(vendor ? "Vendor updated." : "Vendor added."); onSaved(); },
      onError: (err) => toast.error(errorMessage(err)),
    });
  }

  const input = (key: "name" | "contactPerson" | "phone" | "email" | "taxId", label: string, required = false) => (
    <FormField id={key} label={label} required={required} error={errors[key]} attempt={attempt}>
      <input id={key} value={form[key]} onChange={(e) => set(key, e.target.value)} className={fieldInputClass(!!errors[key])} />
    </FormField>
  );

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {input("name", "Vendor Name", true)}
        <FormField id="category" label="Category" attempt={attempt}>
          <select id="category" value={form.category} onChange={(e) => set("category", e.target.value as VendorCategory)} className={fieldInputClass()}>
            {VENDOR_CATEGORY_OPTIONS.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </FormField>
        {input("contactPerson", "Contact Person")}
        {input("phone", "Phone")}
        {input("email", "Email")}
        {input("taxId", "PAN / VAT No.")}
        <div className="sm:col-span-2">
          <FormField id="address" label="Address" attempt={attempt}>
            <textarea id="address" rows={2} value={form.address} onChange={(e) => set("address", e.target.value)}
              className="w-full resize-y rounded-lg border border-input bg-background px-3 py-2 text-[12px] text-foreground shadow-sm focus:outline-none focus:ring-1 focus:ring-ring" />
          </FormField>
        </div>
      </div>
      <label className="flex items-center gap-2 text-[12px] text-muted-foreground">
        <input type="checkbox" checked={form.active} onChange={(e) => set("active", e.target.checked)} className="h-3.5 w-3.5" />
        Active (inactive vendors can't be picked for new expenses)
      </label>
      <div className="flex justify-end gap-2 border-t border-border/40 pt-4">
        {onCancel && <Button variant="outline" size="sm" className="h-9 text-[12px]" onClick={onCancel}>Cancel</Button>}
        <Button size="sm" className="h-9 gap-1.5 text-[12px]" disabled={save.isPending} onClick={handleSubmit}>
          <Send className="h-3.5 w-3.5" /> {save.isPending ? "Saving…" : vendor ? "Save Changes" : "Add Vendor"}
        </Button>
      </div>
    </div>
  );
}
