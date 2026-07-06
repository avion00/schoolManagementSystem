export function PrintableSubjectForm() {
  const cell  = { border: "1px solid #000", padding: "4px 6px", fontSize: "11px" } as const;
  const label = { ...cell, background: "#f0f0f0", fontWeight: "600", width: "160px" } as const;
  const head  = { background: "#333", color: "#fff", padding: "5px 8px", fontSize: "12px", fontWeight: "700" } as const;
  const sub   = { background: "#e8e8e8", padding: "4px 8px", fontSize: "11px", fontWeight: "600", borderBottom: "1px solid #000" } as const;
  const blank = { border: "1px solid #000", height: "22px", padding: "0 6px", fontSize: "11px" } as const;

  const row3 = (a: string, b: string, c: string) => (
    <tr>
      <td style={label}>{a}</td><td style={blank} />
      <td style={label}>{b}</td><td style={blank} />
      <td style={label}>{c}</td><td style={blank} />
    </tr>
  );
  const row2 = (a: string, b: string) => (
    <tr>
      <td style={label}>{a}</td><td style={{ ...blank, colSpan: undefined }} colSpan={3} />
      <td style={label}>{b}</td><td style={blank} />
    </tr>
  );
  const rowFull = (a: string) => (
    <tr><td style={label}>{a}</td><td style={blank} colSpan={5} /></tr>
  );

  return (
    <div id="subject-form-print" style={{ fontFamily: "Arial, sans-serif", padding: "20px", maxWidth: "800px", margin: "0 auto", color: "#000" }}>

      {/* header */}
      <div style={{ textAlign: "center", marginBottom: "16px", borderBottom: "2px solid #000", paddingBottom: "10px" }}>
        <div style={{ fontSize: "18px", fontWeight: "800", letterSpacing: "1px" }}>SCHOOL MANAGEMENT SYSTEM</div>
        <div style={{ fontSize: "13px", fontWeight: "600", marginTop: "2px" }}>SUBJECT REGISTRATION FORM</div>
        <div style={{ fontSize: "11px", marginTop: "2px", color: "#555" }}>Academic Year: _____________ · Date: _____________</div>
      </div>

      {/* A: Basic Information */}
      <div style={{ marginBottom: "14px" }}>
        <div style={head}>A. BASIC INFORMATION</div>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <tbody>
            {row3("Subject Code", "Subject Name", "Academic Year")}
            {row3("Subject Type", "Category", "Status")}
            {row2("Department", "Default Room / Lab")}
            {rowFull("Description")}
            <tr><td colSpan={6} style={{ ...blank, height: "40px" }} /></tr>
          </tbody>
        </table>
      </div>

      {/* B: Teacher Assignment */}
      <div style={{ marginBottom: "14px" }}>
        <div style={head}>B. TEACHER ASSIGNMENT</div>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <tbody>
            {row3("Primary Teacher", "Employee ID", "Department")}
            {row3("Assistant Teacher", "Employee ID", "Department")}
            {row3("Weekly Load", "Contact", "Email")}
          </tbody>
        </table>
      </div>

      {/* C: Class Mappings */}
      <div style={{ marginBottom: "14px" }}>
        <div style={head}>C. CLASS MAPPINGS</div>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "11px" }}>
          <thead>
            <tr style={{ background: "#e8e8e8" }}>
              {["#","Class","Section","Teacher","Room","Periods/Week","Status"].map((h) => (
                <th key={h} style={{ border: "1px solid #000", padding: "4px 6px", fontWeight: "600", textAlign: "left" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[1,2,3,4,5,6].map((n) => (
              <tr key={n}>
                <td style={{ ...cell, width: "24px", textAlign: "center" }}>{n}</td>
                {[...Array(6)].map((_, i) => <td key={i} style={{ ...cell, minWidth: "80px" }} />)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* D: Periods & Schedule */}
      <div style={{ marginBottom: "14px" }}>
        <div style={head}>D. PERIODS &amp; SCHEDULE</div>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <tbody>
            {row3("Weekly Periods", "Credit Hours", "Exam Duration")}
          </tbody>
        </table>
      </div>

      {/* E: Marks Structure */}
      <div style={{ marginBottom: "14px" }}>
        <div style={head}>E. MARKS STRUCTURE</div>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <tbody>
            {row3("Full Marks", "Pass Marks", "Theory Marks")}
            {row3("Practical Marks", "Internal Marks", "GPA Enabled (Y/N)")}
          </tbody>
        </table>
      </div>

      {/* F: Assessment Requirements */}
      <div style={{ marginBottom: "14px" }}>
        <div style={head}>F. ASSESSMENT REQUIREMENTS</div>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "11px" }}>
          <thead>
            <tr style={{ background: "#e8e8e8" }}>
              {["Requirement","Required (Y/N)","Remarks"].map((h) => (
                <th key={h} style={{ border: "1px solid #000", padding: "4px 6px", fontWeight: "600", textAlign: "left" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {["Practical Exam","Project Work","Viva / Oral Exam","Assignments"].map((req) => (
              <tr key={req}>
                <td style={{ ...cell, width: "200px" }}>{req}</td>
                <td style={{ ...cell, width: "120px" }} />
                <td style={cell} />
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* G: Documents */}
      <div style={{ marginBottom: "14px" }}>
        <div style={head}>G. DOCUMENTS CHECKLIST</div>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "11px" }}>
          <thead>
            <tr style={{ background: "#e8e8e8" }}>
              {["Document","Submitted (✓)","Date","Remarks"].map((h) => (
                <th key={h} style={{ border: "1px solid #000", padding: "4px 6px", fontWeight: "600", textAlign: "left" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {["Syllabus 2026/27","Lesson Plan","Teacher's Resource Guide","Question Bank","Assignment Sheets","Reference Materials"].map((d) => (
              <tr key={d}>
                <td style={{ ...cell, width: "220px" }}>{d}</td>
                <td style={{ ...cell, width: "100px" }} />
                <td style={{ ...cell, width: "100px" }} />
                <td style={cell} />
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* H: Notes */}
      <div style={{ marginBottom: "14px" }}>
        <div style={head}>H. NOTES &amp; REMARKS</div>
        <div style={{ border: "1px solid #000", minHeight: "50px", padding: "6px 8px", fontSize: "11px" }} />
      </div>

      {/* signatures */}
      <div style={{ display: "flex", gap: "24px", marginTop: "20px", paddingTop: "12px", borderTop: "1px solid #000" }}>
        {["Subject Teacher","Department Head","Principal"].map((role) => (
          <div key={role} style={{ flex: 1, textAlign: "center" }}>
            <div style={{ borderTop: "1px solid #000", paddingTop: "4px", fontSize: "11px", marginTop: "30px" }}>{role}</div>
          </div>
        ))}
      </div>

      {/* office use */}
      <div style={{ marginTop: "14px", border: "1px solid #000", padding: "8px" }}>
        <div style={sub}>FOR OFFICE USE ONLY</div>
        <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "6px" }}>
          <tbody>
            {row3("Form No.", "Received By", "Date Received")}
            {row3("Verified By", "Approved By", "Date Approved")}
          </tbody>
        </table>
      </div>
    </div>
  );
}
