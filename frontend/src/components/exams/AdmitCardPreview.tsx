import { Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ExamSchedule } from "@/data/examsData";

interface StudentInfo {
  name:          string;
  registrationNo: string;
  admissionNo:   string;
  className:     string;
  section:       string;
  roll:          number;
  dob:           string;
}

interface Props {
  student:   StudentInfo;
  schedules: ExamSchedule[];
  term:      string;
  year:      string;
}

const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
function getDayName(d: string) { return DAY_NAMES[new Date(d).getDay()]; }

const INSTRUCTIONS = [
  "Candidates must bring this Admit Card to the examination hall.",
  "Report to the examination hall at least 15 minutes before the start time.",
  "Mobile phones and electronic devices are strictly prohibited.",
  "Use of correction fluid is not allowed. Use only blue/black pen.",
  "No books, notes, or cheat sheets are allowed.",
  "Candidates found cheating will be disqualified immediately.",
  "Roll number must be written on every answer sheet.",
  "The examination hall must be vacated 10 minutes before the end time.",
];

export function AdmitCardPreview({ student, schedules, term, year }: Props) {
  const initials = student.name.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase();

  return (
    <div className="space-y-3">
      <div className="flex justify-end print:hidden">
        <Button size="sm" variant="outline" className="h-8 gap-1.5 text-[12px]" onClick={() => window.print()}>
          <Printer className="h-3.5 w-3.5" /> Print Admit Card
        </Button>
      </div>

      <div
        id="admit-card-print"
        className="mx-auto max-w-2xl rounded-2xl border-2 border-indigo-200 bg-white dark:bg-background shadow-lg overflow-hidden text-[12px]"
        style={{ fontFamily: "serif" }}
      >
        {/* Header */}
        <div className="flex items-center gap-4 bg-indigo-700 text-white px-8 py-5">
          <div className="h-14 w-14 rounded-full bg-white/20 flex items-center justify-center text-xl font-bold shrink-0">
            S
          </div>
          <div>
            <h1 className="text-lg font-bold">SchoolOS Academy</h1>
            <p className="text-[11px] opacity-80">Kathmandu, Nepal</p>
          </div>
          <div className="ml-auto text-right">
            <p className="text-[10px] uppercase tracking-widest opacity-70">Examination</p>
            <p className="text-base font-bold">ADMIT CARD</p>
            <p className="text-[11px] opacity-80">{term} · {year}</p>
          </div>
        </div>

        {/* Divider band */}
        <div className="h-1 bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400" />

        {/* Student info + photo */}
        <div className="flex gap-6 px-8 py-5 border-b border-border/40">
          <div className="flex-1 grid grid-cols-2 gap-x-8 gap-y-1.5">
            <InfoRow label="Student Name"  value={student.name}          />
            <InfoRow label="Class"         value={`${student.className} – ${student.section}`} />
            <InfoRow label="Reg. No."      value={student.registrationNo} />
            <InfoRow label="Roll No."      value={String(student.roll)}   />
            <InfoRow label="Adm. No."      value={student.admissionNo}    />
            <InfoRow label="Date of Birth" value={student.dob}            />
          </div>
          {/* Photo placeholder */}
          <div className="shrink-0 h-24 w-20 rounded border-2 border-dashed border-border/60 bg-muted/30 flex flex-col items-center justify-center text-center">
            <div className="text-2xl font-bold text-muted-foreground">{initials}</div>
            <p className="text-[9px] text-muted-foreground mt-1">Photo</p>
          </div>
        </div>

        {/* Exam schedule table */}
        <div className="px-8 py-5 border-b border-border/40">
          <h3 className="text-[11px] font-bold uppercase tracking-wide text-foreground mb-3">Examination Schedule</h3>
          {schedules.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">No exams scheduled.</p>
          ) : (
            <table className="w-full border-collapse text-[11px]">
              <thead>
                <tr className="border-b-2 border-foreground/20 bg-muted/30">
                  <th className="pb-2 px-2 text-left font-semibold text-foreground">Subject</th>
                  <th className="pb-2 px-2 text-center font-semibold text-foreground">Date</th>
                  <th className="pb-2 px-2 text-center font-semibold text-foreground">Day</th>
                  <th className="pb-2 px-2 text-center font-semibold text-foreground">Report Time</th>
                  <th className="pb-2 px-2 text-center font-semibold text-foreground">Start</th>
                  <th className="pb-2 px-2 text-center font-semibold text-foreground">End</th>
                  <th className="pb-2 px-2 text-center font-semibold text-foreground">Room</th>
                  <th className="pb-2 px-2 text-center font-semibold text-foreground">Seat</th>
                </tr>
              </thead>
              <tbody>
                {schedules.map((s, i) => (
                  <tr key={s.id} className="border-b border-border/20 hover:bg-muted/10">
                    <td className="py-1.5 px-2 text-foreground">{s.subject}</td>
                    <td className="py-1.5 px-2 text-center">{s.date}</td>
                    <td className="py-1.5 px-2 text-center text-muted-foreground">{getDayName(s.date)}</td>
                    <td className="py-1.5 px-2 text-center">{s.reportingTime}</td>
                    <td className="py-1.5 px-2 text-center font-medium">{s.startTime}</td>
                    <td className="py-1.5 px-2 text-center">{s.endTime}</td>
                    <td className="py-1.5 px-2 text-center font-medium">{s.room}</td>
                    <td className="py-1.5 px-2 text-center font-bold">{student.roll * 10 + i + 1}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Instructions */}
        <div className="px-8 py-4 border-b border-border/40 bg-amber-50/40 dark:bg-amber-950/10">
          <h3 className="text-[10px] font-bold uppercase tracking-wide text-amber-700 dark:text-amber-400 mb-2">General Instructions</h3>
          <ol className="space-y-1">
            {INSTRUCTIONS.map((ins, i) => (
              <li key={i} className="text-[10px] text-foreground leading-snug">
                <span className="font-semibold mr-1">{i + 1}.</span>{ins}
              </li>
            ))}
          </ol>
        </div>

        {/* Signatures */}
        <div className="px-8 py-5">
          <div className="grid grid-cols-3 gap-6">
            {["Candidate's Signature", "Class Teacher", "Principal"].map((title) => (
              <div key={title} className="text-center">
                <div className="h-10 border-b border-foreground/30" />
                <p className="text-[10px] mt-1 text-muted-foreground">{title}</p>
              </div>
            ))}
          </div>
          <p className="text-[9px] text-muted-foreground text-center mt-4">
            This admit card is valid only for {term} · {year} examination. Issued by SchoolOS Academy.
          </p>
        </div>
      </div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-2">
      <span className="text-muted-foreground w-28 shrink-0 text-[11px]">{label}:</span>
      <span className="font-semibold text-foreground">{value}</span>
    </div>
  );
}
