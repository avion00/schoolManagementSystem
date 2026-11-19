import {
  BookOpen,
  Building2,
  Bus,
  Loader2,
} from "lucide-react";
import { Navigate, Route, Routes } from "react-router-dom";

import { AppLayout } from "@/components/AppLayout";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { StudentLayout } from "@/components/StudentLayout";
import { TeacherLayout } from "@/components/TeacherLayout";
import { ParentLayout } from "@/components/ParentLayout";
import * as SP from "@/portals/StudentPortal";
import * as TP from "@/portals/TeacherPortal";
import * as PP from "@/portals/ParentPortal";
import { PortalMessages } from "@/portals/PortalMessages";
import { useAuth } from "@/lib/auth";
import { BillingPage } from "@/routes/BillingPage";
import { BillingStudentFeesPage } from "@/routes/BillingStudentFeesPage";
import { BillingInvoicesPage } from "@/routes/BillingInvoicesPage";
import { BillingInvoiceDetailsPage } from "@/routes/BillingInvoiceDetailsPage";
import { BillingPaymentsPage } from "@/routes/BillingPaymentsPage";
import { BillingExpensesPage } from "@/routes/BillingExpensesPage";
import { BillingPayrollPage } from "@/routes/BillingPayrollPage";
import { BillingVendorsPage } from "@/routes/BillingVendorsPage";
import { BillingReportsPage } from "@/routes/BillingReportsPage";
import { BillingSettingsPage } from "@/routes/BillingSettingsPage";
import { BillingReceiptDetailsPage } from "@/routes/BillingReceiptDetailsPage";
import { ComingSoonPage } from "@/routes/ComingSoonPage";
import { DashboardPage } from "@/routes/DashboardPage";
import { HelpDeskPage } from "@/routes/HelpDeskPage";
import { HelpTicketCreatePage } from "@/routes/HelpTicketCreatePage";
import { HelpTicketDetailsPage } from "@/routes/HelpTicketDetailsPage";
import { LoginPage } from "@/routes/LoginPage";
import { NotificationsPage } from "@/routes/NotificationsPage";
import { SearchPage } from "@/routes/SearchPage";
import { SettingsPage } from "@/routes/SettingsPage";  // keep existing polished page
import { PrintableAdmissionFormPage } from "@/routes/PrintableAdmissionFormPage";
import { PrintableTeacherFormPage } from "@/routes/PrintableTeacherFormPage";
import { StudentDetailsPage } from "@/routes/StudentDetailsPage";
import { StudentFormPage } from "@/routes/StudentFormPage";
import { StudentsPage } from "@/routes/StudentsPage";
import { ClassDetailsPage }        from "@/routes/ClassDetailsPage";
import { ClassFormPage }            from "@/routes/ClassFormPage";
import { ClassesPage }              from "@/routes/ClassesPage";
import { PrintableClassFormPage }   from "@/routes/PrintableClassFormPage";
import { ParentDetailsPage } from "@/routes/ParentDetailsPage";
import { ParentFormPage } from "@/routes/ParentFormPage";
import { ParentsPage } from "@/routes/ParentsPage";
import { PrintableParentFormPage } from "@/routes/PrintableParentFormPage";
import { SubjectDetailsPage }       from "@/routes/SubjectDetailsPage";
import { SubjectFormPage }          from "@/routes/SubjectFormPage";
import { SubjectsPage }             from "@/routes/SubjectsPage";
import { PrintableSubjectFormPage }   from "@/routes/PrintableSubjectFormPage";
import { ClassRoutinePage }           from "@/routes/ClassRoutinePage";
import { ClassRoutineDetailsPage }    from "@/routes/ClassRoutineDetailsPage";
import { ClassRoutineFormPage }       from "@/routes/ClassRoutineFormPage";
import { PrintableClassRoutinePage }  from "@/routes/PrintableClassRoutinePage";
import { ExamsDashboardPage }         from "@/routes/ExamsDashboardPage";
import { ExamSchedulePage }           from "@/routes/ExamSchedulePage";
import { ExamScheduleDetailsPage }    from "@/routes/ExamScheduleDetailsPage";
import { ExamScheduleFormPage }       from "@/routes/ExamScheduleFormPage";
import { ExamGradesPage }             from "@/routes/ExamGradesPage";
import { ExamGradeFormPage }          from "@/routes/ExamGradeFormPage";
import { MarksEntryPage }             from "@/routes/MarksEntryPage";
import { ExamResultsPage }            from "@/routes/ExamResultsPage";
import { ReportCardsPage }            from "@/routes/ReportCardsPage";
import { AdmitCardsPage }             from "@/routes/AdmitCardsPage";
import { AttendanceDashboardPage } from "@/routes/AttendanceDashboardPage";
import { DailyAttendancePage }     from "@/routes/DailyAttendancePage";
import { MonthlySheetPage }        from "@/routes/MonthlySheetPage";
import { StudentAttendancePage as StaffStudentAttendancePage } from "@/routes/StudentAttendancePage";
import { ClassAttendancePage }     from "@/routes/ClassAttendancePage";
import { TeacherAttendancePage }   from "@/routes/TeacherAttendancePage";
import { AttendanceReportsPage }   from "@/routes/AttendanceReportsPage";
import { MessagesChatsPage }       from "@/routes/MessagesChatsPage";
import { GroupsPage }              from "@/routes/GroupsPage";
import { BroadcastsPage }          from "@/routes/BroadcastsPage";
import { ArchivedMessagesPage }    from "@/routes/ArchivedMessagesPage";
import { MessageRequestsPage }     from "@/routes/MessageRequestsPage";
import { MessageModerationPage }   from "@/routes/MessageModerationPage";
import { MessageExportPage }       from "@/routes/MessageExportPage";
import { MessageSettingsPage }     from "@/routes/MessageSettingsPage";
import { NoticeBoardPage }        from "@/routes/NoticeBoardPage";
import { NoticeDetailsPage }       from "@/routes/NoticeDetailsPage";
import { NoticeFormPage }          from "@/routes/NoticeFormPage";
import { TeacherDetailsPage } from "@/routes/TeacherDetailsPage";
import { TeacherFormPage } from "@/routes/TeacherFormPage";
import { TeachersPage } from "@/routes/TeachersPage";

export default function App() {
  const { user, isLoading } = useAuth();

  // Route selection below (Student / Teacher / Admin) depends on `user.roles`
  // and `user.is_student`. Until that first load resolves, `user` is
  // undefined — matching routes against it would pick the wrong branch (e.g.
  // treat a Teacher as Admin) and the catch-all `*` route would fire a
  // premature client-side redirect that overwrites the originally-requested
  // URL. So on a hard reload, wait for the real user before deciding routes.
  if (isLoading) {
    return (
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="*"
          element={
            <div className="grid h-screen place-items-center overflow-hidden text-muted-foreground">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          }
        />
      </Routes>
    );
  }

  const roles = user?.roles ?? [];
  const isStaff = roles.some((r) => r !== "Parent" && r !== "Student") || !!user?.is_superuser || !!user?.is_platform_admin;
  const isTeacher = !user?.is_student && roles.includes("Teacher");

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route element={<ProtectedRoute />}>
        {user?.is_student ? (
          <Route element={<StudentLayout />}>
            <Route path="/student/dashboard"   element={<SP.StudentDashboardPage />} />
            <Route path="/student/today"       element={<SP.StudentTodayPage />} />
            <Route path="/student/profile"     element={<SP.StudentProfilePage />} />
            <Route path="/student/attendance"  element={<SP.StudentAttendancePage />} />
            <Route path="/student/timetable"   element={<SP.StudentTimetablePage />} />
            <Route path="/student/assignments" element={<SP.StudentAssignmentsPage />} />
            <Route path="/student/materials"   element={<SP.StudentMaterialsPage />} />
            <Route path="/student/results"     element={<SP.StudentResultsPage />} />
            <Route path="/student/fees"        element={<SP.StudentFeesPage />} />
            <Route path="/student/notices"     element={<SP.StudentNoticesPage />} />
            <Route path="/student/messages/:conversationId?" element={<PortalMessages base="/student/messages" tabs={["All", "Unread", "Teachers", "Groups"]} />} />
            <Route path="/student/help"        element={<SP.StudentHelpPage />} />
            <Route path="/student/account"     element={<SP.StudentAccountPage />} />
            <Route path="/notifications"       element={<NotificationsPage />} />
            <Route path="/search"              element={<SearchPage />} />
            <Route path="*" element={<Navigate to="/student/dashboard" replace />} />
          </Route>
        ) : user?.is_guardian && !isStaff ? (
          <Route element={<ParentLayout />}>
            <Route path="/parent"              element={<PP.ParentHomePage />} />
            <Route path="/parent/children/:id" element={<PP.ParentChildPage />} />
            <Route path="/parent/notices"      element={<PP.ParentNoticesPage />} />
            <Route path="/parent/messages/:conversationId?" element={<PortalMessages base="/parent/messages" tabs={["All", "Unread", "Teachers"]} />} />
            <Route path="/parent/help"         element={<PP.ParentHelpPage />} />
            <Route path="/parent/account"      element={<PP.ParentAccountPage />} />
            <Route path="/notifications"       element={<NotificationsPage />} />
            <Route path="*" element={<Navigate to="/parent" replace />} />
          </Route>
        ) : isTeacher ? (
          <Route element={<TeacherLayout />}>
            <Route path="/teacher/dashboard"    element={<TP.TeacherDashboardPage />} />
            <Route path="/teacher/today"        element={<TP.TeacherTodayPage />} />
            <Route path="/teacher/classes"      element={<TP.TeacherClassesPage />} />
            <Route path="/teacher/timetable"    element={<TP.TeacherTimetablePage />} />
            <Route path="/teacher/lesson-plans" element={<TP.TeacherLessonPlansPage />} />
            <Route path="/teacher/materials"    element={<TP.TeacherMaterialsPage />} />
            <Route path="/teacher/assignments"  element={<TP.TeacherAssignmentsPage />} />
            <Route path="/teacher/parents"      element={<TP.TeacherParentsPage />} />
            <Route path="/teacher/notices"      element={<TP.TeacherNoticesPage />} />
            <Route path="/teacher/messages/:conversationId?" element={<PortalMessages base="/teacher/messages" tabs={["All", "Unread", "Parents", "Students", "Groups", "Staff"]} />} />
            <Route path="/teacher/help"         element={<TP.TeacherHelpPage />} />
            <Route path="/teacher/account"      element={<TP.TeacherAccountPage />} />
            {/* Shared staff screens; the server scopes them to the teacher's own sections. */}
            <Route path="/attendance/daily"         element={<DailyAttendancePage />} />
            <Route path="/attendance/monthly"       element={<MonthlySheetPage />} />
            <Route path="/exams/schedule"           element={<ExamSchedulePage />} />
            <Route path="/exams/schedule/:id"       element={<ExamScheduleDetailsPage />} />
            <Route path="/exams/marks-entry"        element={<MarksEntryPage />} />
            <Route path="/notifications"            element={<NotificationsPage />} />
            <Route path="/search"                   element={<SearchPage />} />
            <Route path="*" element={<Navigate to="/teacher/today" replace />} />
          </Route>
        ) : (
          <Route element={<AppLayout />}>
            {/* ── Core pages ────────────────────────────────────────── */}
            <Route path="/dashboard"  element={<DashboardPage />} />
            <Route path="/students"                      element={<StudentsPage />} />
            <Route path="/students/new"               element={<StudentFormPage mode="create" />} />
            <Route path="/students/admission-form/print" element={<PrintableAdmissionFormPage />} />
            <Route path="/students/:id"               element={<StudentDetailsPage />} />
            <Route path="/students/:id/edit"          element={<StudentFormPage mode="edit" />} />
            <Route path="/users"           element={<Navigate to="/settings/users" replace />} />
            <Route path="/access-control"  element={<Navigate to="/settings/access-control" replace />} />
            <Route path="/roles"           element={<Navigate to="/settings/roles-permissions" replace />} />
            <Route path="/permissions"     element={<Navigate to="/settings/roles-permissions" replace />} />

            {/* ── People ────────────────────────────────────────────── */}
            <Route path="/teachers"                          element={<TeachersPage />} />
            <Route path="/teachers/new"                      element={<TeacherFormPage mode="create" />} />
            <Route path="/teachers/teacher-form/print"       element={<PrintableTeacherFormPage />} />
            <Route path="/teachers/:id"                      element={<TeacherDetailsPage />} />
            <Route path="/teachers/:id/edit"                 element={<TeacherFormPage mode="edit" />} />
            <Route path="/parents"                          element={<ParentsPage />} />
            <Route path="/parents/new"                      element={<ParentFormPage mode="create" />} />
            <Route path="/parents/parent-form/print"        element={<PrintableParentFormPage />} />
            <Route path="/parents/:id"                      element={<ParentDetailsPage />} />
            <Route path="/parents/:id/edit"                 element={<ParentFormPage mode="edit" />} />

            {/* ── Academics ─────────────────────────────────────────── */}
            <Route path="/classes"                         element={<ClassesPage />} />
            <Route path="/classes/new"                     element={<ClassFormPage mode="create" />} />
            <Route path="/classes/class-form/print"        element={<PrintableClassFormPage />} />
            <Route path="/classes/:id"                     element={<ClassDetailsPage />} />
            <Route path="/classes/:id/edit"                element={<ClassFormPage mode="edit" />} />
            <Route path="/subjects"                         element={<SubjectsPage />} />
            <Route path="/subjects/new"                    element={<SubjectFormPage mode="create" />} />
            <Route path="/subjects/subject-form/print"     element={<PrintableSubjectFormPage />} />
            <Route path="/subjects/:id"                    element={<SubjectDetailsPage />} />
            <Route path="/subjects/:id/edit"               element={<SubjectFormPage mode="edit" />} />
            <Route path="/class-routine"             element={<ClassRoutinePage />} />
            <Route path="/class-routine/new"         element={<ClassRoutineFormPage mode="create" />} />
            <Route path="/class-routine/print"       element={<PrintableClassRoutinePage />} />
            <Route path="/class-routine/:id/edit"    element={<ClassRoutineFormPage mode="edit" />} />
            <Route path="/class-routine/:id"         element={<ClassRoutineDetailsPage />} />
            <Route path="/exam"                      element={<Navigate to="/exams" replace />} />
            <Route path="/exams"                     element={<ExamsDashboardPage />} />
            <Route path="/exams/schedule"            element={<ExamSchedulePage />} />
            <Route path="/exams/schedule/new"        element={<ExamScheduleFormPage mode="create" />} />
            <Route path="/exams/schedule/:id/edit"   element={<ExamScheduleFormPage mode="edit" />} />
            <Route path="/exams/schedule/:id"        element={<ExamScheduleDetailsPage />} />
            <Route path="/exams/grades"              element={<ExamGradesPage />} />
            <Route path="/exams/grades/new"          element={<ExamGradeFormPage mode="create" />} />
            <Route path="/exams/grades/:id/edit"     element={<ExamGradeFormPage mode="edit" />} />
            <Route path="/exams/marks-entry"         element={<MarksEntryPage />} />
            <Route path="/exams/results"             element={<ExamResultsPage />} />
            <Route path="/exams/report-cards"        element={<ReportCardsPage />} />
            <Route path="/exams/admit-cards"         element={<AdmitCardsPage />} />

            {/* ── Operations ────────────────────────────────────────── */}
            <Route path="/attendance"          element={<AttendanceDashboardPage />} />
            <Route path="/attendance/daily"    element={<DailyAttendancePage />} />
            <Route path="/attendance/monthly"  element={<MonthlySheetPage />} />
            <Route path="/attendance/student"  element={<StaffStudentAttendancePage />} />
            <Route path="/attendance/class"    element={<ClassAttendancePage />} />
            <Route path="/attendance/teacher"  element={<TeacherAttendancePage />} />
            <Route path="/attendance/reports"  element={<AttendanceReportsPage />} />
            <Route path="/fees" element={<Navigate to="/billing/fees" replace />} />
            <Route
              path="/library"
              element={
                <ComingSoonPage
                  icon={BookOpen}
                  title="Library"
                  description="Book catalog, issue and return tracking, overdue management, and library membership."
                />
              }
            />
            <Route
              path="/transport"
              element={
                <ComingSoonPage
                  icon={Bus}
                  title="Transport"
                  description="Route management, vehicle allocation, student transport assignments, and driver records."
                />
              }
            />
            <Route
              path="/hostel"
              element={
                <ComingSoonPage
                  icon={Building2}
                  title="Hostel"
                  description="Room allocation, hostel fees, student residential records, and warden management."
                />
              }
            />

            {/* ── Communication ─────────────────────────────────────── */}
            <Route path="/notice"            element={<Navigate to="/notices" replace />} />
            <Route path="/notices"           element={<NoticeBoardPage />} />
            <Route path="/notices/new"       element={<NoticeFormPage mode="create" />} />
            <Route path="/notices/:id/edit"  element={<NoticeFormPage mode="edit" />} />
            <Route path="/notices/:id"       element={<NoticeDetailsPage />} />
            <Route path="/message"                       element={<Navigate to="/messages" replace />} />
            <Route path="/messages"                     element={<Navigate to="/messages/chats" replace />} />
            <Route path="/messages/chats"               element={<MessagesChatsPage />} />
            <Route path="/messages/chats/:conversationId" element={<MessagesChatsPage />} />
            <Route path="/messages/new"                 element={<MessagesChatsPage autoOpenNewChat />} />
            <Route path="/messages/groups"              element={<GroupsPage />} />
            <Route path="/messages/broadcasts"          element={<BroadcastsPage />} />
            <Route path="/messages/archived"            element={<ArchivedMessagesPage />} />
            <Route path="/messages/requests"            element={<MessageRequestsPage />} />
            <Route path="/messages/moderation"          element={<MessageModerationPage />} />
            <Route path="/messages/export"              element={<MessageExportPage />} />
            <Route path="/messages/settings"            element={<MessageSettingsPage />} />
            <Route path="/messages/inbox"                element={<Navigate to="/messages/chats" replace />} />
            <Route path="/messages/compose"              element={<Navigate to="/messages/new" replace />} />
            <Route path="/messages/sent"                 element={<Navigate to="/messages/chats" replace />} />
            <Route path="/messages/drafts"               element={<Navigate to="/messages/broadcasts" replace />} />
            <Route path="/messages/templates"            element={<Navigate to="/messages/broadcasts" replace />} />

            {/* ── Shared utility pages ──────────────────────────────── */}
            <Route path="/settings"                    element={<SettingsPage />} />
            <Route path="/settings/my-profile"          element={<SettingsPage />} />
            <Route path="/settings/my-security"         element={<SettingsPage />} />
            <Route path="/settings/my-sessions"         element={<SettingsPage />} />
            <Route path="/settings/school-profile"      element={<SettingsPage />} />
            <Route path="/settings/academic-year"       element={<SettingsPage />} />
            <Route path="/settings/users"               element={<SettingsPage />} />
            <Route path="/settings/roles-permissions"   element={<SettingsPage />} />
            <Route path="/settings/access-control"      element={<SettingsPage />} />
            <Route path="/settings/security"            element={<SettingsPage />} />
            <Route path="/settings/audit-logs"          element={<SettingsPage />} />
            <Route path="/settings/attendance"          element={<SettingsPage />} />
            <Route path="/settings/exam-grading"        element={<SettingsPage />} />
            <Route path="/settings/fees"                element={<SettingsPage />} />
            <Route path="/settings/notifications"       element={<SettingsPage />} />
            <Route path="/settings/appearance"          element={<SettingsPage />} />
            <Route path="/settings/backup"              element={<SettingsPage />} />
            <Route path="/help"              element={<HelpDeskPage />} />
            <Route path="/help/tickets/new"  element={<HelpTicketCreatePage />} />
            <Route path="/help/tickets/:id"  element={<HelpTicketDetailsPage />} />
            <Route path="/search"        element={<SearchPage />} />
            <Route path="/account"              element={<Navigate to="/settings/my-profile" replace />} />
            <Route path="/account/profile"      element={<Navigate to="/settings/my-profile" replace />} />
            <Route path="/account/security"     element={<Navigate to="/settings/my-security" replace />} />
            <Route path="/account/sessions"     element={<Navigate to="/settings/my-sessions" replace />} />
            <Route path="/account/preferences"  element={<Navigate to="/settings/appearance" replace />} />
            <Route path="/account/organization" element={<Navigate to="/settings/school-profile" replace />} />
            <Route path="/account/audit-logs"   element={<Navigate to="/settings/audit-logs" replace />} />
            <Route path="/notifications" element={<NotificationsPage />} />

            {/* ── Finance / Billing ─────────────────────────────────── */}
            <Route path="/billing"                  element={<BillingPage />} />
            <Route path="/billing/fees"              element={<BillingStudentFeesPage />} />
            <Route path="/billing/invoices"          element={<BillingInvoicesPage />} />
            <Route path="/billing/invoices/:id"      element={<BillingInvoiceDetailsPage />} />
            <Route path="/billing/payments"          element={<BillingPaymentsPage />} />
            <Route path="/billing/expenses"          element={<BillingExpensesPage />} />
            <Route path="/billing/payroll"           element={<BillingPayrollPage />} />
            <Route path="/billing/vendors"           element={<BillingVendorsPage />} />
            <Route path="/billing/reports"           element={<BillingReportsPage />} />
            <Route path="/billing/settings"          element={<BillingSettingsPage />} />
            <Route path="/billing/receipts/:id"      element={<BillingReceiptDetailsPage />} />
          </Route>
        )}
      </Route>
      <Route path="*" element={<Navigate to={isTeacher ? "/teacher/today" : "/dashboard"} replace />} />
    </Routes>
  );
}
