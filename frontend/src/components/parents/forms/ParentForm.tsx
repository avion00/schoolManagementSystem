import { useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  User, Phone, Users, FileText, StickyNote,
  Check, X, Plus, Trash2
} from "lucide-react";
import { toast } from "sonner";

import { FormSection } from "@/components/students/forms/FormSection";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PARENTS } from "@/data/parentsData";
import {
  OCCUPATION_OPTIONS, RELATION_OPTIONS, STATUS_OPTIONS,
  CLASS_OPTIONS, SECTION_OPTIONS,
} from "@/data/parentsData";

interface ParentFormData {
  name: string;
  gender: string;
  relation: string;
  occupation: string;
  parentId: string;
  guardianCode: string;
  status: string;
  email: string;
  phone: string;
  alternatePhone: string;
  emergencyContact: string;
  emergencyRelation: string;
  presentAddress: string;
  permanentAddress: string;
  sameAddress: boolean;
  linkedChildren: LinkedChildDraft[];
  hasCitizenshipCertificate: boolean;
  hasGuardianPhoto: boolean;
  hasAddressProof: boolean;
  hasRelationshipProof: boolean;
  hasEmergencyForm: boolean;
  adminNotes: string;
  specialInstructions: string;
}

interface LinkedChildDraft {
  tempId: string;
  studentId: string;
  name: string;
  className: string;
  section: string;
  roll: string;
}

const DOCUMENT_FIELDS: { key: keyof Pick<ParentFormData, "hasCitizenshipCertificate" | "hasGuardianPhoto" | "hasAddressProof" | "hasRelationshipProof" | "hasEmergencyForm">; label: string }[] = [
  { key: "hasCitizenshipCertificate", label: "Parent Citizenship Certificate" },
  { key: "hasGuardianPhoto",          label: "Guardian Photo"                  },
  { key: "hasAddressProof",           label: "Address Proof"                   },
  { key: "hasRelationshipProof",      label: "Relationship Proof"              },
  { key: "hasEmergencyForm",          label: "Emergency Contact Form"          },
];

function Field({ label, required, error, children }: {
  label: string; required?: boolean; error?: string; children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-[12.5px]">
        {label}{required && <span className="ml-0.5 text-destructive">*</span>}
      </Label>
      {children}
      {error && <p className="text-[11px] text-destructive">{error}</p>}
    </div>
  );
}

function Select({ value, onChange, options, placeholder, error }: {
  value: string; onChange: (v: string) => void; options: string[];
  placeholder?: string; error?: boolean;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={`flex h-9 w-full rounded-md border px-3 py-1 text-sm shadow-sm bg-background transition-colors focus:outline-none focus:ring-1 focus:ring-ring ${error ? "border-destructive" : "border-input"}`}
    >
      <option value="">{placeholder ?? "Select…"}</option>
      {options.map((o) => <option key={o} value={o}>{o}</option>)}
    </select>
  );
}

const EMPTY: ParentFormData = {
  name: "", gender: "", relation: "", occupation: "", parentId: "", guardianCode: "", status: "active",
  email: "", phone: "", alternatePhone: "", emergencyContact: "", emergencyRelation: "",
  presentAddress: "", permanentAddress: "", sameAddress: false,
  linkedChildren: [],
  hasCitizenshipCertificate: false, hasGuardianPhoto: false, hasAddressProof: false,
  hasRelationshipProof: false, hasEmergencyForm: false,
  adminNotes: "", specialInstructions: "",
};

type Errors = Partial<Record<string, string>>;

function validate(form: ParentFormData): Errors {
  const e: Errors = {};
  if (!form.name.trim())          e.name = "Full name is required.";
  if (!form.gender)               e.gender = "Gender is required.";
  if (!form.relation)             e.relation = "Relation is required.";
  if (!form.phone.trim())         e.phone = "Phone is required.";
  if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
    e.email = "Enter a valid email.";
  return e;
}

function sectionErrors(errors: Errors, keys: string[]) {
  return keys.filter((k) => errors[k]).length;
}

export function ParentForm({ mode }: { mode: "create" | "edit" }) {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  const prefill = (): ParentFormData => {
    if (mode === "edit" && id) {
      const p = PARENTS.find((x) => x.id === Number(id));
      if (p) {
        return {
          ...EMPTY,
          name: p.name,
          gender: p.gender,
          relation: p.relation,
          occupation: p.occupation,
          parentId: p.parentId,
          guardianCode: p.guardianCode,
          status: p.status,
          email: p.email ?? "",
          phone: p.phone,
          alternatePhone: p.alternatePhone ?? "",
          presentAddress: p.address,
          linkedChildren: p.linkedChildren.map((c) => ({
            tempId: String(c.id),
            studentId: String(c.studentId),
            name: c.name,
            className: c.className,
            section: c.section,
            roll: String(c.roll),
          })),
        };
      }
    }
    return { ...EMPTY };
  };

  const [form, setForm] = useState<ParentFormData>(prefill);
  const [errors, setErrors] = useState<Errors>({});

  function set<K extends keyof ParentFormData>(key: K, val: ParentFormData[K]) {
    setForm((f) => ({ ...f, [key]: val }));
    setErrors((e) => { const n = { ...e }; delete n[key]; return n; });
  }

  function addChild() {
    setForm((f) => ({
      ...f,
      linkedChildren: [
        ...f.linkedChildren,
        { tempId: Date.now().toString(), studentId: "", name: "", className: "", section: "", roll: "" },
      ],
    }));
  }

  function removeChild(tempId: string) {
    setForm((f) => ({ ...f, linkedChildren: f.linkedChildren.filter((c) => c.tempId !== tempId) }));
  }

  function updateChild(tempId: string, key: keyof LinkedChildDraft, value: string) {
    setForm((f) => ({
      ...f,
      linkedChildren: f.linkedChildren.map((c) => c.tempId === tempId ? { ...c, [key]: value } : c),
    }));
  }

  function handleSameAddress(checked: boolean) {
    setForm((f) => ({
      ...f,
      sameAddress: checked,
      permanentAddress: checked ? f.presentAddress : f.permanentAddress,
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs = validate(form);
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      const firstErrorKey = Object.keys(errs)[0];
      const el = formRef.current?.querySelector(`[data-field="${firstErrorKey}"]`);
      el?.scrollIntoView({ behavior: "smooth", block: "center" });
      toast.error("Please fix the errors before saving.");
      return;
    }
    setSaving(true);
    await new Promise((r) => setTimeout(r, 600));
    setSaving(false);
    toast.success(mode === "create" ? "Parent added successfully!" : "Parent updated successfully!");
    navigate("/parents");
  }

  const INFO_KEYS   = ["name", "gender", "relation", "occupation"];
  const CONTACT_KEYS = ["phone", "email", "presentAddress"];

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="space-y-4 pb-12">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-foreground">
            {mode === "create" ? "Add New Parent" : "Edit Parent"}
          </h2>
          <p className="text-[13px] text-muted-foreground">
            {mode === "create" ? "Fill in parent/guardian details below." : "Update guardian information."}
          </p>
        </div>
        <div className="flex gap-2">
          <Button type="button" variant="outline" onClick={() => navigate(-1)}>
            <X className="mr-1.5 h-4 w-4" />Cancel
          </Button>
          <Button type="submit" disabled={saving}>
            {saving ? (
              <span className="flex items-center gap-1.5"><span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />Saving…</span>
            ) : (
              <><Check className="mr-1.5 h-4 w-4" />{mode === "create" ? "Add Parent" : "Save Changes"}</>
            )}
          </Button>
        </div>
      </div>

      {/* A. Parent Info */}
      <FormSection icon={User} title="Parent / Guardian Information"
        subtitle="Basic personal details"
        errorCount={sectionErrors(errors, INFO_KEYS)}>
        <div className="grid gap-4 sm:grid-cols-2">
          <div data-field="name">
            <Field label="Full Name" required error={errors.name}>
              <Input value={form.name} onChange={(e) => set("name", e.target.value)}
                placeholder="e.g. Kazi Fahim Hossain" className={errors.name ? "border-destructive" : ""} />
            </Field>
          </div>
          <div data-field="gender">
            <Field label="Gender" required error={errors.gender}>
              <Select value={form.gender} onChange={(v) => set("gender", v)}
                options={["Male", "Female", "Other"]} error={!!errors.gender} />
            </Field>
          </div>
          <div data-field="relation">
            <Field label="Relation to Student" required error={errors.relation}>
              <Select value={form.relation} onChange={(v) => set("relation", v)}
                options={RELATION_OPTIONS} error={!!errors.relation} />
            </Field>
          </div>
          <Field label="Occupation">
            <Select value={form.occupation} onChange={(v) => set("occupation", v)}
              options={OCCUPATION_OPTIONS} />
          </Field>
          <Field label="Parent ID">
            <Input value={form.parentId} onChange={(e) => set("parentId", e.target.value)}
              placeholder="PAR-2026-0001" />
          </Field>
          <Field label="Guardian Code">
            <Input value={form.guardianCode} onChange={(e) => set("guardianCode", e.target.value)}
              placeholder="GRD-001" />
          </Field>
          <Field label="Status">
            <Select value={form.status} onChange={(v) => set("status", v)}
              options={STATUS_OPTIONS} />
          </Field>
        </div>
      </FormSection>

      {/* B. Contact */}
      <FormSection icon={Phone} title="Contact Information"
        subtitle="Phone, email and address details"
        errorCount={sectionErrors(errors, CONTACT_KEYS)}>
        <div className="grid gap-4 sm:grid-cols-2">
          <div data-field="phone">
            <Field label="Phone Number" required error={errors.phone}>
              <Input value={form.phone} onChange={(e) => set("phone", e.target.value)}
                placeholder="+977-9841000000" className={errors.phone ? "border-destructive" : ""} />
            </Field>
          </div>
          <Field label="Alternate Phone">
            <Input value={form.alternatePhone} onChange={(e) => set("alternatePhone", e.target.value)}
              placeholder="+977-9801000000" />
          </Field>
          <div data-field="email" className="sm:col-span-2">
            <Field label="Email Address" error={errors.email}>
              <Input value={form.email} onChange={(e) => set("email", e.target.value)}
                placeholder="parent@example.com" className={errors.email ? "border-destructive" : ""} />
            </Field>
          </div>
          <Field label="Emergency Contact">
            <Input value={form.emergencyContact} onChange={(e) => set("emergencyContact", e.target.value)}
              placeholder="+977-9841111222" />
          </Field>
          <Field label="Emergency Contact Relation">
            <Input value={form.emergencyRelation} onChange={(e) => set("emergencyRelation", e.target.value)}
              placeholder="e.g. Brother" />
          </Field>
          <div className="sm:col-span-2">
            <Field label="Present Address">
              <textarea value={form.presentAddress} onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => set("presentAddress", e.target.value)}
                placeholder="Current address…" rows={2}
                className="flex min-h-[60px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring" />
            </Field>
          </div>
          <div className="sm:col-span-2 flex items-center gap-2">
            <input
              id="sameAddr"
              type="checkbox"
              checked={form.sameAddress}
              onChange={(e) => handleSameAddress(e.target.checked)}
              className="h-4 w-4 rounded border-input accent-primary"
            />
            <label htmlFor="sameAddr" className="text-[12.5px] text-muted-foreground cursor-pointer">
              Permanent address same as present address
            </label>
          </div>
          {!form.sameAddress && (
            <div className="sm:col-span-2">
              <Field label="Permanent Address">
                <textarea value={form.permanentAddress} onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => set("permanentAddress", e.target.value)}
                  placeholder="Permanent address…" rows={2}
                  className="flex min-h-[60px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring" />
              </Field>
            </div>
          )}
        </div>
      </FormSection>

      {/* C. Linked Children */}
      <FormSection icon={Users} title="Linked Children"
        subtitle="Students associated with this parent" defaultOpen>
        <div className="space-y-4">
          {form.linkedChildren.length === 0 && (
            <p className="text-[12.5px] text-muted-foreground">No children linked yet. Click "Add Child" below.</p>
          )}
          {form.linkedChildren.map((child, idx) => (
            <div key={child.tempId} className="relative rounded-xl border border-border/60 bg-muted/30 p-4">
              <button
                type="button"
                className="absolute right-3 top-3 rounded-md p-1 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                onClick={() => removeChild(child.tempId)}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
              <p className="mb-3 text-[12px] font-semibold text-muted-foreground">Child {idx + 1}</p>
              <div className="grid gap-3 sm:grid-cols-3">
                <Field label="Student ID">
                  <Input value={child.studentId} onChange={(e) => updateChild(child.tempId, "studentId", e.target.value)}
                    placeholder="Student ID" />
                </Field>
                <Field label="Full Name">
                  <Input value={child.name} onChange={(e) => updateChild(child.tempId, "name", e.target.value)}
                    placeholder="Student name" />
                </Field>
                <Field label="Class">
                  <Select value={child.className} onChange={(v) => updateChild(child.tempId, "className", v)}
                    options={CLASS_OPTIONS} />
                </Field>
                <Field label="Section">
                  <Select value={child.section} onChange={(v) => updateChild(child.tempId, "section", v)}
                    options={SECTION_OPTIONS} />
                </Field>
                <Field label="Roll No">
                  <Input value={child.roll} onChange={(e) => updateChild(child.tempId, "roll", e.target.value)}
                    placeholder="Roll #" />
                </Field>
              </div>
            </div>
          ))}
          <Button type="button" variant="outline" size="sm" className="gap-1.5" onClick={addChild}>
            <Plus className="h-3.5 w-3.5" />Add Child
          </Button>
        </div>
      </FormSection>

      {/* D. Documents */}
      <FormSection icon={FileText} title="Documents Checklist"
        subtitle="Mark documents received" defaultOpen={false}>
        <div className="space-y-3">
          {DOCUMENT_FIELDS.map(({ key, label }) => (
            <label key={key} className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={form[key] as boolean}
                onChange={(e) => set(key, e.target.checked as ParentFormData[typeof key])}
                className="h-4 w-4 rounded border-input accent-primary"
              />
              <span className="text-[13px]">{label}</span>
              {form[key] && <Check className="h-3.5 w-3.5 text-emerald-500" />}
            </label>
          ))}
        </div>
      </FormSection>

      {/* E. Notes */}
      <FormSection icon={StickyNote} title="Administrative Notes"
        subtitle="Internal notes and special instructions" defaultOpen={false}>
        <div className="grid gap-4">
          <Field label="Admin Notes">
            <textarea value={form.adminNotes} onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => set("adminNotes", e.target.value)}
              placeholder="Internal notes for admin staff…" rows={3}
              className="flex min-h-[72px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring" />
          </Field>
          <Field label="Special Instructions">
            <textarea value={form.specialInstructions} onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => set("specialInstructions", e.target.value)}
              placeholder="Any special instructions…" rows={2}
              className="flex min-h-[60px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring" />
          </Field>
        </div>
      </FormSection>

      {/* Bottom actions */}
      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" onClick={() => navigate(-1)}>
          <X className="mr-1.5 h-4 w-4" />Cancel
        </Button>
        <Button type="submit" disabled={saving}>
          {saving ? (
            <span className="flex items-center gap-1.5"><span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />Saving…</span>
          ) : (
            <><Check className="mr-1.5 h-4 w-4" />{mode === "create" ? "Add Parent" : "Save Changes"}</>
          )}
        </Button>
      </div>
    </form>
  );
}
