export function PrintableParentForm() {
  const field = (label: string, width = "200px") => (
    <div style={{ marginBottom: "10px" }}>
      <div style={{ fontSize: "10px", color: "#555", marginBottom: "2px" }}>{label}</div>
      <div style={{ borderBottom: "1px solid #333", width, minHeight: "20px" }} />
    </div>
  );

  const checkbox = (label: string) => (
    <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "6px", fontSize: "11px" }}>
      <div style={{ width: "13px", height: "13px", border: "1px solid #333", flexShrink: 0 }} />
      <span>{label}</span>
    </div>
  );

  const sectionTitle = (n: string, title: string) => (
    <div style={{ background: "#1e293b", color: "#fff", padding: "6px 12px", fontSize: "11px", fontWeight: "bold", marginBottom: "10px", borderRadius: "4px" }}>
      {n}. {title}
    </div>
  );

  return (
    <div id="parent-form-print" style={{ fontFamily: "Arial, sans-serif", padding: "20mm", maxWidth: "210mm", margin: "0 auto", fontSize: "11px", lineHeight: 1.5, color: "#111" }}>
      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: "16px", borderBottom: "2px solid #1e293b", paddingBottom: "12px" }}>
        <div style={{ fontSize: "18px", fontWeight: "bold", color: "#1e293b" }}>ADVANCE SCHOOL</div>
        <div style={{ fontSize: "12px", color: "#444", marginTop: "2px" }}>PARENT / GUARDIAN REGISTRATION FORM</div>
        <div style={{ fontSize: "10px", color: "#888", marginTop: "4px" }}>Academic Year 2025–2026</div>
      </div>

      {/* Form ID row */}
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "16px" }}>
        <div style={{ fontSize: "10px" }}>Parent ID: <span style={{ borderBottom: "1px solid #333", display: "inline-block", width: "120px" }} /></div>
        <div style={{ fontSize: "10px" }}>Guardian Code: <span style={{ borderBottom: "1px solid #333", display: "inline-block", width: "100px" }} /></div>
        <div style={{ fontSize: "10px" }}>Date: <span style={{ borderBottom: "1px solid #333", display: "inline-block", width: "100px" }} /></div>
      </div>

      {/* Photo box */}
      <div style={{ float: "right", width: "90px", height: "110px", border: "1px solid #333", marginLeft: "16px", marginBottom: "8px", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <span style={{ fontSize: "9px", color: "#888", textAlign: "center" }}>Guardian Photo</span>
      </div>

      {/* Section A: Parent Info */}
      {sectionTitle("A", "Parent / Guardian Information")}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px 24px", marginBottom: "16px" }}>
        {field("Full Name", "100%")}
        {field("Gender", "100%")}
        {field("Relation to Student", "100%")}
        {field("Occupation", "100%")}
        {field("Nationality", "100%")}
        {field("Religion", "100%")}
        {field("Status", "100%")}
        {field("Date of Birth", "100%")}
      </div>
      <div style={{ clear: "both" }} />

      {/* Section B: Contact */}
      {sectionTitle("B", "Contact Information")}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px 24px", marginBottom: "16px" }}>
        {field("Phone Number", "100%")}
        {field("Alternate Phone", "100%")}
        {field("Email Address", "100%")}
        {field("Emergency Contact", "100%")}
        {field("Emergency Relation", "100%")}
      </div>
      <div style={{ marginBottom: "8px" }}>
        <div style={{ fontSize: "10px", color: "#555", marginBottom: "2px" }}>Present Address</div>
        <div style={{ borderBottom: "1px solid #333", minHeight: "20px", marginBottom: "4px" }} />
        <div style={{ borderBottom: "1px solid #333", minHeight: "20px" }} />
      </div>
      <div style={{ marginBottom: "16px" }}>
        <div style={{ fontSize: "10px", color: "#555", marginBottom: "2px" }}>Permanent Address (leave blank if same)</div>
        <div style={{ borderBottom: "1px solid #333", minHeight: "20px", marginBottom: "4px" }} />
        <div style={{ borderBottom: "1px solid #333", minHeight: "20px" }} />
      </div>

      {/* Section C: Linked Children */}
      {sectionTitle("C", "Linked Children")}
      {[1, 2, 3].map((n) => (
        <div key={n} style={{ border: "1px solid #ccc", borderRadius: "4px", padding: "8px 10px", marginBottom: "8px" }}>
          <div style={{ fontSize: "10px", fontWeight: "bold", color: "#555", marginBottom: "6px" }}>Child {n}</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "6px 16px" }}>
            {field("Student ID", "100%")}
            {field("Full Name", "100%")}
            {field("Class", "100%")}
            {field("Section", "100%")}
            {field("Roll No", "100%")}
          </div>
        </div>
      ))}

      {/* Section D: Documents */}
      {sectionTitle("D", "Documents Checklist")}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2px 24px", marginBottom: "16px" }}>
        {checkbox("Parent Citizenship Certificate")}
        {checkbox("Guardian Photo")}
        {checkbox("Address Proof")}
        {checkbox("Relationship Proof")}
        {checkbox("Emergency Contact Form")}
      </div>

      {/* Section E: Notes */}
      {sectionTitle("E", "Administrative Notes")}
      <div style={{ marginBottom: "8px" }}>
        <div style={{ fontSize: "10px", color: "#555", marginBottom: "2px" }}>Admin Notes</div>
        <div style={{ border: "1px solid #ccc", minHeight: "50px", borderRadius: "3px", padding: "4px" }} />
      </div>
      <div style={{ marginBottom: "24px" }}>
        <div style={{ fontSize: "10px", color: "#555", marginBottom: "2px" }}>Special Instructions</div>
        <div style={{ border: "1px solid #ccc", minHeight: "36px", borderRadius: "3px", padding: "4px" }} />
      </div>

      {/* Signatures */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px", marginBottom: "24px" }}>
        {["Guardian Signature", "Verified By", "Approved By"].map((s) => (
          <div key={s} style={{ textAlign: "center" }}>
            <div style={{ borderBottom: "1px solid #333", height: "40px", marginBottom: "4px" }} />
            <div style={{ fontSize: "10px", color: "#555" }}>{s}</div>
          </div>
        ))}
      </div>

      {/* Office use */}
      <div style={{ border: "1px solid #333", borderRadius: "4px", padding: "8px 12px" }}>
        <div style={{ fontSize: "10px", fontWeight: "bold", marginBottom: "6px" }}>OFFICE USE ONLY</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "6px 16px" }}>
          {field("Received By", "100%")}
          {field("Registration Date", "100%")}
          {field("Portal Access Granted", "100%")}
        </div>
      </div>
    </div>
  );
}
