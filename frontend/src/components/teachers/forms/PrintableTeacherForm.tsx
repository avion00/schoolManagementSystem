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

function Line({ label, wide }: { label: string; wide?: boolean }) {
  return (
    <div style={{ flex: 1, minWidth: wide ? 200 : 130 }}>
      <div style={{ borderBottom: "1px solid #000", minHeight: 22, marginBottom: 2 }} />
      <p style={{ fontSize: 9, color: "#555", marginTop: 2 }}>{label}</p>
    </div>
  );
}

function Check({ label }: { label: string }) {
  return (
    <label style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 10, marginBottom: 4 }}>
      <span style={{ display: "inline-block", width: 14, height: 14, border: "1.5px solid #000", flexShrink: 0 }} />
      {label}
    </label>
  );
}

function SectionTitle({ title }: { title: string }) {
  return (
    <div style={{
      background: "#1a1a2e", color: "#fff", padding: "4px 10px", fontSize: 11, fontWeight: 700,
      letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 10, marginTop: 14, borderRadius: 2,
    }}>
      {title}
    </div>
  );
}

function SigLine({ label }: { label: string }) {
  return (
    <div style={{ flex: 1, textAlign: "center", minWidth: 130 }}>
      <div style={{ borderBottom: "1px solid #000", marginBottom: 3, height: 36 }} />
      <p style={{ fontSize: 9, color: "#555" }}>{label}</p>
    </div>
  );
}

export function PrintableTeacherForm() {
  return (
    <div
      id="teacher-form-print"
      style={{
        fontFamily: "Arial, Helvetica, sans-serif",
        color: "#000",
        background: "#fff",
        maxWidth: 794,
        margin: "0 auto",
        padding: "20px 28px",
        fontSize: 11,
        lineHeight: 1.4,
      }}
    >
      {/* School header */}
      <div style={{ display: "flex", alignItems: "center", gap: 16, borderBottom: "2.5px solid #000", paddingBottom: 10, marginBottom: 12 }}>
        <div style={{ width: 64, height: 64, border: "1.5px solid #000", borderRadius: 4, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: 9, color: "#555", textAlign: "center" }}>
          School<br />Logo
        </div>
        <div style={{ flex: 1, textAlign: "center" }}>
          <p style={{ fontSize: 20, fontWeight: 800, letterSpacing: "0.04em", marginBottom: 2 }}>
            SCHOOL MANAGEMENT SYSTEM
          </p>
          <p style={{ fontSize: 10, color: "#444" }}>
            123 School Road, Education City · Phone: +1 (000) 000-0000 · info@school.edu
          </p>
          <p style={{ fontSize: 15, fontWeight: 700, marginTop: 6, letterSpacing: "0.06em", textTransform: "uppercase" }}>
            Staff / Teacher Registration Form
          </p>
        </div>
        <div style={{ width: 64 }} />
      </div>

      {/* Top meta */}
      <div style={{ display: "flex", gap: 24, marginBottom: 14, alignItems: "flex-start" }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", gap: 16, marginBottom: 8 }}>
            <Line label="Academic Year" />
            <Line label="Date" />
          </div>
          <div style={{ display: "flex", gap: 16 }}>
            <Line label="Employee ID" wide />
            <Line label="Staff Code" wide />
          </div>
        </div>
        <div style={{ flexShrink: 0, textAlign: "center" }}>
          <div style={{ width: 90, height: 110, border: "1.5px solid #000", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, color: "#555" }}>
            Staff<br />Photo
          </div>
          <p style={{ fontSize: 8, color: "#555", marginTop: 2 }}>150 × 150 px</p>
        </div>
      </div>

      {/* 1. Personal Information */}
      <SectionTitle title="1. Personal Information" />
      <div style={{ display: "flex", gap: 16, marginBottom: 8 }}>
        <Line label="First Name *" />
        <Line label="Middle Name" />
        <Line label="Last Name *" />
      </div>
      <div style={{ display: "flex", gap: 16, marginBottom: 8 }}>
        <Line label="Date of Birth *" />
        <Line label="Age" />
        <Line label="Blood Group" />
      </div>
      <div style={{ display: "flex", gap: 16, marginBottom: 8 }}>
        <div style={{ flex: 1 }}>
          <p style={{ fontSize: 9, marginBottom: 3, fontWeight: 600 }}>Gender *:</p>
          <div style={{ display: "flex", gap: 16 }}>
            <Check label="Male" />
            <Check label="Female" />
          </div>
        </div>
        <Line label="Nationality" />
        <Line label="Religion" />
      </div>
      <div style={{ display: "flex", gap: 16, marginBottom: 4 }}>
        <div style={{ flex: 1 }}>
          <p style={{ fontSize: 9, marginBottom: 3, fontWeight: 600 }}>Marital Status:</p>
          <div style={{ display: "flex", gap: 12 }}>
            <Check label="Single" />
            <Check label="Married" />
            <Check label="Other" />
          </div>
        </div>
        <Line label="Spouse Name" wide />
      </div>

      {/* 2. Employment Details */}
      <SectionTitle title="2. Employment Details" />
      <div style={{ display: "flex", gap: 16, marginBottom: 8 }}>
        <Line label="Employee ID *" />
        <Line label="Staff Code *" />
        <Line label="Designation *" />
      </div>
      <div style={{ display: "flex", gap: 16, marginBottom: 8 }}>
        <Line label="Department *" wide />
        <Line label="Joining Date *" wide />
        <div style={{ flex: 1 }}>
          <p style={{ fontSize: 9, marginBottom: 3, fontWeight: 600 }}>Employment Type *:</p>
          <div style={{ display: "flex", gap: 8 }}>
            <Check label="Full-time" />
            <Check label="Part-time" />
            <Check label="Contract" />
            <Check label="Substitute" />
          </div>
        </div>
      </div>

      {/* 3. Academic Assignment */}
      <SectionTitle title="3. Academic Assignment" />
      <div style={{ display: "flex", gap: 16, marginBottom: 8 }}>
        <Line label="Primary Subject *" wide />
        <Line label="Secondary Subjects" wide />
        <Line label="Class Teacher of" />
      </div>
      <div style={{ display: "flex", gap: 16, marginBottom: 4 }}>
        <Line label="Assigned Classes" wide />
        <Line label="Weekly Periods" />
        <Line label="Exam Duties" wide />
      </div>

      {/* 4. Qualification & Experience */}
      <SectionTitle title="4. Qualification &amp; Experience" />
      <div style={{ display: "flex", gap: 16, marginBottom: 8 }}>
        <Line label="Highest Qualification *" wide />
        <Line label="Years of Experience" />
        <Line label="Certifications" wide />
      </div>
      <div style={{ marginBottom: 8 }}>
        <Line label="Previous Schools / Institutions" wide />
      </div>
      <div style={{ marginBottom: 4 }}>
        <Line label="Skills" wide />
      </div>

      {/* 5. Contact & Address */}
      <SectionTitle title="5. Contact &amp; Address" />
      <div style={{ display: "flex", gap: 16, marginBottom: 8 }}>
        <Line label="Phone *" />
        <Line label="Alternate Phone" />
        <Line label="Email *" wide />
      </div>
      <div style={{ marginBottom: 8 }}>
        <Line label="Present Address *" wide />
      </div>
      <div style={{ marginBottom: 4 }}>
        <Line label="Permanent Address" wide />
      </div>
      <div style={{ display: "flex", gap: 16, marginBottom: 4 }}>
        <Line label="Emergency Contact *" />
        <Line label="Relation" />
      </div>

      {/* 6. Salary & Bank */}
      <SectionTitle title="6. Salary &amp; Bank Details" />
      <div style={{ display: "flex", gap: 16, marginBottom: 8 }}>
        <Line label="Basic Salary" />
        <Line label="House Allowance" />
        <Line label="Transport Allowance" />
        <Line label="Other Allowance" />
      </div>
      <div style={{ display: "flex", gap: 16, marginBottom: 4 }}>
        <Line label="Bank Name" wide />
        <Line label="Account Number" wide />
        <div style={{ flex: 1 }}>
          <p style={{ fontSize: 9, marginBottom: 3, fontWeight: 600 }}>Payment Method:</p>
          <div style={{ display: "flex", gap: 10 }}>
            <Check label="Bank Transfer" />
            <Check label="Cash" />
            <Check label="Cheque" />
          </div>
        </div>
      </div>

      {/* 7. Document Checklist */}
      <SectionTitle title="7. Document Checklist" />
      <div style={{ display: "flex", flexWrap: "wrap", gap: "0 40px" }}>
        {DOCS.map((d) => (
          <Check key={d} label={d} />
        ))}
      </div>

      {/* 8. Declaration */}
      <SectionTitle title="8. Declaration" />
      <p style={{ fontSize: 10, marginBottom: 12, fontStyle: "italic" }}>
        I hereby declare that all information provided above is true, complete, and accurate.
        I understand that any misrepresentation may lead to termination of employment.
      </p>

      {/* Signatures */}
      <div style={{ display: "flex", gap: 24, marginTop: 20, marginBottom: 20 }}>
        <SigLine label="Staff / Teacher Signature" />
        <SigLine label="HOD / Department Head" />
        <SigLine label="Date" />
      </div>

      {/* Office Use Only */}
      <div style={{ border: "1.5px solid #000", borderRadius: 4, padding: "8px 12px", marginTop: 8 }}>
        <p style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>
          Office Use Only
        </p>
        <div style={{ display: "flex", gap: 16, marginBottom: 8 }}>
          <Line label="Verified by" />
          <Line label="Approved by" />
          <Line label="Date" />
        </div>
        <div style={{ display: "flex", gap: 16, marginBottom: 4 }}>
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: 9, fontWeight: 600, marginBottom: 3 }}>Status:</p>
            <div style={{ display: "flex", gap: 16 }}>
              <Check label="Approved" />
              <Check label="Pending" />
              <Check label="Rejected" />
            </div>
          </div>
          <Line label="Remarks" wide />
        </div>
        <div style={{ display: "flex", gap: 24, marginTop: 16 }}>
          <SigLine label="Principal Signature" />
          <SigLine label="HR Officer" />
        </div>
      </div>

      <p style={{ textAlign: "center", fontSize: 8, color: "#888", marginTop: 12, borderTop: "1px solid #ddd", paddingTop: 6 }}>
        School Management System · Staff Registration Form · Confidential
      </p>
    </div>
  );
}
