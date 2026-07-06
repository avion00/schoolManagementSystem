export function PrintableClassForm() {
  const field = (label: string, w = "100%") => (
    <div style={{ marginBottom: "8px" }}>
      <div style={{ fontSize:"10px", color:"#555", marginBottom:"2px" }}>{label}</div>
      <div style={{ borderBottom:"1px solid #333", width: w, minHeight:"20px" }} />
    </div>
  );
  const checkbox = (label: string) => (
    <div style={{ display:"flex", alignItems:"center", gap:"6px", marginBottom:"5px", fontSize:"11px" }}>
      <div style={{ width:"13px", height:"13px", border:"1px solid #333", flexShrink:0 }} />
      <span>{label}</span>
    </div>
  );
  const sectionTitle = (n: string, title: string) => (
    <div style={{ background:"#1e293b", color:"#fff", padding:"6px 12px", fontSize:"11px", fontWeight:"bold", marginBottom:"10px", borderRadius:"4px" }}>
      {n}. {title}
    </div>
  );
  const grid = (children: React.ReactNode, cols = "1fr 1fr") => (
    <div style={{ display:"grid", gridTemplateColumns: cols, gap:"8px 24px", marginBottom:"16px" }}>
      {children}
    </div>
  );

  return (
    <div id="class-form-print" style={{ fontFamily:"Arial, sans-serif", padding:"20mm", maxWidth:"210mm", margin:"0 auto", fontSize:"11px", lineHeight:1.5, color:"#111" }}>
      {/* Header */}
      <div style={{ textAlign:"center", marginBottom:"16px", borderBottom:"2px solid #1e293b", paddingBottom:"12px" }}>
        <div style={{ fontSize:"18px", fontWeight:"bold", color:"#1e293b" }}>ADVANCE SCHOOL</div>
        <div style={{ fontSize:"12px", color:"#444", marginTop:"2px" }}>CLASS REGISTRATION / SETUP FORM</div>
        <div style={{ fontSize:"10px", color:"#888", marginTop:"4px" }}>Academic Year 2025–2026</div>
      </div>

      {/* ID Row */}
      <div style={{ display:"flex", justifyContent:"space-between", marginBottom:"16px" }}>
        <div style={{ fontSize:"10px" }}>Class ID: <span style={{ borderBottom:"1px solid #333", display:"inline-block", width:"120px" }} /></div>
        <div style={{ fontSize:"10px" }}>Academic Year: <span style={{ borderBottom:"1px solid #333", display:"inline-block", width:"100px" }} /></div>
        <div style={{ fontSize:"10px" }}>Date: <span style={{ borderBottom:"1px solid #333", display:"inline-block", width:"100px" }} /></div>
      </div>

      {/* A. Basic Info */}
      {sectionTitle("A","Basic Class Information")}
      {grid(<>
        {field("Class Name")}
        {field("Grade Level")}
        {field("Academic Year")}
        {field("Medium")}
        {field("Shift")}
        {field("Status")}
      </>)}
      <div style={{ marginBottom:"16px" }}>
        <div style={{ fontSize:"10px", color:"#555", marginBottom:"2px" }}>Description</div>
        <div style={{ border:"1px solid #ccc", minHeight:"40px", borderRadius:"3px", padding:"4px" }} />
      </div>

      {/* B. Section Setup */}
      {sectionTitle("B","Section Setup")}
      {[1,2,3].map((n) => (
        <div key={n} style={{ border:"1px solid #ccc", borderRadius:"4px", padding:"8px 10px", marginBottom:"8px" }}>
          <div style={{ fontSize:"10px", fontWeight:"bold", color:"#555", marginBottom:"6px" }}>Section {n}</div>
          {grid(<>
            {field("Section Name")}
            {field("Section Code")}
            {field("Class Teacher")}
            {field("Room No")}
            {field("Capacity")}
            {field("Status")}
          </>,"1fr 1fr 1fr")}
        </div>
      ))}

      {/* C. Teachers */}
      {sectionTitle("C","Class Teacher Assignment")}
      {grid(<>
        {field("Main Class Teacher")}
        {field("Assistant Class Teacher")}
        {field("Coordinator")}
        {field("Contact Teacher")}
      </>)}

      {/* D. Subjects */}
      {sectionTitle("D","Subject Assignment")}
      <table style={{ width:"100%", borderCollapse:"collapse", marginBottom:"16px", fontSize:"10px" }}>
        <thead>
          <tr style={{ background:"#f1f5f9" }}>
            {["Subject","Code","Teacher","Periods/Wk","Full Marks","Pass Marks","Type"].map((h) => (
              <th key={h} style={{ border:"1px solid #ccc", padding:"4px 6px", textAlign:"left" }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({length:7},(_,i)=>(
            <tr key={i}>
              {Array.from({length:7},(_,j)=>(
                <td key={j} style={{ border:"1px solid #ccc", padding:"6px", height:"20px" }} />
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      {/* E. Room */}
      {sectionTitle("E","Room & Facility Information")}
      {grid(<>
        {field("Building")}
        {field("Floor")}
        {field("Room Number")}
        {field("Room Capacity")}
      </>)}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:"4px 16px", marginBottom:"16px" }}>
        {checkbox("Smart Board Available")}
        {checkbox("Projector Available")}
        {checkbox("Lab Required")}
      </div>

      {/* F. Timetable */}
      {sectionTitle("F","Timetable Settings")}
      {grid(<>
        {field("School Days")}
        {field("Start Time")}
        {field("End Time")}
        {field("Period Duration (min)")}
        {field("Break Duration (min)")}
        {field("Total Periods/Day")}
      </>,"1fr 1fr 1fr")}

      {/* G. Fee Structure */}
      {sectionTitle("G","Fee Structure")}
      {grid(<>
        {field("Monthly Tuition Fee")}
        {field("Admission Fee")}
        {field("Exam Fee")}
        {field("Library Fee")}
        {field("Transport Fee (Optional)")}
        {field("Hostel Fee (Optional)")}
        {field("Discount / Scholarship Rule")}
      </>,"1fr 1fr 1fr")}

      {/* H. Exam & Grading */}
      {sectionTitle("H","Exam & Grading Setup")}
      {grid(<>
        {field("Grading System")}
        {field("Pass Percentage")}
        {field("Exam Terms")}
        {field("Result Type")}
      </>)}
      {checkbox("GPA Enabled")}
      <div style={{ marginBottom:"16px" }} />

      {/* I. Documents Checklist */}
      {sectionTitle("I","Documents Checklist")}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"4px 24px", marginBottom:"16px" }}>
        {checkbox("Class Syllabus")}
        {checkbox("Class Routine")}
        {checkbox("Subject Lesson Plan")}
        {checkbox("Exam Routine")}
        {checkbox("Attendance Report Template")}
        {checkbox("Result Sheet Template")}
      </div>

      {/* Notes */}
      {sectionTitle("J","Administrative Notes")}
      <div style={{ marginBottom:"8px" }}>
        <div style={{ fontSize:"10px", color:"#555", marginBottom:"2px" }}>Admin Notes</div>
        <div style={{ border:"1px solid #ccc", minHeight:"50px", borderRadius:"3px", padding:"4px" }} />
      </div>
      <div style={{ marginBottom:"24px" }}>
        <div style={{ fontSize:"10px", color:"#555", marginBottom:"2px" }}>Special Instructions</div>
        <div style={{ border:"1px solid #ccc", minHeight:"36px", borderRadius:"3px", padding:"4px" }} />
      </div>

      {/* Signatures */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:"12px", marginBottom:"24px" }}>
        {["Class Teacher Signature","Verified By (HOD)","Approved By (Principal)"].map((s) => (
          <div key={s} style={{ textAlign:"center" }}>
            <div style={{ borderBottom:"1px solid #333", height:"40px", marginBottom:"4px" }} />
            <div style={{ fontSize:"10px", color:"#555" }}>{s}</div>
          </div>
        ))}
      </div>

      {/* Office Use */}
      <div style={{ border:"1px solid #333", borderRadius:"4px", padding:"8px 12px" }}>
        <div style={{ fontSize:"10px", fontWeight:"bold", marginBottom:"6px" }}>OFFICE USE ONLY</div>
        {grid(<>
          {field("Registered By")}
          {field("Registration Date")}
          {field("System Class ID")}
          {field("Portal Created")}
        </>)}
      </div>
    </div>
  );
}
