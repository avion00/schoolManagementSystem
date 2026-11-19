import { useEffect, useRef, useState, type ReactNode, type ChangeEvent } from "react";
import {
  ArrowLeft,
  BookOpen,
  Bus,
  FileText,
  GraduationCap,
  Heart,
  MapPin,
  Printer,
  RotateCcw,
  Save,
  Upload,
  User,
  Users,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

import { DocumentChecklist } from "@/components/students/forms/DocumentChecklist";
import { FormSection } from "@/components/ui/form-section";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { fileObjectUrl, uploadFile } from "@/api/files";
import { errorMessage, type Schemas } from "@/api/http";
import {
  changeStudentStatus, fromGender, toGender, useAcademicOptions, useSaveStudent, useStudentRecord,
  type GuardianInput,
} from "@/api/students";
import { useAuth } from "@/lib/auth";
import { cn } from "@/lib/utils";

/* ── Types ────────────────────────────────────────────────────────────────── */

interface FormData {
  firstName: string; middleName: string; lastName: string;
  gender: string; dateOfBirth: string; bloodGroup: string;
  nationality: string; religion: string; studentType: string; status: string;
  academicYear: string; admissionDate: string; admissionNo: string;
  registrationNo: string; className: string; section: string;
  roll: string; house: string; previousSchool: string;
  medium: string; shift: string; classTeacher: string;
  fatherName: string; fatherOccupation: string; fatherPhone: string; fatherEmail: string;
  motherName: string; motherOccupation: string; motherPhone: string; motherEmail: string;
  guardianName: string; guardianRelation: string; guardianPhone: string; emergencyContact: string;
  email: string; mobile: string;
  presentAddress: string; sameAddress: boolean; permanentAddress: string;
  city: string; state: string; country: string; postalCode: string;
  allergies: string; medicalConditions: string; regularMedication: string;
  doctorName: string; doctorPhone: string; emergencyMedicalNote: string;
  usesTransport: boolean; busRoute: string; pickupPoint: string;
  driverName: string; driverPhone: string;
  hostelRequired: boolean; hostelName: string; roomNo: string; wardenContact: string;
  adminNotes: string; specialInstructions: string; principalRemarks: string;
}

type Errors = Partial<Record<keyof FormData, string>>;

const EMPTY: FormData = {
  firstName: "", middleName: "", lastName: "",
  gender: "", dateOfBirth: "", bloodGroup: "",
  nationality: "", religion: "", studentType: "", status: "active",
  academicYear: "", admissionDate: "", admissionNo: "", registrationNo: "",
  className: "", section: "", roll: "", house: "", previousSchool: "",
  medium: "English", shift: "Morning", classTeacher: "",
  fatherName: "", fatherOccupation: "", fatherPhone: "", fatherEmail: "",
  motherName: "", motherOccupation: "", motherPhone: "", motherEmail: "",
  guardianName: "", guardianRelation: "", guardianPhone: "", emergencyContact: "",
  email: "", mobile: "",
  presentAddress: "", sameAddress: false, permanentAddress: "",
  city: "", state: "", country: "", postalCode: "",
  allergies: "", medicalConditions: "", regularMedication: "",
  doctorName: "", doctorPhone: "", emergencyMedicalNote: "",
  usesTransport: false, busRoute: "", pickupPoint: "", driverName: "", driverPhone: "",
  hostelRequired: false, hostelName: "", roomNo: "", wardenContact: "",
  adminNotes: "", specialInstructions: "", principalRemarks: "",
};

/* ── Mini primitive components ───────────────────────────────────────────── */

function inputCls(err?: string) {
  return cn(
    "flex h-[42px] w-full rounded-xl border bg-background px-3.5 text-sm transition-colors",
    "placeholder:text-muted-foreground/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-0",
    "disabled:cursor-not-allowed disabled:opacity-50",
    err
      ? "border-destructive focus-visible:ring-destructive/25"
      : "border-input focus-visible:ring-ring/25",
  );
}

function Field({
  label, required, hint, error, id, children,
}: {
  label: string; required?: boolean; hint?: string; error?: string; id?: string; children: ReactNode;
}) {
  return (
    <div className="space-y-1.5" id={id}>
      <label className="block text-[12.5px] font-semibold text-foreground">
        {label}
        {required && <span className="ml-0.5 text-destructive">*</span>}
      </label>
      {children}
      {hint && !error && (
        <p className="text-[11px] text-muted-foreground">{hint}</p>
      )}
      {error && (
        <p className="text-[11px] font-medium text-destructive">{error}</p>
      )}
    </div>
  );
}

function TextInput({
  value, onChange, placeholder, error, disabled, readOnly, id,
}: {
  value: string; onChange?: (v: string) => void; placeholder?: string;
  error?: string; disabled?: boolean; readOnly?: boolean; id?: string;
}) {
  return (
    <input
      id={id}
      type="text"
      value={value}
      readOnly={readOnly}
      disabled={disabled}
      placeholder={placeholder}
      className={cn(inputCls(error), readOnly && "bg-muted/40 text-muted-foreground")}
      onChange={(e) => onChange?.(e.target.value)}
    />
  );
}

function DateInput({ value, onChange, error }: { value: string; onChange: (v: string) => void; error?: string }) {
  return (
    <input type="date" value={value} className={inputCls(error)}
      onChange={(e) => onChange(e.target.value)} />
  );
}

function SelectInput({
  value, onChange, error, children, placeholder,
}: {
  value: string; onChange: (v: string) => void; error?: string;
  children: ReactNode; placeholder?: string;
}) {
  return (
    <select value={value} className={cn(inputCls(error), "cursor-pointer appearance-none")}
      onChange={(e) => onChange(e.target.value)}>
      {placeholder && <option value="">{placeholder}</option>}
      {children}
    </select>
  );
}

function TextareaInput({ value, onChange, placeholder, rows = 3 }: {
  value: string; onChange: (v: string) => void; placeholder?: string; rows?: number;
}) {
  return (
    <textarea value={value} rows={rows} placeholder={placeholder}
      className={cn(inputCls(), "h-auto resize-none py-2.5")}
      onChange={(e) => onChange(e.target.value)} />
  );
}


/* ── Photo upload ────────────────────────────────────────────────────────── */

function PhotoUpload({ value, onChange, label }: {
  value: string | null; onChange: (url: string | null, file: File | null) => void; label: string;
}) {
  const ref = useRef<HTMLInputElement>(null);
  return (
    <div className="space-y-1.5">
      <label className="block text-[12.5px] font-semibold text-foreground">{label}</label>
      <div
        className="flex h-24 w-24 cursor-pointer items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed border-border bg-muted/30 transition-colors hover:border-primary/60 hover:bg-primary/5"
        onClick={() => ref.current?.click()}
      >
        {value ? (
          <img src={value} alt="Preview" className="h-full w-full object-cover" />
        ) : (
          <div className="text-center">
            <Upload className="mx-auto h-5 w-5 text-muted-foreground" />
            <p className="mt-1 text-[10px] text-muted-foreground">Upload</p>
          </div>
        )}
      </div>
      <input
        ref={ref}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e: ChangeEvent<HTMLInputElement>) => {
          const file = e.target.files?.[0];
          if (file) onChange(URL.createObjectURL(file), file);
        }}
      />
      {value && (
        <button
          type="button"
          className="text-[11px] font-medium text-destructive hover:underline"
          onClick={() => onChange(null, null)}
        >
          Remove photo
        </button>
      )}
    </div>
  );
}

/* ── Validation ──────────────────────────────────────────────────────────── */

function validate(f: FormData): Errors {
  const e: Errors = {};
  if (!f.firstName.trim())     e.firstName     = "First name is required";
  if (!f.lastName.trim())      e.lastName      = "Last name is required";
  if (!f.gender)               e.gender        = "Gender is required";
  if (!f.dateOfBirth)          e.dateOfBirth   = "Date of birth is required";
  if (!f.admissionNo.trim())   e.admissionNo   = "Admission number is required";
  if (!f.className)            e.className     = "Class is required";
  if (!f.section)              e.section       = "Section is required";
  if (!f.fatherName.trim() && !f.guardianName.trim())
    e.fatherName = "Father name or guardian name is required";
  if (!f.emergencyContact.trim()) e.emergencyContact = "Emergency contact is required";
  if (!f.presentAddress.trim())   e.presentAddress   = "Present address is required";
  return e;
}

function countErrors(e: Errors, keys: (keyof FormData)[]) {
  return keys.filter((k) => !!e[k]).length;
}

/* ── Age helper ──────────────────────────────────────────────────────────── */

function calcAge(dob: string): string {
  if (!dob) return "";
  const diff = Date.now() - new Date(dob).getTime();
  return String(Math.floor(diff / (365.25 * 24 * 60 * 60 * 1000))) + " yrs";
}

/* ── API record → form ───────────────────────────────────────────────────── */

function recordToForm(r: Schemas["Student"]): FormData {
  const rel = (name: string) => r.guardians.find((g) => g.relation === name);
  const father = rel("father");
  const mother = rel("mother");
  const other = r.guardians.find((g) => g !== father && g !== mother);
  return {
    ...EMPTY,
    firstName: r.first_name, middleName: r.middle_name ?? "", lastName: r.last_name,
    gender: toGender(r.gender), dateOfBirth: r.date_of_birth ?? "", bloodGroup: r.blood_group ?? "",
    nationality: r.nationality ?? "", religion: r.religion ?? "", studentType: r.student_type ?? "",
    status: r.status,
    academicYear: r.academic_year, admissionDate: r.admission_date ?? "", admissionNo: r.admission_number,
    registrationNo: r.registration_number ?? "", className: r.class_level, section: r.section ?? "",
    roll: r.roll_number ?? "", house: r.house ?? "", previousSchool: r.previous_school ?? "",
    fatherName: father?.full_name ?? "", fatherOccupation: father?.occupation ?? "",
    fatherPhone: father?.phone ?? "", fatherEmail: father?.email ?? "",
    motherName: mother?.full_name ?? "", motherOccupation: mother?.occupation ?? "",
    motherPhone: mother?.phone ?? "", motherEmail: mother?.email ?? "",
    guardianName: other?.full_name ?? "", guardianRelation: other?.relation ?? "",
    guardianPhone: other?.phone ?? "",
    emergencyContact: [r.emergency_contact_name, r.emergency_contact_phone].filter(Boolean).join(" "),
    email: r.email ?? "", mobile: r.phone ?? "",
    presentAddress: r.address ?? "", permanentAddress: r.permanent_address ?? "",
    sameAddress: !!r.address && r.address === r.permanent_address,
    city: r.city ?? "", state: r.state ?? "", country: r.country ?? "", postalCode: r.postal_code ?? "",
    allergies: r.allergies ?? "", medicalConditions: r.medical_conditions ?? "",
    regularMedication: r.regular_medication ?? "", doctorName: r.doctor_name ?? "",
    doctorPhone: r.doctor_phone ?? "", emergencyMedicalNote: r.medical_note ?? "",
    adminNotes: r.admin_notes ?? "",
  };
}

/** Split "Name 98xxxxxxx" into contact name / phone (digits and + go to phone). */
function splitContact(v: string): { name: string; phone: string } {
  const m = v.trim().match(/^(.*?)[\s,·]*([+\d][\d\s-]{5,})$/);
  return m ? { name: m[1].trim(), phone: m[2].trim() } : { name: v.trim(), phone: "" };
}

/* ── Main form ───────────────────────────────────────────────────────────── */

interface Props {
  mode: "create" | "edit";
  studentId?: string;
}

export function StudentForm({ mode, studentId }: Props) {
  const navigate = useNavigate();
  const [form, setForm]     = useState<FormData>(EMPTY);
  const [errors, setErrors] = useState<Errors>({});
  const [photo, setPhoto]   = useState<string | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoRemoved, setPhotoRemoved] = useState(false);
  const saving = useSaveStudent();
  const record = useStudentRecord(mode === "edit" ? studentId : undefined);
  const options = useAcademicOptions();
  const { hasPermission } = useAuth();

  function set<K extends keyof FormData>(field: K, value: FormData[K]) {
    setForm((prev) => {
      const next = { ...prev, [field]: value };
      // sync permanent address when "same as present" is on
      if (field === "presentAddress" && next.sameAddress) {
        next.permanentAddress = value as string;
      }
      if (field === "sameAddress" && value) {
        next.permanentAddress = next.presentAddress;
      }
      if (field === "className") next.section = "";
      return next;
    });
    // clear error on change
    if (errors[field]) setErrors((e) => ({ ...e, [field]: undefined }));
  }

  // ── Defaults (current year) and edit pre-fill ──────────────────────────
  useEffect(() => {
    if (mode === "create" && options.data && !form.academicYear) {
      const current = options.data.years.find((y) => y.isCurrent) ?? options.data.years[0];
      if (current) setForm((prev) => ({ ...prev, academicYear: current.id }));
    }
  }, [mode, options.data, form.academicYear]);

  useEffect(() => {
    if (!record.data) return;
    setForm(recordToForm(record.data));
    let revoke: string | null = null;
    if (record.data.photo) {
      fileObjectUrl(record.data.photo.download_url).then((url) => { revoke = url; setPhoto(url); }).catch(() => {});
    }
    return () => { if (revoke) URL.revokeObjectURL(revoke); };
  }, [record.data]);

  // ── Submit ───────────────────────────────────────────────────────────
  async function handleSubmit() {
    const errs = validate(form);
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      const firstKey = Object.keys(errs)[0];
      document.getElementById(firstKey)?.scrollIntoView({ behavior: "smooth", block: "center" });
      toast.error("Please fix the highlighted errors before saving.");
      return;
    }
    const fullName = [form.firstName, form.middleName, form.lastName].filter(Boolean).join(" ");
    const contact = splitContact(form.emergencyContact);
    try {
      let photoId: string | null | undefined;
      if (photoFile) photoId = (await uploadFile(photoFile)).id;
      else if (photoRemoved) photoId = null;
      const payload = {
        first_name: form.firstName, middle_name: form.middleName, last_name: form.lastName,
        gender: fromGender(form.gender), date_of_birth: form.dateOfBirth || null,
        blood_group: form.bloodGroup, nationality: form.nationality, religion: form.religion,
        student_type: form.studentType,
        academic_year: form.academicYear, admission_date: form.admissionDate || null,
        admission_number: form.admissionNo, registration_number: form.registrationNo,
        class_level: form.className, section: form.section || null, roll_number: form.roll,
        house: form.house, previous_school: form.previousSchool,
        email: form.email, phone: form.mobile,
        address: form.presentAddress, permanent_address: form.permanentAddress,
        city: form.city, state: form.state, country: form.country, postal_code: form.postalCode,
        allergies: form.allergies, medical_conditions: form.medicalConditions,
        regular_medication: form.regularMedication, doctor_name: form.doctorName,
        doctor_phone: form.doctorPhone, medical_note: form.emergencyMedicalNote,
        emergency_contact_name: contact.name, emergency_contact_phone: contact.phone,
        admin_notes: form.adminNotes,
        ...(photoId !== undefined ? { photo_id: photoId } : {}),
      };
      const guardians: GuardianInput[] = [
        { relation: "father", full_name: form.fatherName, occupation: form.fatherOccupation,
          phone: form.fatherPhone, email: form.fatherEmail, is_primary: true },
        { relation: "mother", full_name: form.motherName, occupation: form.motherOccupation,
          phone: form.motherPhone, email: form.motherEmail, is_primary: !form.fatherName },
        { relation: form.guardianRelation || "guardian", full_name: form.guardianName,
          phone: form.guardianPhone, is_primary: !form.fatherName && !form.motherName },
      ];
      const saved = await saving.mutateAsync({ id: mode === "edit" ? studentId : undefined, payload, guardians });
      if (mode === "edit" && record.data && form.status !== record.data.status) {
        await changeStudentStatus(saved.id, form.status, "Updated from the student form");
      }
      toast.success(mode === "create" ? `Student "${fullName}" added.` : `Student "${fullName}" updated.`);
      navigate(`/students/${saved.id}`);
    } catch (e) {
      toast.error(errorMessage(e, "Couldn't save the student."));
    }
  }

  function handleReset() {
    setForm(record.data ? recordToForm(record.data) : EMPTY);
    setErrors({});
    setPhotoFile(null);
    setPhotoRemoved(false);
    if (!record.data) setPhoto(null);
  }

  const sectionChoices = (options.data?.sections ?? []).filter((sec) => sec.classId === form.className);

  // ── Error count per section ──────────────────────────────────────────
  const errCount = {
    student:  countErrors(errors, ["firstName","lastName","gender","dateOfBirth"]),
    academic: countErrors(errors, ["admissionNo","registrationNo","className","section"]),
    parent:   countErrors(errors, ["fatherName","emergencyContact"]),
    contact:  countErrors(errors, ["presentAddress"]),
  };

  const title = mode === "create" ? "Add Student" : "Edit Student";

  // Grid helpers
  const g4 = "grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4";
  const g3 = "grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3";
  const g2 = "grid grid-cols-1 gap-4 sm:grid-cols-2";

  return (
    <div className="space-y-4">
      {/* ── Header action card ──────────────────────────────────────── */}
      <Card className="rounded-2xl shadow-sm">
        <CardContent className="flex flex-wrap items-center justify-between gap-3 py-4">
          <div>
            <p className="text-sm font-semibold text-foreground">{title} Form</p>
            <p className="text-xs text-muted-foreground">
              {mode === "create"
                ? "Fill in all required fields (*) to register a new student."
                : "Update the student record. Required fields are marked with *."}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="gap-1.5"
              onClick={() => navigate("/students/admission-form/print")}
            >
              <Printer className="h-3.5 w-3.5" />
              Print Blank Form
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="gap-1.5"
              onClick={handleReset}
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Reset
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="gap-1.5 text-muted-foreground"
              onClick={() => navigate("/students")}
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Back
            </Button>
            <Button
              type="button"
              size="sm"
              className="gap-1.5"
              disabled={saving.isPending}
              onClick={handleSubmit}
            >
              <Save className="h-3.5 w-3.5" />
              {saving.isPending ? "Saving…" : mode === "create" ? "Save Student" : "Update Student"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* ── Section 1: Student Information ─────────────────────────── */}
      <FormSection
        icon={User}
        title="Student Information"
        subtitle="Basic personal details of the student"
        defaultOpen
        errorCount={errCount.student}
      >
        <div className="space-y-4">
          {/* Row: name */}
          <div className={g4}>
            <Field label="First Name" required error={errors.firstName} id="firstName">
              <TextInput id="firstName" value={form.firstName} onChange={(v) => set("firstName", v)} placeholder="e.g. Richi" error={errors.firstName} />
            </Field>
            <Field label="Middle Name">
              <TextInput value={form.middleName} onChange={(v) => set("middleName", v)} placeholder="Optional" />
            </Field>
            <Field label="Last Name" required error={errors.lastName} id="lastName">
              <TextInput id="lastName" value={form.lastName} onChange={(v) => set("lastName", v)} placeholder="e.g. Hassan" error={errors.lastName} />
            </Field>
            <Field label="Full Name (auto)" hint="Computed from first / last name">
              <TextInput
                value={[form.firstName, form.middleName, form.lastName].filter(Boolean).join(" ")}
                readOnly placeholder="Auto-filled"
              />
            </Field>
          </div>

          {/* Row: bio */}
          <div className={g4}>
            <Field label="Gender" required error={errors.gender} id="gender">
              <SelectInput value={form.gender} onChange={(v) => set("gender", v)} placeholder="Select gender" error={errors.gender}>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </SelectInput>
            </Field>
            <Field label="Date of Birth" required error={errors.dateOfBirth} id="dateOfBirth">
              <DateInput value={form.dateOfBirth} onChange={(v) => set("dateOfBirth", v)} error={errors.dateOfBirth} />
            </Field>
            <Field label="Age (auto)" hint="Computed from date of birth">
              <TextInput value={calcAge(form.dateOfBirth)} readOnly placeholder="Auto-filled" />
            </Field>
            <Field label="Blood Group">
              <SelectInput value={form.bloodGroup} onChange={(v) => set("bloodGroup", v)} placeholder="Select">
                {["A+","A−","B+","B−","AB+","AB−","O+","O−"].map((g) => <option key={g}>{g}</option>)}
              </SelectInput>
            </Field>
          </div>

          {/* Row: extras */}
          <div className={g4}>
            <Field label="Nationality">
              <TextInput value={form.nationality} onChange={(v) => set("nationality", v)} placeholder="e.g. Australian" />
            </Field>
            <Field label="Religion">
              <TextInput value={form.religion} onChange={(v) => set("religion", v)} placeholder="Optional" />
            </Field>
            <Field label="Student Type">
              <SelectInput value={form.studentType} onChange={(v) => set("studentType", v)} placeholder="Select type">
                <option value="new">New</option>
                <option value="transfer">Transfer</option>
                <option value="returning">Returning</option>
              </SelectInput>
            </Field>
            {mode === "edit" && hasPermission("student.promote") && (
            <Field label="Status" hint="Changes are recorded in the student's history">
              <SelectInput value={form.status} onChange={(v) => set("status", v)}>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="suspended">Suspended</option>
                <option value="transferred">Transferred</option>
                <option value="graduated">Graduated</option>
                <option value="left">Left</option>
              </SelectInput>
            </Field>
            )}
          </div>

          {/* Photo */}
          <PhotoUpload
            value={photo}
            onChange={(url, file) => { setPhoto(url); setPhotoFile(file); setPhotoRemoved(!url); }}
            label="Student Photo"
          />
        </div>
      </FormSection>

      {/* ── Section 2: Academic Information ────────────────────────── */}
      <FormSection
        icon={GraduationCap}
        title="Academic Information"
        subtitle="Enrollment and class assignment details"
        defaultOpen
        errorCount={errCount.academic}
      >
        <div className="space-y-4">
          <div className={g4}>
            <Field label="Academic Year" required>
              <SelectInput value={form.academicYear} onChange={(v) => set("academicYear", v)} placeholder="Select year">
                {(options.data?.years ?? []).map((y) => <option key={y.id} value={y.id}>{y.name}</option>)}
              </SelectInput>
            </Field>
            <Field label="Admission Date">
              <DateInput value={form.admissionDate} onChange={(v) => set("admissionDate", v)} />
            </Field>
            <Field label="Admission No" required error={errors.admissionNo} id="admissionNo"
              hint="Format: ADM-2901">
              <TextInput id="admissionNo" value={form.admissionNo} onChange={(v) => set("admissionNo", v)} placeholder="ADM-0001" error={errors.admissionNo} />
            </Field>
            <Field label="Registration No" error={errors.registrationNo} id="registrationNo"
              hint="Leave blank to assign the next number automatically">
              <TextInput id="registrationNo" value={form.registrationNo} onChange={(v) => set("registrationNo", v)} placeholder="REG-2026-0001" error={errors.registrationNo} />
            </Field>
          </div>

          <div className={g4}>
            <Field label="Class" required error={errors.className} id="className">
              <SelectInput value={form.className} onChange={(v) => set("className", v)} placeholder="Select class" error={errors.className}>
                {(options.data?.classes ?? []).map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </SelectInput>
            </Field>
            <Field label="Section" required error={errors.section} id="section">
              <SelectInput value={form.section} onChange={(v) => set("section", v)} placeholder="Select section" error={errors.section}>
                {sectionChoices.map((sec) => <option key={sec.id} value={sec.id}>Section {sec.name}</option>)}
              </SelectInput>
            </Field>
            <Field label="Roll Number">
              <TextInput value={form.roll} onChange={(v) => set("roll", v)} placeholder="e.g. 42" />
            </Field>
            <Field label="House">
              <SelectInput value={form.house} onChange={(v) => set("house", v)} placeholder="Select house">
                <option>Red House</option>
                <option>Blue House</option>
                <option>Green House</option>
                <option>Yellow House</option>
              </SelectInput>
            </Field>
          </div>

          <div className={g4}>
            <Field label="Previous School">
              <TextInput value={form.previousSchool} onChange={(v) => set("previousSchool", v)} placeholder="Optional" />
            </Field>
          </div>
        </div>
      </FormSection>

      {/* ── Section 3: Parent / Guardian ───────────────────────────── */}
      <FormSection
        icon={Users}
        title="Parent / Guardian Information"
        subtitle="Family and emergency contact details"
        defaultOpen
        errorCount={errCount.parent}
      >
        <div className="space-y-5">
          {/* Father */}
          <div>
            <p className="mb-3 text-[10.5px] font-semibold uppercase tracking-widest text-muted-foreground/60">Father</p>
            <div className={g4}>
              <Field label="Father Name" required error={errors.fatherName} id="fatherName">
                <TextInput id="fatherName" value={form.fatherName} onChange={(v) => set("fatherName", v)} placeholder="Full name" error={errors.fatherName} />
              </Field>
              <Field label="Occupation">
                <TextInput value={form.fatherOccupation} onChange={(v) => set("fatherOccupation", v)} placeholder="e.g. Businessman" />
              </Field>
              <Field label="Phone">
                <TextInput value={form.fatherPhone} onChange={(v) => set("fatherPhone", v)} placeholder="+1 000 000 0000" />
              </Field>
              <Field label="Email">
                <TextInput value={form.fatherEmail} onChange={(v) => set("fatherEmail", v)} placeholder="email@example.com" />
              </Field>
            </div>
          </div>

          <div className="h-px bg-border/60" />

          {/* Mother */}
          <div>
            <p className="mb-3 text-[10.5px] font-semibold uppercase tracking-widest text-muted-foreground/60">Mother</p>
            <div className={g4}>
              <Field label="Mother Name">
                <TextInput value={form.motherName} onChange={(v) => set("motherName", v)} placeholder="Full name" />
              </Field>
              <Field label="Occupation">
                <TextInput value={form.motherOccupation} onChange={(v) => set("motherOccupation", v)} placeholder="e.g. Homemaker" />
              </Field>
              <Field label="Phone">
                <TextInput value={form.motherPhone} onChange={(v) => set("motherPhone", v)} placeholder="+1 000 000 0000" />
              </Field>
              <Field label="Email">
                <TextInput value={form.motherEmail} onChange={(v) => set("motherEmail", v)} placeholder="email@example.com" />
              </Field>
            </div>
          </div>

          <div className="h-px bg-border/60" />

          {/* Guardian / Emergency */}
          <div>
            <p className="mb-3 text-[10.5px] font-semibold uppercase tracking-widest text-muted-foreground/60">Guardian / Emergency</p>
            <div className={g4}>
              <Field label="Guardian Name">
                <TextInput value={form.guardianName} onChange={(v) => set("guardianName", v)} placeholder="If different from parents" />
              </Field>
              <Field label="Relation">
                <TextInput value={form.guardianRelation} onChange={(v) => set("guardianRelation", v)} placeholder="e.g. Uncle" />
              </Field>
              <Field label="Guardian Phone">
                <TextInput value={form.guardianPhone} onChange={(v) => set("guardianPhone", v)} placeholder="+1 000 000 0000" />
              </Field>
              <Field label="Emergency Contact" required error={errors.emergencyContact} id="emergencyContact">
                <TextInput id="emergencyContact" value={form.emergencyContact} onChange={(v) => set("emergencyContact", v)} placeholder="+1 000 000 0000" error={errors.emergencyContact} />
              </Field>
            </div>
          </div>
        </div>
      </FormSection>

      {/* ── Section 4: Contact & Address ───────────────────────────── */}
      <FormSection
        icon={MapPin}
        title="Contact & Address"
        subtitle="Student contact information and residential address"
        defaultOpen
        errorCount={errCount.contact}
      >
        <div className="space-y-4">
          <div className={g2}>
            <Field label="Student Email">
              <TextInput value={form.email} onChange={(v) => set("email", v)} placeholder="student@example.com" />
            </Field>
            <Field label="Student Mobile">
              <TextInput value={form.mobile} onChange={(v) => set("mobile", v)} placeholder="+1 000 000 0000" />
            </Field>
          </div>

          <Field label="Present Address" required error={errors.presentAddress} id="presentAddress">
            <TextareaInput value={form.presentAddress} onChange={(v) => set("presentAddress", v)} placeholder="Full current address" rows={2} />
          </Field>

          {/* Same as present */}
          <label className="flex cursor-pointer items-center gap-2.5 rounded-xl border border-border/60 bg-muted/30 px-3.5 py-2.5">
            <input
              type="checkbox"
              className="h-4 w-4 rounded border-input accent-primary"
              checked={form.sameAddress}
              onChange={(e) => set("sameAddress", e.target.checked)}
            />
            <span className="text-sm text-foreground">Permanent address same as present address</span>
          </label>

          <Field label="Permanent Address" required error={errors.permanentAddress}>
            <TextareaInput
              value={form.permanentAddress}
              onChange={(v) => !form.sameAddress && set("permanentAddress", v)}
              placeholder="Full permanent address"
              rows={2}
            />
          </Field>

          <div className={g4}>
            <Field label="City">
              <TextInput value={form.city} onChange={(v) => set("city", v)} placeholder="e.g. Sydney" />
            </Field>
            <Field label="State / Province">
              <TextInput value={form.state} onChange={(v) => set("state", v)} placeholder="e.g. NSW" />
            </Field>
            <Field label="Country">
              <TextInput value={form.country} onChange={(v) => set("country", v)} placeholder="e.g. Australia" />
            </Field>
            <Field label="Postal Code">
              <TextInput value={form.postalCode} onChange={(v) => set("postalCode", v)} placeholder="e.g. 2000" />
            </Field>
          </div>
        </div>
      </FormSection>

      {/* ── Section 5: Medical ──────────────────────────────────────── */}
      <FormSection
        icon={Heart}
        title="Medical Information"
        subtitle="Health conditions and emergency medical details"
        defaultOpen={false}
      >
        <div className="space-y-4">
          <div className={g3}>
            <Field label="Allergies">
              <TextInput value={form.allergies} onChange={(v) => set("allergies", v)} placeholder="e.g. Dust, Pollen" />
            </Field>
            <Field label="Medical Conditions">
              <TextInput value={form.medicalConditions} onChange={(v) => set("medicalConditions", v)} placeholder="If any" />
            </Field>
            <Field label="Regular Medication">
              <TextInput value={form.regularMedication} onChange={(v) => set("regularMedication", v)} placeholder="If any" />
            </Field>
          </div>
          <div className={g3}>
            <Field label="Doctor Name">
              <TextInput value={form.doctorName} onChange={(v) => set("doctorName", v)} placeholder="Primary care doctor" />
            </Field>
            <Field label="Doctor Phone">
              <TextInput value={form.doctorPhone} onChange={(v) => set("doctorPhone", v)} placeholder="+1 000 000 0000" />
            </Field>
            <Field label="Emergency Medical Note">
              <TextInput value={form.emergencyMedicalNote} onChange={(v) => set("emergencyMedicalNote", v)} placeholder="Any critical notes" />
            </Field>
          </div>
        </div>
      </FormSection>

      {/* ── Section 6: Transport / Hostel ──────────────────────────── */}
      <FormSection
        icon={Bus}
        title="Transport / Hostel"
        subtitle="School bus and residential hostel assignment"
        defaultOpen={false}
      >
        <p className="rounded-xl bg-muted/50 px-3.5 py-3 text-xs text-muted-foreground">
          Transport and hostel aren't set up for this school yet. Assignments will be available here
          once those modules are enabled.
        </p>
      </FormSection>

      {/* ── Section 7: Documents ───────────────────────────────────── */}
      <FormSection
        icon={FileText}
        title="Documents"
        subtitle="Upload required admission documents"
        defaultOpen={false}
      >
        <DocumentChecklist studentId={mode === "edit" ? studentId : undefined} canVerify={hasPermission("student.update")} />
      </FormSection>

      {/* ── Section 8: Remarks ──────────────────────────────────────── */}
      <FormSection
        icon={BookOpen}
        title="Remarks"
        subtitle="Internal notes and administrative remarks"
        defaultOpen={false}
      >
        <div className="space-y-4">
          <Field label="Admin Notes">
            <TextareaInput value={form.adminNotes} onChange={(v) => set("adminNotes", v)} placeholder="Internal notes (staff only)" />
          </Field>
        </div>
      </FormSection>

      {/* ── Bottom save bar ─────────────────────────────────────────── */}
      <Card className="rounded-2xl shadow-sm">
        <CardContent className="flex flex-wrap items-center justify-between gap-3 py-4">
          <p className="text-xs text-muted-foreground">
            Fields marked with <span className="text-destructive font-semibold">*</span> are required.
          </p>
          <div className="flex gap-2">
            <Button type="button" variant="outline" size="sm" onClick={handleReset} className="gap-1.5">
              <RotateCcw className="h-3.5 w-3.5" />
              Reset
            </Button>
            <Button type="button" size="sm" onClick={handleSubmit} disabled={saving.isPending} className="gap-1.5">
              <Save className="h-3.5 w-3.5" />
              {saving.isPending ? "Saving…" : mode === "create" ? "Save Student" : "Update Student"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
