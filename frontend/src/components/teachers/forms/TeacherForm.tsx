import { useEffect, useId, useState } from "react";
import {
  Banknote,
  BookOpen,
  Briefcase,
  Contact,
  FileText,
  GraduationCap,
  MessageSquare,
  User,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";

import { FormSection } from "@/components/students/forms/FormSection";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  TEACHERS,
  DEPARTMENT_OPTIONS,
  SUBJECT_OPTIONS,
  EMPLOYMENT_TYPE_OPTIONS,
} from "@/data/teachersData";

/* ── Types ──────────────────────────────────────────────────────────── */
interface TeacherFormData {
  // 1. Basic
  firstName: string;
  lastName: string;
  gender: string;
  dateOfBirth: string;
  bloodGroup: string;
  nationality: string;
  religion: string;
  maritalStatus: string;
  // 2. Employment
  employeeId: string;
  staffCode: string;
  designation: string;
  department: string;
  joiningDate: string;
  employmentType: string;
  // 3. Academic
  subject: string;
  secondarySubjects: string;
  classTeacherOf: string;
  assignedClasses: string;
  weeklyPeriods: string;
  // 4. Qualification
  qualification: string;
  experienceYears: string;
  previousSchools: string;
  certifications: string;
  skills: string;
  // 5. Contact
  phone: string;
  altPhone: string;
  email: string;
  presentAddress: string;
  permanentAddress: string;
  sameAddress: boolean;
  // 6. Payroll
  basicSalary: string;
  houseAllowance: string;
  transportAllowance: string;
  otherAllowance: string;
  bankName: string;
  accountNo: string;
  paymentMethod: string;
  // 7. Documents (checklist stored externally)
  // 8. Remarks
  remarks: string;
}

const EMPTY: TeacherFormData = {
  firstName: "", lastName: "", gender: "", dateOfBirth: "", bloodGroup: "",
  nationality: "", religion: "", maritalStatus: "",
  employeeId: "", staffCode: "", designation: "", department: "",
  joiningDate: "", employmentType: "",
  subject: "", secondarySubjects: "", classTeacherOf: "", assignedClasses: "",
  weeklyPeriods: "",
  qualification: "", experienceYears: "", previousSchools: "",
  certifications: "", skills: "",
  phone: "", altPhone: "", email: "", presentAddress: "", permanentAddress: "",
  sameAddress: false,
  basicSalary: "", houseAllowance: "", transportAllowance: "", otherAllowance: "",
  bankName: "", accountNo: "", paymentMethod: "",
  remarks: "",
};

/* ── Local form field helpers ────────────────────────────────────────── */
function Field({ id, label, required, error, children }: {
  id: string; label: string; required?: boolean; error?: string; children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className="text-[12.5px] font-medium text-foreground/80">
        {label}{required && <span className="ml-0.5 text-destructive">*</span>}
      </label>
      {children}
      {error && <p className="text-[11px] text-destructive">{error}</p>}
    </div>
  );
}

function TextInput({ id, value, onChange, placeholder, error }: {
  id: string; value: string; onChange: (v: string) => void;
  placeholder?: string; error?: string;
}) {
  return (
    <Input
      id={id}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className={`h-9 text-sm ${error ? "border-destructive focus-visible:ring-destructive" : ""}`}
    />
  );
}

function DateInput({ id, value, onChange, error }: {
  id: string; value: string; onChange: (v: string) => void; error?: string;
}) {
  return (
    <Input
      id={id}
      type="date"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={`h-9 text-sm ${error ? "border-destructive focus-visible:ring-destructive" : ""}`}
    />
  );
}

function SelectInput({ id, value, onChange, options, placeholder, error }: {
  id: string; value: string; onChange: (v: string) => void;
  options: string[]; placeholder?: string; error?: string;
}) {
  return (
    <select
      id={id}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={`h-9 w-full rounded-md border bg-background px-3 text-sm text-foreground shadow-sm focus:outline-none focus:ring-1 focus:ring-ring ${
        error ? "border-destructive focus:ring-destructive" : "border-input"
      }`}
    >
      <option value="">{placeholder ?? "Select…"}</option>
      {options.map((o) => <option key={o} value={o}>{o}</option>)}
    </select>
  );
}

function TextareaInput({ id, value, onChange, placeholder, rows = 3, error }: {
  id: string; value: string; onChange: (v: string) => void;
  placeholder?: string; rows?: number; error?: string;
}) {
  return (
    <textarea
      id={id}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={rows}
      className={`w-full rounded-md border bg-background px-3 py-2 text-sm text-foreground shadow-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring resize-none ${
        error ? "border-destructive focus:ring-destructive" : "border-input"
      }`}
    />
  );
}

/* ── Validation ─────────────────────────────────────────────────────── */
type FormErrors = Partial<Record<keyof TeacherFormData, string>>;

function validate(f: TeacherFormData): FormErrors {
  const e: FormErrors = {};
  if (!f.firstName.trim())    e.firstName    = "First name is required";
  if (!f.lastName.trim())     e.lastName     = "Last name is required";
  if (!f.gender)              e.gender       = "Gender is required";
  if (!f.dateOfBirth)         e.dateOfBirth  = "Date of birth is required";
  if (!f.employeeId.trim())   e.employeeId   = "Employee ID is required";
  if (!f.staffCode.trim())    e.staffCode    = "Staff code is required";
  if (!f.designation.trim())  e.designation  = "Designation is required";
  if (!f.department)          e.department   = "Department is required";
  if (!f.joiningDate)         e.joiningDate  = "Joining date is required";
  if (!f.employmentType)      e.employmentType = "Employment type is required";
  if (!f.subject)             e.subject      = "Primary subject is required";
  if (!f.qualification.trim()) e.qualification = "Qualification is required";
  if (!f.phone.trim())        e.phone        = "Phone is required";
  if (!f.email.trim())        e.email        = "Email is required";
  if (!f.presentAddress.trim()) e.presentAddress = "Present address is required";
  return e;
}

function countErrors(errors: FormErrors, keys: (keyof TeacherFormData)[]): number {
  return keys.filter((k) => !!errors[k]).length;
}

/* ── Main component ──────────────────────────────────────────────────── */
export function TeacherForm({ mode }: { mode: "create" | "edit" }) {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const uid = useId();
  const fid = (k: string) => `${uid}-${k}`;

  const [form, setForm] = useState<TeacherFormData>(EMPTY);
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);

  /* Pre-fill from static data in edit mode */
  useEffect(() => {
    if (mode === "edit" && id) {
      const t = TEACHERS.find((x) => x.id === Number(id));
      if (t) {
        const parts = t.name.trim().split(" ");
        setForm({
          ...EMPTY,
          firstName:       parts[0] ?? "",
          lastName:        parts.slice(1).join(" ") || "",
          gender:          t.gender,
          dateOfBirth:     t.dateOfBirth,
          employeeId:      t.employeeId,
          staffCode:       t.staffCode,
          designation:     t.designation,
          department:      t.department,
          joiningDate:     t.joiningDate,
          employmentType:  t.employmentType,
          subject:         t.subject,
          secondarySubjects: t.secondarySubjects.join(", "),
          assignedClasses: t.assignedClasses.join(", "),
          phone:           t.phone,
          email:           t.email,
          presentAddress:  t.address,
          permanentAddress: t.address,
          basicSalary:     String(t.salary),
          qualification:   t.qualification,
          experienceYears: String(t.experienceYears),
        });
      }
    }
  }, [mode, id]);

  const set = <K extends keyof TeacherFormData>(key: K, value: TeacherFormData[K]) => {
    setForm((prev) => {
      const next = { ...prev, [key]: value };
      if (key === "sameAddress" && value) next.permanentAddress = next.presentAddress;
      if (key === "presentAddress" && prev.sameAddress) next.permanentAddress = value as string;
      return next;
    });
    if (errors[key]) setErrors((e) => { const n = { ...e }; delete n[key]; return n; });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate(form);
    setErrors(errs);
    if (Object.keys(errs).length > 0) {
      const firstKey = Object.keys(errs)[0] as keyof TeacherFormData;
      document.getElementById(fid(firstKey))?.scrollIntoView({ behavior: "smooth", block: "center" });
      toast.error("Please fix the errors before submitting.");
      return;
    }
    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 600));
    setSubmitting(false);
    toast.success(mode === "create" ? "Teacher added successfully!" : "Teacher profile updated!");
    if (mode === "create") setForm(EMPTY);
    else navigate(`/teachers/${id}`);
  };

  const title = mode === "create" ? "Add New Teacher" : "Edit Teacher Profile";

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-foreground">{title}</h2>
          <p className="mt-0.5 text-sm text-muted-foreground">
            {mode === "create"
              ? "Fill in the details to register a new staff member."
              : "Update the teacher's profile information."}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button type="button" variant="outline" size="sm" onClick={() => navigate(-1)}>
            Cancel
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => navigate("/teachers/teacher-form/print")}
          >
            Blank Form
          </Button>
          <Button type="submit" size="sm" disabled={submitting}>
            {submitting ? "Saving…" : mode === "create" ? "Add Teacher" : "Save Changes"}
          </Button>
        </div>
      </div>

      {/* ── Section 1: Basic Information ──────────────────────────── */}
      <FormSection
        icon={User}
        title="Basic Information"
        subtitle="Personal details of the teacher"
        defaultOpen
        errorCount={countErrors(errors, ["firstName", "lastName", "gender", "dateOfBirth"])}
      >
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Field id={fid("firstName")} label="First Name" required error={errors.firstName}>
            <TextInput id={fid("firstName")} value={form.firstName} onChange={(v) => set("firstName", v)}
              placeholder="e.g. Kazi" error={errors.firstName} />
          </Field>
          <Field id={fid("lastName")} label="Last Name" required error={errors.lastName}>
            <TextInput id={fid("lastName")} value={form.lastName} onChange={(v) => set("lastName", v)}
              placeholder="e.g. Fahim" error={errors.lastName} />
          </Field>
          <Field id={fid("gender")} label="Gender" required error={errors.gender}>
            <SelectInput id={fid("gender")} value={form.gender} onChange={(v) => set("gender", v)}
              options={["Male", "Female"]} placeholder="Select gender" error={errors.gender} />
          </Field>
          <Field id={fid("dateOfBirth")} label="Date of Birth" required error={errors.dateOfBirth}>
            <DateInput id={fid("dateOfBirth")} value={form.dateOfBirth} onChange={(v) => set("dateOfBirth", v)} error={errors.dateOfBirth} />
          </Field>
          <Field id={fid("bloodGroup")} label="Blood Group">
            <SelectInput id={fid("bloodGroup")} value={form.bloodGroup} onChange={(v) => set("bloodGroup", v)}
              options={["A+", "A−", "B+", "B−", "AB+", "AB−", "O+", "O−"]} placeholder="Select blood group" />
          </Field>
          <Field id={fid("nationality")} label="Nationality">
            <TextInput id={fid("nationality")} value={form.nationality} onChange={(v) => set("nationality", v)}
              placeholder="e.g. Nepali" />
          </Field>
          <Field id={fid("religion")} label="Religion">
            <TextInput id={fid("religion")} value={form.religion} onChange={(v) => set("religion", v)}
              placeholder="e.g. Hindu" />
          </Field>
          <Field id={fid("maritalStatus")} label="Marital Status">
            <SelectInput id={fid("maritalStatus")} value={form.maritalStatus} onChange={(v) => set("maritalStatus", v)}
              options={["Single", "Married", "Divorced", "Widowed"]} placeholder="Select status" />
          </Field>
        </div>
      </FormSection>

      {/* ── Section 2: Employment Details ─────────────────────────── */}
      <FormSection
        icon={Briefcase}
        title="Employment Details"
        subtitle="Staff ID, department, and employment information"
        defaultOpen
        errorCount={countErrors(errors, ["employeeId", "staffCode", "designation", "department", "joiningDate", "employmentType"])}
      >
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Field id={fid("employeeId")} label="Employee ID" required error={errors.employeeId}>
            <TextInput id={fid("employeeId")} value={form.employeeId} onChange={(v) => set("employeeId", v)}
              placeholder="e.g. EMP-2026-0001" error={errors.employeeId} />
          </Field>
          <Field id={fid("staffCode")} label="Staff Code" required error={errors.staffCode}>
            <TextInput id={fid("staffCode")} value={form.staffCode} onChange={(v) => set("staffCode", v)}
              placeholder="e.g. TCH-MATH-001" error={errors.staffCode} />
          </Field>
          <Field id={fid("designation")} label="Designation" required error={errors.designation}>
            <TextInput id={fid("designation")} value={form.designation} onChange={(v) => set("designation", v)}
              placeholder="e.g. Senior Teacher" error={errors.designation} />
          </Field>
          <Field id={fid("department")} label="Department" required error={errors.department}>
            <SelectInput id={fid("department")} value={form.department} onChange={(v) => set("department", v)}
              options={DEPARTMENT_OPTIONS} placeholder="Select department" error={errors.department} />
          </Field>
          <Field id={fid("joiningDate")} label="Joining Date" required error={errors.joiningDate}>
            <DateInput id={fid("joiningDate")} value={form.joiningDate} onChange={(v) => set("joiningDate", v)} error={errors.joiningDate} />
          </Field>
          <Field id={fid("employmentType")} label="Employment Type" required error={errors.employmentType}>
            <SelectInput id={fid("employmentType")} value={form.employmentType} onChange={(v) => set("employmentType", v)}
              options={[...EMPLOYMENT_TYPE_OPTIONS]} placeholder="Select type" error={errors.employmentType} />
          </Field>
        </div>
      </FormSection>

      {/* ── Section 3: Academic Assignment ────────────────────────── */}
      <FormSection
        icon={BookOpen}
        title="Academic Assignment"
        subtitle="Subjects and class assignments"
        defaultOpen
        errorCount={countErrors(errors, ["subject"])}
      >
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Field id={fid("subject")} label="Primary Subject" required error={errors.subject}>
            <SelectInput id={fid("subject")} value={form.subject} onChange={(v) => set("subject", v)}
              options={SUBJECT_OPTIONS} placeholder="Select subject" error={errors.subject} />
          </Field>
          <Field id={fid("secondarySubjects")} label="Secondary Subjects">
            <TextInput id={fid("secondarySubjects")} value={form.secondarySubjects} onChange={(v) => set("secondarySubjects", v)}
              placeholder="e.g. Physics, Statistics (comma separated)" />
          </Field>
          <Field id={fid("classTeacherOf")} label="Class Teacher of">
            <TextInput id={fid("classTeacherOf")} value={form.classTeacherOf} onChange={(v) => set("classTeacherOf", v)}
              placeholder="e.g. Grade 10A" />
          </Field>
          <Field id={fid("assignedClasses")} label="Assigned Classes">
            <TextInput id={fid("assignedClasses")} value={form.assignedClasses} onChange={(v) => set("assignedClasses", v)}
              placeholder="e.g. Grade 8, Grade 9, Grade 10" />
          </Field>
          <Field id={fid("weeklyPeriods")} label="Weekly Periods">
            <TextInput id={fid("weeklyPeriods")} value={form.weeklyPeriods} onChange={(v) => set("weeklyPeriods", v)}
              placeholder="e.g. 24" />
          </Field>
        </div>
      </FormSection>

      {/* ── Section 4: Qualification & Experience ─────────────────── */}
      <FormSection
        icon={GraduationCap}
        title="Qualification & Experience"
        subtitle="Academic background and professional experience"
        defaultOpen
        errorCount={countErrors(errors, ["qualification"])}
      >
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Field id={fid("qualification")} label="Highest Qualification" required error={errors.qualification}>
            <TextInput id={fid("qualification")} value={form.qualification} onChange={(v) => set("qualification", v)}
              placeholder="e.g. M.Sc. Mathematics" error={errors.qualification} />
          </Field>
          <Field id={fid("experienceYears")} label="Years of Experience">
            <TextInput id={fid("experienceYears")} value={form.experienceYears} onChange={(v) => set("experienceYears", v)}
              placeholder="e.g. 10" />
          </Field>
          <Field id={fid("skills")} label="Skills">
            <TextInput id={fid("skills")} value={form.skills} onChange={(v) => set("skills", v)}
              placeholder="e.g. Python, Smart Board (comma separated)" />
          </Field>
          <div className="sm:col-span-2 lg:col-span-3">
            <Field id={fid("previousSchools")} label="Previous Schools / Institutions">
              <TextareaInput id={fid("previousSchools")} value={form.previousSchools} onChange={(v) => set("previousSchools", v)}
                placeholder="List previous employers/schools…" rows={2} />
            </Field>
          </div>
          <div className="sm:col-span-2 lg:col-span-3">
            <Field id={fid("certifications")} label="Certifications">
              <TextareaInput id={fid("certifications")} value={form.certifications} onChange={(v) => set("certifications", v)}
                placeholder="e.g. TRC — Teaching Registration Certificate…" rows={2} />
            </Field>
          </div>
        </div>
      </FormSection>

      {/* ── Section 5: Contact & Address ──────────────────────────── */}
      <FormSection
        icon={Contact}
        title="Contact & Address"
        subtitle="Phone, email, and residence details"
        defaultOpen={false}
        errorCount={countErrors(errors, ["phone", "email", "presentAddress"])}
      >
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Field id={fid("phone")} label="Phone" required error={errors.phone}>
            <TextInput id={fid("phone")} value={form.phone} onChange={(v) => set("phone", v)}
              placeholder="+977-98XXXXXXXX" error={errors.phone} />
          </Field>
          <Field id={fid("altPhone")} label="Alternate Phone">
            <TextInput id={fid("altPhone")} value={form.altPhone} onChange={(v) => set("altPhone", v)}
              placeholder="+977-98XXXXXXXX" />
          </Field>
          <Field id={fid("email")} label="Email" required error={errors.email}>
            <TextInput id={fid("email")} value={form.email} onChange={(v) => set("email", v)}
              placeholder="teacher@school.edu" error={errors.email} />
          </Field>
          <div className="sm:col-span-2 lg:col-span-3">
            <Field id={fid("presentAddress")} label="Present Address" required error={errors.presentAddress}>
              <TextareaInput id={fid("presentAddress")} value={form.presentAddress} onChange={(v) => set("presentAddress", v)}
                placeholder="Current residential address…" rows={2} error={errors.presentAddress} />
            </Field>
          </div>
          <div className="sm:col-span-2 lg:col-span-3">
            <div className="mb-2 flex items-center gap-2">
              <input
                id={fid("sameAddress")}
                type="checkbox"
                checked={form.sameAddress}
                onChange={(e) => set("sameAddress", e.target.checked)}
                className="h-3.5 w-3.5 rounded border-input accent-primary"
              />
              <label htmlFor={fid("sameAddress")} className="text-[12.5px] text-muted-foreground cursor-pointer">
                Same as present address
              </label>
            </div>
            <Field id={fid("permanentAddress")} label="Permanent Address">
              <TextareaInput id={fid("permanentAddress")} value={form.permanentAddress}
                onChange={(v) => set("permanentAddress", v)}
                placeholder="Permanent address…" rows={2} />
            </Field>
          </div>
        </div>
      </FormSection>

      {/* ── Section 6: Salary & Bank ──────────────────────────────── */}
      <FormSection
        icon={Banknote}
        title="Salary & Bank Details"
        subtitle="Compensation and payment information"
        defaultOpen={false}
        errorCount={0}
      >
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Field id={fid("basicSalary")} label="Basic Salary (NPR)">
            <TextInput id={fid("basicSalary")} value={form.basicSalary} onChange={(v) => set("basicSalary", v)}
              placeholder="e.g. 65000" />
          </Field>
          <Field id={fid("houseAllowance")} label="House Allowance (NPR)">
            <TextInput id={fid("houseAllowance")} value={form.houseAllowance} onChange={(v) => set("houseAllowance", v)}
              placeholder="e.g. 8000" />
          </Field>
          <Field id={fid("transportAllowance")} label="Transport Allowance (NPR)">
            <TextInput id={fid("transportAllowance")} value={form.transportAllowance} onChange={(v) => set("transportAllowance", v)}
              placeholder="e.g. 3000" />
          </Field>
          <Field id={fid("otherAllowance")} label="Other Allowance (NPR)">
            <TextInput id={fid("otherAllowance")} value={form.otherAllowance} onChange={(v) => set("otherAllowance", v)}
              placeholder="e.g. 2000" />
          </Field>
          <Separator className="sm:col-span-2 lg:col-span-3" />
          <Field id={fid("bankName")} label="Bank Name">
            <TextInput id={fid("bankName")} value={form.bankName} onChange={(v) => set("bankName", v)}
              placeholder="e.g. Nepal Investment Bank" />
          </Field>
          <Field id={fid("accountNo")} label="Account Number">
            <TextInput id={fid("accountNo")} value={form.accountNo} onChange={(v) => set("accountNo", v)}
              placeholder="Bank account number" />
          </Field>
          <Field id={fid("paymentMethod")} label="Payment Method">
            <SelectInput id={fid("paymentMethod")} value={form.paymentMethod} onChange={(v) => set("paymentMethod", v)}
              options={["Bank Transfer", "Cash", "Cheque"]} placeholder="Select method" />
          </Field>
        </div>
      </FormSection>

      {/* ── Section 7: Documents ──────────────────────────────────── */}
      <FormSection
        icon={FileText}
        title="Document Checklist"
        subtitle="Mark which documents have been submitted"
        defaultOpen={false}
        errorCount={0}
      >
        <DocumentChecklist />
      </FormSection>

      {/* ── Section 8: Remarks ────────────────────────────────────── */}
      <FormSection
        icon={MessageSquare}
        title="Additional Remarks"
        subtitle="Internal notes or special instructions"
        defaultOpen={false}
        errorCount={0}
      >
        <Field id={fid("remarks")} label="Remarks">
          <TextareaInput id={fid("remarks")} value={form.remarks} onChange={(v) => set("remarks", v)}
            placeholder="Any additional notes about this staff member…" rows={4} />
        </Field>
      </FormSection>

      {/* Submit row */}
      <div className="flex items-center justify-end gap-2 rounded-xl border border-border/60 bg-card px-5 py-3 shadow-sm">
        <Button type="button" variant="outline" onClick={() => navigate(-1)}>Cancel</Button>
        <Button type="submit" disabled={submitting}>
          {submitting ? "Saving…" : mode === "create" ? "Add Teacher" : "Save Changes"}
        </Button>
      </div>
    </form>
  );
}

/* ── Document checklist sub-component ───────────────────────────────── */
const DOCS = [
  "Citizenship Certificate",
  "Teaching Registration Certificate",
  "Academic Degree / Marksheet",
  "Experience Certificate",
  "Appointment Letter",
  "Passport-size Photo",
  "Medical Certificate",
  "Background Check",
];

function DocumentChecklist() {
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const count = Object.values(checked).filter(Boolean).length;

  return (
    <div className="space-y-3">
      <div className="space-y-1">
        <div className="flex justify-between text-[12px] text-muted-foreground">
          <span>{count} of {DOCS.length} documents received</span>
          <span>{Math.round((count / DOCS.length) * 100)}%</span>
        </div>
        <div className="h-1.5 overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-primary transition-all"
            style={{ width: `${(count / DOCS.length) * 100}%` }}
          />
        </div>
      </div>
      <div className="grid gap-2 sm:grid-cols-2">
        {DOCS.map((doc) => (
          <label
            key={doc}
            className="flex cursor-pointer items-center gap-2.5 rounded-lg border border-border/50 p-2.5 transition-colors hover:bg-accent/40"
          >
            <input
              type="checkbox"
              checked={!!checked[doc]}
              onChange={(e) => setChecked((s) => ({ ...s, [doc]: e.target.checked }))}
              className="h-3.5 w-3.5 rounded accent-primary"
            />
            <span className="text-[12.5px] text-foreground">{doc}</span>
          </label>
        ))}
      </div>
    </div>
  );
}
