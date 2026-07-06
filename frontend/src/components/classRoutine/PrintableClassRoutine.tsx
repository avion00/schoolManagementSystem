import { useMemo } from "react";
import {
  ROUTINES, MORNING_PERIODS, DAY_PERIODS,
  type RoutineEntry, type Day,
} from "@/data/classRoutineData";

const SCHOOL_DAYS: Day[] = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday"];

interface Props {
  className: string;
  section:   string;
  academicYear: string;
}

export function PrintableClassRoutine({ className, section, academicYear }: Props) {
  const filtered = useMemo(
    () => ROUTINES.filter(
      (r) => r.className === className && r.section === section
          && r.academicYear === academicYear && r.status === "active",
    ),
    [className, section, academicYear],
  );

  const shift = filtered[0]?.shift ?? "Morning";
  const periods = shift === "Morning" ? MORNING_PERIODS : DAY_PERIODS;

  // build matrix
  const matrix = new Map<Day, Map<number, RoutineEntry>>();
  for (const e of filtered) {
    if (!matrix.has(e.day)) matrix.set(e.day, new Map());
    matrix.get(e.day)!.set(e.periodNo, e);
  }

  const cell: React.CSSProperties  = { border: "1px solid #ccc", padding: "4px 6px", fontSize: "10px", verticalAlign: "top", minWidth: "90px" };
  const thDay: React.CSSProperties = { ...cell, background: "#1e293b", color: "#fff", textAlign: "center", fontWeight: "700", fontSize: "11px" };
  const thPer: React.CSSProperties = { ...cell, background: "#f1f5f9", fontWeight: "700", width: "100px", textAlign: "center" };
  const brk: React.CSSProperties   = { ...cell, background: "#f8fafc", color: "#94a3b8", textAlign: "center", fontStyle: "italic" };

  return (
    <div id="class-routine-print" style={{ fontFamily: "Arial, sans-serif", padding: "20px", maxWidth: "900px", margin: "0 auto", color: "#000" }}>

      {/* header */}
      <div style={{ textAlign: "center", borderBottom: "2px solid #000", paddingBottom: "10px", marginBottom: "14px" }}>
        <div style={{ fontSize: "18px", fontWeight: "800", letterSpacing: "1px" }}>SCHOOL MANAGEMENT SYSTEM</div>
        <div style={{ fontSize: "13px", fontWeight: "600", marginTop: "2px" }}>WEEKLY CLASS ROUTINE</div>
        <div style={{ fontSize: "11px", color: "#555", marginTop: "4px" }}>
          {className} · Section {section} · {shift} Shift · Academic Year: {academicYear}
        </div>
      </div>

      {/* timetable grid */}
      <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: "14px" }}>
        <thead>
          <tr>
            <th style={{ ...thDay, background: "#334155", width: "100px" }}>Period / Time</th>
            {SCHOOL_DAYS.map((d) => <th key={d} style={thDay}>{d}</th>)}
          </tr>
        </thead>
        <tbody>
          {periods.map((p, idx) => (
            <>
              {p.period === 4 && (
                <tr key="break">
                  <td colSpan={7} style={brk}>── Break / Recess (15 min) ──</td>
                </tr>
              )}
              <tr key={p.period}>
                <td style={thPer}>
                  <div style={{ fontWeight: "700", fontSize: "11px" }}>P{p.period}</div>
                  <div style={{ fontSize: "9px", color: "#64748b" }}>{p.start}</div>
                  <div style={{ fontSize: "9px", color: "#64748b" }}>to {p.end}</div>
                </td>
                {SCHOOL_DAYS.map((day) => {
                  const e = matrix.get(day)?.get(p.period);
                  return (
                    <td key={day} style={{ ...cell, background: e ? "#f8faff" : "#fafafa" }}>
                      {e ? (
                        <>
                          <div style={{ fontWeight: "700", fontSize: "10px" }}>{e.subject}</div>
                          <div style={{ color: "#475569", fontSize: "9px" }}>{e.teacher}</div>
                          <div style={{ color: "#94a3b8", fontSize: "9px" }}>{e.room}</div>
                        </>
                      ) : (
                        <div style={{ color: "#cbd5e1", textAlign: "center", paddingTop: "6px" }}>—</div>
                      )}
                    </td>
                  );
                })}
              </tr>
            </>
          ))}
        </tbody>
      </table>

      {/* footer */}
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: "20px", paddingTop: "10px", borderTop: "1px solid #ccc" }}>
        {["Class Teacher","Academic Head","Principal"].map((role) => (
          <div key={role} style={{ textAlign: "center", flex: 1 }}>
            <div style={{ borderTop: "1px solid #000", marginTop: "30px", paddingTop: "4px", fontSize: "10px" }}>{role}</div>
          </div>
        ))}
      </div>

      <div style={{ marginTop: "10px", fontSize: "9px", color: "#94a3b8", textAlign: "center" }}>
        Generated: {new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })} · School Management System
      </div>
    </div>
  );
}
