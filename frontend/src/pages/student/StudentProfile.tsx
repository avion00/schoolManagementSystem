import {
  BookOpen, Calendar, CalendarCheck, CircleCheckBig, Droplet, FileCheck, FileText, Flag,
  GraduationCap, HeartPulse, Home, Mail, MapPin, Pencil, Phone, ShieldCheck, TrendingUp, User,
  UserRound, Users,
} from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

import { StudentCorrectionRequestModal, type CorrectionRequestPayload } from "@/components/student/ui/StudentCorrectionRequestModal";
import { StudentDashboardMetricCard } from "@/components/student/ui/StudentDashboardMetricCard";
import { StudentDocumentRow, type StudentDocumentItem } from "@/components/student/ui/StudentDocumentRow";
import { StudentGuardianCard } from "@/components/student/ui/StudentGuardianCard";
import { StudentImportantContactsCard } from "@/components/student/ui/StudentImportantContactsCard";
import { StudentInfoCard } from "@/components/student/ui/StudentInfoCard";
import { StudentPageHeader } from "@/components/student/ui/StudentPageHeader";
import { StudentPageShell } from "@/components/student/ui/StudentPageShell";
import { ProfileInfoGrid, ProfileInfoItem } from "@/components/student/ui/StudentProfileInfoGrid";
import { StudentProfileActivityTimeline, type StudentProfileActivityItem } from "@/components/student/ui/StudentProfileActivityTimeline";
import { StudentProfileCompletionCard } from "@/components/student/ui/StudentProfileCompletionCard";
import { StudentProfileIdentityCard } from "@/components/student/ui/StudentProfileIdentityCard";
import { StudentSectionHeader } from "@/components/student/ui/StudentSectionHeader";
import { StudentTwoColumnLayout } from "@/components/student/ui/StudentTwoColumnLayout";
import {
  attendanceTrend, computeAttendanceSummary, createStudentHelpTicket, results, studentProfile, subjects, teachers,
} from "@/data/studentDashboardData";

function calcAge(dob: string) {
  const d = new Date(dob);
  const now = new Date();
  let age = now.getFullYear() - d.getFullYear();
  const m = now.getMonth() - d.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < d.getDate())) age--;
  return age;
}

const DOCUMENTS: StudentDocumentItem[] = [
  { id: "doc-1", name: "Birth Certificate", status: "Verified", updatedOn: "2019-04-01" },
  { id: "doc-2", name: "Admission Form", status: "Verified", updatedOn: "2019-04-01" },
  { id: "doc-3", name: "Previous School Certificate", status: "Uploaded", updatedOn: "2019-04-05" },
  { id: "doc-4", name: "Guardian ID Proof", status: "Verified", updatedOn: "2026-01-15" },
  { id: "doc-5", name: "Student Photo", status: "Verified", updatedOn: "2026-01-15" },
  { id: "doc-6", name: "Medical Record", status: "Missing", updatedOn: "—" },
];

const ACTIVITY: StudentProfileActivityItem[] = [
  { id: "act-1", icon: FileText, title: "Profile viewed", actor: "You", date: "Today, 10:15 AM", statusLabel: "Viewed", statusTone: "info" },
  { id: "act-2", icon: Pencil, title: "Correction requested — Blood group", actor: "You", date: "2026-07-10", statusLabel: "Under review", statusTone: "warning" },
  { id: "act-3", icon: Phone, title: "Guardian contact updated", actor: "Admin Office", date: "2026-06-15", statusLabel: "Completed", statusTone: "success" },
  { id: "act-4", icon: FileCheck, title: "Document verified — Student Photo", actor: "Admin Office", date: "2026-05-20", statusLabel: "Verified", statusTone: "success" },
  { id: "act-5", icon: MapPin, title: "Address update requested", actor: "You", date: "2026-05-02", statusLabel: "Pending", statusTone: "warning" },
];

export function StudentProfile() {
  const navigate = useNavigate();
  const [correctionOpen, setCorrectionOpen] = useState(false);

  const classTeacher = teachers.find((t) => t.isClassTeacher);
  const age = calcAge(studentProfile.dob);
  const attendance = computeAttendanceSummary();
  const latestResult = results[results.length - 1];
  const verifiedDocs = DOCUMENTS.filter((d) => d.status === "Verified").length;

  function handleCorrectionSubmit(payload: CorrectionRequestPayload) {
    createStudentHelpTicket({
      category: "Other",
      title: `Profile correction — ${payload.section} · ${payload.field}`,
      description: `Current: ${payload.currentValue || "—"} → Correct: ${payload.correctValue || "—"}. Reason: ${payload.reason}`,
      sentTo: "Admin Office",
    });
    toast.success("Correction request submitted for admin review.");
  }

  function handleDocumentAction(doc: StudentDocumentItem) {
    if (doc.status === "Missing") {
      toast.info(`Upload request sent for ${doc.name}.`);
    } else {
      toast.info(`Opening ${doc.name}…`);
    }
  }

  return (
    <StudentPageShell>
      <StudentPageHeader
        title="My Profile"
        description="Your identity, contact, guardian, and academic record in one place."
      />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <StudentDashboardMetricCard
          label="Attendance" value={`${attendance.presentPct}%`} supporting={`${attendance.presentDays} of ${attendance.totalDays} days`}
          icon={CalendarCheck} tone="emerald" trendData={attendanceTrend.map((t) => ({ value: t.pct }))}
          onClick={() => navigate("/student/attendance")}
        />
        <StudentDashboardMetricCard
          label="Academic Progress" value={`${latestResult.percentage}%`} supporting={`GPA ${latestResult.gpa} · ${latestResult.term}`}
          icon={TrendingUp} tone="violet" percent={latestResult.percentage}
          onClick={() => navigate("/student/results")}
        />
        <StudentDashboardMetricCard
          label="Documents" value={`${verifiedDocs}/${DOCUMENTS.length}`} supporting="Verified on file"
          icon={FileCheck} tone="blue" percent={Math.round((verifiedDocs / DOCUMENTS.length) * 100)}
        />
      </div>

      <StudentTwoColumnLayout
        main={
          <div className="space-y-4">
            <div className="rounded-2xl border border-border/60 bg-card p-4 shadow-elevated sm:p-5">
              <StudentSectionHeader icon={User} title="Personal Information" />
              <ProfileInfoGrid>
                <ProfileInfoItem label="Full name" value={studentProfile.name} icon={User} />
                <ProfileInfoItem label="Date of birth" value={studentProfile.dob} icon={Calendar} />
                <ProfileInfoItem label="Age" value={`${age} years`} icon={Calendar} />
                <ProfileInfoItem label="Blood group" value={studentProfile.bloodGroup} icon={Droplet} />
                <ProfileInfoItem label="Student type" value={studentProfile.studentType} icon={BookOpen} />
                <ProfileInfoItem label="Medical note" value="None on file" icon={HeartPulse} />
                <ProfileInfoItem label="Email" value={studentProfile.email} icon={Mail} />
                <ProfileInfoItem label="Phone" value={studentProfile.phone} icon={Phone} />
                <ProfileInfoItem label="Address" value={studentProfile.address} icon={Home} />
                <ProfileInfoItem label="House" value={studentProfile.house} icon={Flag} />
                <ProfileInfoItem label="Emergency contact" value={studentProfile.emergencyContact} icon={ShieldCheck} />
                <ProfileInfoItem label="Join date" value={studentProfile.joinDate} icon={Calendar} />
              </ProfileInfoGrid>
            </div>

            <div>
              <StudentSectionHeader icon={Users} title="Guardian & Emergency Contacts" />
              <div className="grid gap-4 sm:grid-cols-2">
                <StudentGuardianCard
                  icon={UserRound}
                  roleLabel="Primary Guardian"
                  name={studentProfile.guardian}
                  phone={studentProfile.guardianPhone}
                  email={studentProfile.guardianEmail}
                  onMessage={() => navigate("/student/messages")}
                />
                <StudentGuardianCard
                  icon={ShieldCheck}
                  roleLabel="Emergency Contact"
                  name={studentProfile.emergencyContact.replace(/\s*\(.*\)$/, "")}
                  meta={studentProfile.emergencyContact.match(/\((.*)\)/)?.[1]}
                  phone={studentProfile.emergencyContact.replace(/\s*\(.*\)$/, "")}
                />
              </div>
            </div>

            <div className="rounded-2xl border border-border/60 bg-card p-4 shadow-elevated sm:p-5">
              <StudentSectionHeader icon={GraduationCap} title="Academic Information" />
              <ProfileInfoGrid>
                <ProfileInfoItem label="Current class" value={studentProfile.className} />
                <ProfileInfoItem label="Section" value={studentProfile.section} />
                <ProfileInfoItem label="Roll number" value={studentProfile.roll} />
                <ProfileInfoItem label="Admission number" value={studentProfile.admissionNo} />
                <ProfileInfoItem label="Registration number" value={studentProfile.registrationNo} />
                <ProfileInfoItem label="Academic year" value={studentProfile.academicYear} icon={Calendar} />
                <ProfileInfoItem label="Class teacher" value={classTeacher?.name ?? "—"} icon={GraduationCap} />
                <ProfileInfoItem label="Joined date" value={studentProfile.joinDate} icon={Calendar} />
                <ProfileInfoItem label="Student type" value={studentProfile.studentType} />
                <ProfileInfoItem label="House / Group" value={studentProfile.house} icon={Flag} />
              </ProfileInfoGrid>

              <div className="mt-4 border-t border-border/60 pt-4">
                <StudentSectionHeader
                  icon={BookOpen}
                  title="Assigned Subjects"
                  action={
                    <button type="button" onClick={() => navigate("/student/subjects")} className="text-[12px] font-medium text-primary hover:underline">
                      View Subjects
                    </button>
                  }
                />
                <div className="space-y-1.5">
                  {subjects.slice(0, 5).map((s) => (
                    <div key={s.id} className="flex items-center justify-between rounded-xl px-2 py-1.5 text-[12.5px]">
                      <span className="font-medium text-foreground">{s.name}</span>
                      <span className="text-muted-foreground">{s.teacher}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-border/60 bg-card p-4 shadow-elevated sm:p-5">
              <StudentSectionHeader icon={FileCheck} title="Document Center" />
              <div className="space-y-2">
                {DOCUMENTS.map((doc) => (
                  <StudentDocumentRow key={doc.id} document={doc} onAction={handleDocumentAction} />
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-border/60 bg-card p-4 shadow-elevated sm:p-5">
              <StudentSectionHeader icon={CircleCheckBig} title="Profile Activity" />
              <StudentProfileActivityTimeline items={ACTIVITY} />
            </div>
          </div>
        }
        sidebar={
          <>
            <StudentProfileIdentityCard
              name={studentProfile.name}
              className={studentProfile.className}
              section={studentProfile.section}
              roll={studentProfile.roll}
              admissionNo={studentProfile.admissionNo}
              photoUrl="https://i.pravatar.cc/300?img=13"
              onRequestCorrection={() => setCorrectionOpen(true)}
              onPrint={() => window.print()}
            />

            <StudentProfileCompletionCard
              percent={96}
              missingFields={["Medical note / allergy"]}
              onRequestUpdate={() => setCorrectionOpen(true)}
            />

            <StudentImportantContactsCard
              contacts={[
                { label: "Class Teacher", name: classTeacher?.name ?? "—", icon: GraduationCap, onAction: () => navigate("/student/teachers") },
                { label: "Guardian", name: studentProfile.guardian, icon: UserRound, onAction: () => navigate("/student/messages") },
                { label: "Emergency Contact", name: studentProfile.emergencyContact, icon: ShieldCheck },
              ]}
            />

            <StudentInfoCard
              title="Account Access"
              icon={ShieldCheck}
              rows={[
                { label: "Email verified", value: "Yes" },
                { label: "Phone verified", value: "Yes" },
                { label: "Last login", value: "Today, 8:02 AM" },
                { label: "Account status", value: "Managed by school" },
              ]}
            />
          </>
        }
      />

      <StudentCorrectionRequestModal open={correctionOpen} onOpenChange={setCorrectionOpen} onSubmit={handleCorrectionSubmit} />
    </StudentPageShell>
  );
}
