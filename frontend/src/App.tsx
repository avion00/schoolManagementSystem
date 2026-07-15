import {
  Bell,
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
import { StudentToday } from "@/pages/student/StudentToday";
import { StudentDashboard } from "@/pages/student/StudentDashboard";
import { StudentProfile } from "@/pages/student/StudentProfile";
import { StudentAttendance } from "@/pages/student/StudentAttendance";
import { StudentTimetable } from "@/pages/student/StudentTimetable";
import { StudentSubjects } from "@/pages/student/StudentSubjects";
import { StudentClassmates } from "@/pages/student/StudentClassmates";
import { StudentAssignments } from "@/pages/student/StudentAssignments";
import { StudentAssignmentDetails } from "@/pages/student/StudentAssignmentDetails";
import { StudentMaterials } from "@/pages/student/StudentMaterials";
import { StudentExams } from "@/pages/student/StudentExams";
import { StudentResults } from "@/pages/student/StudentResults";
import { StudentProgress } from "@/pages/student/StudentProgress";
import { StudentMessages } from "@/pages/student/StudentMessages";
import { StudentNotices } from "@/pages/student/StudentNotices";
import { StudentFees } from "@/pages/student/StudentFees";
import { StudentHelp } from "@/pages/student/StudentHelp";
import { StudentAccount } from "@/pages/student/StudentAccount";
import { StudentSettings } from "@/pages/student/StudentSettings";
import { TeacherDashboard } from "@/pages/teacher/TeacherDashboard";
import { TeacherToday } from "@/pages/teacher/TeacherToday";
import { TeacherClasses } from "@/pages/teacher/TeacherClasses";
import { TeacherClassDetails } from "@/pages/teacher/TeacherClassDetails";
import { TeacherStudents } from "@/pages/teacher/TeacherStudents";
import { TeacherStudentDetails } from "@/pages/teacher/TeacherStudentDetails";
import { TeacherTimetable } from "@/pages/teacher/TeacherTimetable";
import { TeacherLessonPlans } from "@/pages/teacher/TeacherLessonPlans";
import { TeacherMaterials } from "@/pages/teacher/TeacherMaterials";
import { TeacherAttendance } from "@/pages/teacher/TeacherAttendance";
import { TeacherAttendanceReports } from "@/pages/teacher/TeacherAttendanceReports";
import { TeacherAssignments } from "@/pages/teacher/TeacherAssignments";
import { TeacherAssignmentDetails } from "@/pages/teacher/TeacherAssignmentDetails";
import { TeacherMarks } from "@/pages/teacher/TeacherMarks";
import { TeacherGradebook } from "@/pages/teacher/TeacherGradebook";
import { TeacherExams } from "@/pages/teacher/TeacherExams";
import { TeacherInsights } from "@/pages/teacher/TeacherInsights";
import { TeacherNotices } from "@/pages/teacher/TeacherNotices";
import { TeacherParentCommunication } from "@/pages/teacher/TeacherParentCommunication";
import { TeacherMessages } from "@/pages/teacher/TeacherMessages";
import { TeacherHelp } from "@/pages/teacher/TeacherHelp";
import { TeacherHelpTicketDetails } from "@/pages/teacher/TeacherHelpTicketDetails";
import { TeacherAccount } from "@/pages/teacher/TeacherAccount";

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
            <div className="grid h-screen place-items-center text-muted-foreground">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          }
        />
      </Routes>
    );
  }

  const isTeacher = !user?.is_student && (user?.roles ?? []).includes("Teacher");

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route element={<ProtectedRoute />}>
        {user?.is_student ? (
          <Route element={<StudentLayout />}>
            <Route path="/student/today"                    element={<StudentToday />} />
            <Route path="/student/dashboard"                element={<StudentDashboard />} />
            <Route path="/student/profile"                  element={<StudentProfile />} />
            <Route path="/student/attendance"                element={<StudentAttendance />} />
            <Route path="/student/timetable"                element={<StudentTimetable />} />
            <Route path="/student/subjects"                  element={<StudentSubjects />} />
            <Route path="/student/classmates"                element={<StudentClassmates />} />
            <Route path="/student/assignments"               element={<StudentAssignments />} />
            <Route path="/student/assignments/:id"           element={<StudentAssignmentDetails />} />
            <Route path="/student/materials"                 element={<StudentMaterials />} />
            <Route path="/student/exams"                     element={<StudentExams />} />
            <Route path="/student/results"                   element={<StudentResults />} />
            <Route path="/student/progress"                  element={<StudentProgress />} />
            <Route path="/student/messages/:conversationId?" element={<StudentMessages />} />
            <Route path="/student/notices"                   element={<StudentNotices />} />
            <Route path="/student/fees"                      element={<StudentFees />} />
            <Route path="/student/help"                       element={<StudentHelp />} />
            <Route path="/student/account"                    element={<StudentAccount />} />
            <Route path="/student/settings"                   element={<StudentSettings />} />

            <Route path="/search" element={<SearchPage />} />
            <Route
              path="/notifications"
              element={
                <ComingSoonPage
                  icon={Bell}
                  title="Notifications"
                  description="Alerts, announcements, and notification settings will be displayed here."
                />
              }
            />

            {/* Old bare routes → new /student/* routes, so existing bookmarks still work */}
            <Route path="/dashboard"    element={<Navigate to="/student/dashboard" replace />} />
            <Route path="/profile"      element={<Navigate to="/student/profile" replace />} />
            <Route path="/attendance"   element={<Navigate to="/student/attendance" replace />} />
            <Route path="/results"      element={<Navigate to="/student/results" replace />} />
            <Route path="/fees"         element={<Navigate to="/student/fees" replace />} />
            <Route path="/billing"      element={<Navigate to="/student/fees" replace />} />
            <Route path="/settings"     element={<Navigate to="/student/settings" replace />} />
            <Route path="/help"         element={<Navigate to="/student/help" replace />} />
            <Route path="/account"      element={<Navigate to="/student/account" replace />} />

            {/* Anything else (admin/teacher-only routes, unknown paths) redirects home */}
            <Route path="*" element={<Navigate to="/student/dashboard" replace />} />
          </Route>
        ) : isTeacher ? (
          <Route element={<TeacherLayout />}>
            <Route path="/teacher/today"              element={<TeacherToday />} />
            <Route path="/teacher/dashboard"          element={<TeacherDashboard />} />

            <Route path="/teacher/classes"            element={<TeacherClasses />} />
            <Route path="/teacher/classes/:id"        element={<TeacherClassDetails />} />
            <Route path="/teacher/students"           element={<TeacherStudents />} />
            <Route path="/teacher/students/:id"       element={<TeacherStudentDetails />} />
            <Route path="/teacher/timetable"          element={<TeacherTimetable />} />
            <Route path="/teacher/lesson-plans"       element={<TeacherLessonPlans />} />
            <Route path="/teacher/materials"          element={<TeacherMaterials />} />

            <Route path="/teacher/attendance"         element={<TeacherAttendance />} />
            <Route path="/teacher/attendance/reports" element={<TeacherAttendanceReports />} />

            <Route path="/teacher/assignments"        element={<TeacherAssignments />} />
            <Route path="/teacher/assignments/:id"    element={<TeacherAssignmentDetails />} />
            <Route path="/teacher/marks"              element={<TeacherMarks />} />
            <Route path="/teacher/gradebook"          element={<TeacherGradebook />} />
            <Route path="/teacher/exams"              element={<TeacherExams />} />
            <Route path="/teacher/insights"           element={<TeacherInsights />} />

            <Route path="/teacher/messages/:conversationId?" element={<TeacherMessages />} />
            <Route path="/teacher/parents"            element={<TeacherParentCommunication />} />
            <Route path="/teacher/notices"            element={<TeacherNotices />} />

            <Route path="/teacher/account"            element={<TeacherAccount />} />
            <Route path="/teacher/help"               element={<TeacherHelp />} />
            <Route path="/teacher/help/:ticketId"     element={<TeacherHelpTicketDetails />} />
            <Route path="/help"              element={<Navigate to="/teacher/help" replace />} />
            <Route path="/notifications"     element={<NotificationsPage />} />
            <Route path="/search"            element={<SearchPage />} />

            {/* ── Redirects from the previous, more fragmented route set ── */}
            <Route path="/teacher/weak-students"        element={<Navigate to="/teacher/insights?tab=needs-attention" replace />} />
            <Route path="/teacher/top-students"         element={<Navigate to="/teacher/insights?tab=top" replace />} />
            <Route path="/teacher/performance"          element={<Navigate to="/teacher/insights" replace />} />
            <Route path="/teacher/homework"             element={<Navigate to="/teacher/assignments" replace />} />
            <Route path="/teacher/homework/:id"         element={<Navigate to="/teacher/assignments" replace />} />
            <Route path="/teacher/assignments/new"      element={<Navigate to="/teacher/assignments" replace />} />
            <Route path="/teacher/marks-entry"          element={<Navigate to="/teacher/marks" replace />} />
            <Route path="/teacher/attendance/daily"     element={<Navigate to="/teacher/attendance" replace />} />
            <Route path="/teacher/attendance/monthly"   element={<Navigate to="/teacher/attendance/reports" replace />} />
            <Route path="/teacher/attendance/low-attendance" element={<Navigate to="/teacher/insights?tab=low-attendance" replace />} />
            <Route path="/teacher/meetings"             element={<Navigate to="/teacher/parents" replace />} />
            <Route path="/teacher/subjects"             element={<Navigate to="/teacher/classes" replace />} />
            <Route path="/teacher/reports/classes"       element={<Navigate to="/teacher/classes" replace />} />
            <Route path="/teacher/reports/students"      element={<Navigate to="/teacher/students" replace />} />
            <Route path="/teacher/reports/progress"      element={<Navigate to="/teacher/insights" replace />} />
            <Route path="/teacher/reports/teaching"      element={<Navigate to="/teacher/dashboard" replace />} />

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
