/* PrintableAdmissionForm — rendered as the print target.
   Inject @media print CSS via the parent page. */

const DOCS = [
  "Birth Certificate",
  "Transfer Certificate",
  "Previous Marksheet",
  "Student Photo",
  "Parent / Guardian ID",
  "Medical Form",
  "Address Proof",
];

function Line({ label, wide }: { label: string; wide?: boolean }) {
  return (
    <div className={wide ? "flex-1" : "flex-1"} style={{ minWidth: wide ? 220 : 140 }}>
      <div style={{ borderBottom: "1px solid #000", minHeight: 22, marginBottom: 2 }} />
      <p style={{ fontSize: 9, color: "#555", marginTop: 2 }}>{label}</p>
    </div>
  );
}

function Checkbox({ label }: { label: string }) {
  return (
    <label style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 10, marginBottom: 4 }}>
      <span style={{ display: "inline-block", width: 14, height: 14, border: "1.5px solid #000", flexShrink: 0 }} />
      {label}
    </label>
  );
}

function SectionTitle({ title }: { title: string }) {
  return (
    <div
      style={{
        background: "#1a1a2e",
        color: "#fff",
        padding: "4px 10px",
        fontSize: 11,
        fontWeight: 700,
        letterSpacing: "0.08em",
        textTransform: "uppercase",
        marginBottom: 10,
        marginTop: 14,
        borderRadius: 2,
      }}
    >
      {title}
    </div>
  );
}

function SigLine({ label }: { label: string }) {
  return (
    <div style={{ flex: 1, textAlign: "center", minWidth: 140 }}>
      <div style={{ borderBottom: "1px solid #000", marginBottom: 3, height: 36 }} />
      <p style={{ fontSize: 9, color: "#555" }}>{label}</p>
    </div>
  );
}

export function PrintableAdmissionForm() {
  return (
    <div
      id="admission-form-print"
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
      {/* ── School header ──────────────────────────────────────────────── */}
      <div style={{ display: "flex", alignItems: "center", gap: 16, borderBottom: "2.5px solid #000", paddingBottom: 10, marginBottom: 12 }}>
        {/* Logo placeholder */}
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
            Student Admission Form
          </p>
        </div>
        <div style={{ width: 64 }} />
      </div>

      {/* ── Top meta row ───────────────────────────────────────────────── */}
      <div style={{ display: "flex", gap: 24, marginBottom: 14, alignItems: "flex-start" }}>
        {/* Left: key refs */}
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", gap: 16, marginBottom: 8 }}>
            <Line label="Academic Year" />
            <Line label="Date" />
          </div>
          <div style={{ display: "flex", gap: 16, marginBottom: 8 }}>
            <Line label="Registration No." wide />
            <Line label="Admission No." wide />
          </div>
          <div style={{ display: "flex", gap: 16 }}>
            <Line label="Class Applied For" />
            <Line label="Section" />
          </div>
        </div>
        {/* Right: photo box */}
        <div style={{ flexShrink: 0, textAlign: "center" }}>
          <div style={{ width: 90, height: 110, border: "1.5px solid #000", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, color: "#555" }}>
            Student<br />Photo
          </div>
          <p style={{ fontSize: 8, color: "#555", marginTop: 2 }}>150 × 150 px</p>
        </div>
      </div>

      {/* ── 1. Student Information ─────────────────────────────────────── */}
      <SectionTitle title="1. Student Information" />
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
            <Checkbox label="Male" />
            <Checkbox label="Female" />
          </div>
        </div>
        <Line label="Nationality" />
        <Line label="Religion" />
      </div>
      <div style={{ display: "flex", gap: 16, marginBottom: 4 }}>
        <div style={{ flex: 1 }}>
          <p style={{ fontSize: 9, marginBottom: 3, fontWeight: 600 }}>Student Type:</p>
          <div style={{ display: "flex", gap: 12 }}>
            <Checkbox label="New" />
            <Checkbox label="Transfer" />
            <Checkbox label="Returning" />
          </div>
        </div>
        <Line label="Previous School" wide />
      </div>

      {/* ── 2. Academic Information ────────────────────────────────────── */}
      <SectionTitle title="2. Academic Information" />
      <div style={{ display: "flex", gap: 16, marginBottom: 8 }}>
        <Line label="Academic Year / Session *" />
        <Line label="Admission Date *" />
        <Line label="Medium" />
        <Line label="Shift" />
      </div>
      <div style={{ display: "flex", gap: 16, marginBottom: 8 }}>
        <Line label="Class *" />
        <Line label="Section *" />
        <Line label="Roll Number" />
        <Line label="House" />
      </div>

      {/* ── 3. Parent / Guardian Information ──────────────────────────── */}
      <SectionTitle title="3. Parent / Guardian Information" />
      <div style={{ display: "flex", gap: 8, marginBottom: 2 }}>
        <div style={{ flex: 1 }}>
          <p style={{ fontWeight: 700, fontSize: 9, marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.06em" }}>Father</p>
          <div style={{ display: "flex", gap: 12, marginBottom: 6 }}>
            <Line label="Father Name *" wide />
            <Line label="Occupation" wide />
          </div>
          <div style={{ display: "flex", gap: 12 }}>
            <Line label="Phone" />
            <Line label="Email" wide />
          </div>
        </div>
        <div style={{ width: 1, background: "#ddd", margin: "0 8px" }} />
        <div style={{ flex: 1 }}>
          <p style={{ fontWeight: 700, fontSize: 9, marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.06em" }}>Mother</p>
          <div style={{ display: "flex", gap: 12, marginBottom: 6 }}>
            <Line label="Mother Name *" wide />
            <Line label="Occupation" wide />
          </div>
          <div style={{ display: "flex", gap: 12 }}>
            <Line label="Phone" />
            <Line label="Email" wide />
          </div>
        </div>
      </div>
      <div style={{ display: "flex", gap: 16, marginTop: 8, marginBottom: 4 }}>
        <Line label="Guardian Name" />
        <Line label="Relation" />
        <Line label="Guardian Phone *" />
        <Line label="Emergency Contact *" />
      </div>

      {/* ── 4. Contact & Address ───────────────────────────────────────── */}
      <SectionTitle title="4. Contact &amp; Address" />
      <div style={{ display: "flex", gap: 16, marginBottom: 8 }}>
        <Line label="Student Email" wide />
        <Line label="Student Mobile" wide />
      </div>
      <div style={{ marginBottom: 8 }}>
        <Line label="Present Address *" wide />
      </div>
      <div style={{ marginBottom: 8 }}>
        <Line label="Permanent Address *" wide />
      </div>
      <div style={{ display: "flex", gap: 16, marginBottom: 4 }}>
        <Line label="City" />
        <Line label="State / Province" />
        <Line label="Country" />
        <Line label="Postal Code" />
      </div>

      {/* ── 5. Medical Information ─────────────────────────────────────── */}
      <SectionTitle title="5. Medical Information" />
      <div style={{ display: "flex", gap: 16, marginBottom: 8 }}>
        <Line label="Allergies" wide />
        <Line label="Medical Conditions" wide />
      </div>
      <div style={{ display: "flex", gap: 16, marginBottom: 4 }}>
        <Line label="Regular Medication" wide />
        <Line label="Doctor Name" />
        <Line label="Doctor Phone" />
      </div>

      {/* ── 6. Transport / Hostel ──────────────────────────────────────── */}
      <SectionTitle title="6. Transport / Hostel" />
      <div style={{ display: "flex", gap: 20, marginBottom: 6 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <p style={{ fontSize: 9, fontWeight: 600 }}>Transport Required:</p>
          <Checkbox label="Yes" />
          <Checkbox label="No" />
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <p style={{ fontSize: 9, fontWeight: 600 }}>Hostel Required:</p>
          <Checkbox label="Yes" />
          <Checkbox label="No" />
        </div>
      </div>
      <div style={{ display: "flex", gap: 16, marginBottom: 4 }}>
        <Line label="Bus Route" />
        <Line label="Pickup Point" />
        <Line label="Hostel Name" />
        <Line label="Room No." />
      </div>

      {/* ── 7. Document Checklist ──────────────────────────────────────── */}
      <SectionTitle title="7. Document Checklist" />
      <div style={{ display: "flex", flexWrap: "wrap", gap: "0 40px" }}>
        {DOCS.map((d) => (
          <Checkbox key={d} label={d} />
        ))}
      </div>

      {/* ── 8. Declaration ─────────────────────────────────────────────── */}
      <SectionTitle title="8. Declaration" />
      <p style={{ fontSize: 10, marginBottom: 12, fontStyle: "italic" }}>
        I hereby declare that all information provided above is true, complete, and correct to the best of my knowledge.
        I understand that providing false information may result in cancellation of admission.
      </p>

      {/* ── Signatures ─────────────────────────────────────────────────── */}
      <div style={{ display: "flex", gap: 24, marginTop: 20, marginBottom: 20 }}>
        <SigLine label="Parent / Guardian Signature" />
        <SigLine label="Student Signature" />
        <SigLine label="Date" />
      </div>

      {/* ── Office Use Only ────────────────────────────────────────────── */}
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
            <p style={{ fontSize: 9, fontWeight: 600, marginBottom: 3 }}>Admission Status:</p>
            <div style={{ display: "flex", gap: 16 }}>
              <Checkbox label="Approved" />
              <Checkbox label="Pending" />
              <Checkbox label="Rejected" />
            </div>
          </div>
          <Line label="Remarks" wide />
        </div>
        <div style={{ display: "flex", gap: 24, marginTop: 16 }}>
          <SigLine label="Principal Signature" />
          <SigLine label="Admin Officer" />
        </div>
      </div>

      {/* Footer */}
      <p style={{ textAlign: "center", fontSize: 8, color: "#888", marginTop: 12, borderTop: "1px solid #ddd", paddingTop: 6 }}>
        School Management System · Student Admission Form · Confidential
      </p>
    </div>
  );
}
