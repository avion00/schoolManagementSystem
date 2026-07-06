# Production-Level School Management System Blueprint

A complete real-world **School Management System** should work like a combination of:

- **SIS**: Student Information System
- **ERP**: Finance, HR, payroll, inventory, transport, hostel, accounting
- **LMS**: Homework, assignments, notes, learning materials
- **Admin Portal**: Roles, permissions, analytics, settings, reports

The system must be built around:

- Security
- Permissions
- Audit logs
- Data isolation
- Backups
- Approval workflows
- Privacy
- Scalability
- Real-world school operations

---

## 1. Recommended Tech Stack

Since this type of system is CRUD-heavy, permission-heavy, and security-sensitive, the best practical stack is:

### Backend

```txt
Django REST Framework
PostgreSQL
Redis
Celery
Django Channels / WebSocket optional
JWT with HttpOnly cookies
Docker
Nginx
Gunicorn
S3-compatible object storage
```

### Frontend

```txt
React (TSX) — SPA, no Next.js
Vite (lightning-fast dev server + build)
TypeScript
React Router (client-side routing)
Tailwind CSS
shadcn/ui (Radix UI based component framework)
TanStack Query
Zustand / Redux Toolkit
React Hook Form
Zod validation
Recharts / ECharts
```

### Database

```txt
PostgreSQL
Redis for cache, sessions, queues
S3 / Wasabi / Cloudflare R2 for file storage
```

### Deployment

```txt
Ubuntu VPS / AWS / DigitalOcean
Docker Compose for first version
Kubernetes later only if huge scale
Nginx reverse proxy
SSL with Certbot / Cloudflare
GitHub Actions CI/CD
Sentry for error tracking
Prometheus / Grafana optional
```

---

## 2. Recommended Architecture

Use a **modular monolith** first.

Do not start with microservices unless you already have a big development team. A school system is large, but microservices will make the first version unnecessarily complex.

```txt
Frontend: React + Vite (SPA)
        |
        | HTTPS
        v
Backend API: Django REST Framework
        |
        | ORM
        v
PostgreSQL Database
        |
        | Background jobs
        v
Redis + Celery
        |
        | Files
        v
Object Storage
```

### Backend App Structure

```txt
apps/
  accounts/
  schools/
  students/
  guardians/
  teachers/
  academics/
  attendance/
  timetable/
  exams/
  assignments/
  fees/
  payroll/
  accounting/
  library/
  transport/
  hostel/
  inventory/
  communication/
  reports/
  audit/
  settings/
```

---

## 3. Main Roles

The system should support the following roles:

1. Super Admin
2. Admin / Principal
3. Teacher
4. Student
5. Accountant
6. Parent / Guardian
7. Class Teacher
8. Subject Teacher
9. Receptionist / Admission Officer
10. Exam Controller

---

# 4. Role Details

## 4.1 Super Admin

The Super Admin controls the entire platform.

### Super Admin can manage:

```txt
Schools
Branches
Subscriptions
All users
All roles
All permissions
Global system settings
Payment plans
Feature access
Database-level audit view
Security logs
System backups
Maintenance mode
Platform announcements
```

### Important rule

Super Admin should not casually edit sensitive records like student marks or fee payments without audit logs. Every sensitive action must be tracked.

---

## 4.2 Admin / Principal

This is the main controller inside a school.

### Principal can manage:

```txt
Students
Teachers
Staff
Classes
Sections
Subjects
Academic years
Admissions
Fees
Accounts
Exams
Timetable
Attendance
Reports
Discipline
School notices
School settings
Role assignment inside school
```

### Principal dashboard should show:

```txt
Total students
Total teachers
Today attendance
Fee collection
Pending dues
Exam performance
Teacher workload
Class-wise performance
Student dropout risk
Admission status
Staff payroll overview
```

---

## 4.3 Teacher

### Teacher can:

```txt
View assigned classes
View assigned subjects
Take attendance
Create homework
Upload notes
Create assignments
Check submissions
Enter marks
View student performance
Send remarks to parents
View timetable
Manage class activities
Generate progress notes
```

### Teacher should not:

```txt
Edit school settings
Delete students
Change fee records
Change other teacher marks
See all financial data
Create admin users
```

---

## 4.4 Student

### Student can:

```txt
View own profile
View class timetable
View attendance
View marks/results
View assignments
Submit homework
Download notes
View notices
View fee status, optional
View library books
View transport/hostel info
Chat/message teacher if enabled
```

### Student should not:

```txt
Edit official academic records
View other students' private data
Change marks
Change attendance
Access finance/admin pages
```

---

## 4.5 Parent / Guardian

Parent/guardian access is very important in a real school system.

### Parent can:

```txt
View child profile
View attendance
View exam results
View fee invoices
Pay fees online
View notices
Communicate with teachers
View homework
View discipline remarks
Download receipts
Track transport if enabled
```

---

## 4.6 Accountant

### Accountant can:

```txt
Create fee structure
Generate invoices
Record payments
Manage discounts/scholarships
Manage fines
Generate receipts
View dues
Export financial reports
Manage expenses
Manage salary/payroll if allowed
Reconcile payments
```

### Accountant should not:

```txt
Change marks
Delete students fully
Modify academic year settings
Create admin users
```

---

## 4.7 Exam Controller

### Exam Controller can:

```txt
Create exams
Define grading system
Assign exam schedule
Lock/unlock marks entry
Publish results
Generate mark sheets
Generate report cards
Analyze result statistics
```

---

# 5. Permission System

Do not hardcode roles only.

Use:

```txt
RBAC + custom permissions + object-level permissions
```

RBAC means **Role-Based Access Control**.

## 5.1 Permission Format

Use this style:

```txt
module.action.scope
```

### Examples

```txt
student.view.own
student.view.class
student.view.all
student.create
student.update
student.delete
student.export

fee.view
fee.create
fee.update
fee.delete
fee.collect
fee.refund
fee.discount.approve

exam.create
exam.marks.enter
exam.marks.lock
exam.result.publish

attendance.take
attendance.update
attendance.report
```

---

## 5.2 Permission Tables

```txt
users
roles
permissions
role_permissions
user_roles
user_permissions_override
```

This allows:

```txt
Admin role has many permissions
Teacher role has limited permissions
One teacher can get special permission
One permission can be removed from one person
```

---

## 5.3 Scope-Based Permission

Examples:

```txt
Teacher A can view Class 8-A only
Teacher B can enter Science marks only
Accountant can access finance only for main branch
Principal can view everything in one school
Super Admin can view all schools
```

Almost every table should include:

```txt
school_id
branch_id optional
created_by
updated_by
created_at
updated_at
is_active
```

---

# 6. Multi-School or Single-School?

Build as **multi-tenant** from day one.

Even if you start with one school, later you can sell the software to many schools.

## 6.1 Multi-Tenant Structure

```txt
Platform
  └── School
        └── Branch
              └── Academic Year
                    └── Classes
                    └── Students
                    └── Teachers
```

Every important record should have:

```txt
school_id
branch_id
academic_year_id
```

This prevents one school from seeing another school's data.

---

# 7. Core Modules

## 7.1 School Setup Module

### Features

```txt
School profile
Logo
Address
Contact number
Email
Website
PAN/VAT number
Registration number
Branches
Academic years
Working days
Holidays
Grading system
Fee rules
Attendance rules
ID card template
Certificate template
SMS/email settings
```

---

## 7.2 User & Authentication Module

### Features

```txt
Login
Logout
Refresh token
Forgot password
Password reset
MFA / OTP
Device/session management
Role management
Permission management
Account lock
Login history
Profile update
Change password
Force password reset
```

### Security Rules

```txt
Password hashing: Argon2 or bcrypt
MFA for high-privilege users
HttpOnly secure cookies
CSRF protection
Rate limiting
Account lock after repeated failed attempts
Session expiry
Refresh token rotation
IP/device logging
```

---

## 7.3 Student Management Module

### Features

```txt
Student admission
Student profile
Student photo
Student documents
Roll number
Registration number
Class/section assignment
Previous school details
Guardian details
Medical info
Transport info
Hostel info
Scholarship info
Status: active, graduated, transferred, suspended, left
Bulk import from Excel/CSV
Student ID card generation
Student history timeline
```

### Important Student Fields

```txt
first_name
middle_name
last_name
date_of_birth
gender
blood_group
nationality
religion optional
address
phone optional
email optional
admission_number
roll_number
class_id
section_id
guardian_id
photo
documents
status
```

---

## 7.4 Guardian / Parent Module

### Features

```txt
Parent profile
Multiple children support
Father/mother/guardian details
Emergency contact
Parent login
Fee view
Attendance view
Result view
Teacher communication
Consent management
```

### Fields

```txt
name
relation
phone
email
occupation
address
emergency_contact
linked_students
```

---

## 7.5 Teacher & Staff Module

### Features

```txt
Teacher profile
Staff profile
Department
Designation
Qualification
Experience
Joining date
Salary info
Assigned subjects
Assigned classes
Attendance
Leave
Documents
Performance records
Resignation/termination history
```

### Teacher Assignment

```txt
teacher_id
class_id
section_id
subject_id
academic_year_id
is_class_teacher
```

---

## 7.6 Academic Module

### Features

```txt
Academic year
Class
Section
Subject
Subject group
Syllabus
Lesson plan
Class teacher
Subject teacher
Promotion rules
Curriculum mapping
```

### Models

```txt
AcademicYear
ClassLevel
Section
Subject
ClassSubject
TeacherSubjectAssignment
Syllabus
LessonPlan
```

---

## 7.7 Timetable Module

### Features

```txt
Class timetable
Teacher timetable
Room timetable
Period setup
Break time
Substitution
Conflict detection
PDF export
Student view
Teacher view
```

### Conflict Rules

```txt
One teacher cannot have two classes at same time
One room cannot be used by two classes at same time
Subject weekly load should match requirement
Lunch/break periods should be protected
```

---

## 7.8 Attendance Module

### Features

```txt
Daily attendance
Period-wise attendance
Teacher attendance
Staff attendance
Late arrival
Half day
Leave
Absent reason
Parent notification
Attendance reports
Monthly attendance percentage
Biometric integration optional
QR attendance optional
```

### Attendance Status

```txt
Present
Absent
Late
Half Day
Leave
Holiday
Excused
```

### Important Rule

```txt
Only assigned teacher or authorized admin can take attendance.
Attendance update after lock date should require admin approval.
```

---

## 7.9 Exam & Result Module

### Features

```txt
Exam setup
Exam schedule
Subject-wise marks
Practical marks
Theory marks
Internal assessment
Grade setup
GPA/percentage
Rank generation
Report card
Result publish/unpublish
Marks lock
Rechecking request
Transcript
```

### Exam Workflow

```txt
Create exam
Assign classes
Assign subjects
Set full marks/pass marks
Create schedule
Teachers enter marks
Exam controller verifies
Principal approves
Publish result
Students/parents view result
```

---

## 7.10 Assignment / Homework / LMS Module

### Features

```txt
Homework creation
Assignment upload
Study material upload
Due date
Submission
Teacher feedback
Marks/rubric
Late submission tracking
Student dashboard
Parent notification
```

### File Upload Rules

```txt
Limit file size
Scan file type
Store in object storage
Private signed URLs
No public student files
```

---

## 7.11 Fee & Accounting Module

This is one of the most important modules.

### Features

```txt
Fee category
Fee structure
Monthly fees
Admission fees
Exam fees
Transport fees
Hostel fees
Library fines
Discounts
Scholarships
Invoices
Receipts
Online payment
Cash/bank payment
Partial payment
Due tracking
Fine/late fee
Refunds
Financial reports
Ledger
Expenses
Income
Bank reconciliation
```

### Fee Models

```txt
FeeCategory
FeeStructure
StudentFeeAssignment
Invoice
InvoiceItem
Payment
PaymentMethod
Discount
Scholarship
Fine
Refund
Expense
LedgerEntry
```

### Payment Statuses

```txt
Unpaid
Partially Paid
Paid
Overdue
Cancelled
Refunded
```

### Important Accounting Rule

```txt
Do not physically delete financial records.
Use reversal entries or cancellation with reason.
```

Every payment should have:

```txt
receipt_number
payment_date
amount
method
collected_by
transaction_id
remarks
```

---

## 7.12 Payroll / HR Module

### Features

```txt
Salary structure
Allowances
Deductions
Tax
Advance salary
Loan
Payslip
Staff attendance integration
Leave deduction
Monthly payroll
Payroll approval
Bank export
```

### Workflow

```txt
HR prepares payroll
Accountant verifies
Principal approves
Salary marked as paid
Payslip generated
```

---

## 7.13 Library Module

### Features

```txt
Book catalog
ISBN
Author
Publisher
Category
Rack number
Copies
Issue book
Return book
Renew book
Fine
Lost/damaged book
Library card
Reports
```

---

## 7.14 Transport Module

### Features

```txt
Vehicles
Drivers
Routes
Stops
Student route assignment
Transport attendance
Vehicle documents
Insurance
Maintenance
Fuel logs
Transport fee
```

---

## 7.15 Hostel Module

### Features

```txt
Hostel buildings
Rooms
Beds
Room allocation
Hostel attendance
Visitor log
Hostel fee
Complaints
Mess records
```

---

## 7.16 Inventory / Asset Module

### Features

```txt
Items
Categories
Suppliers
Purchase orders
Stock in
Stock out
Asset assignment
Damaged/lost item
Lab equipment
Furniture
Maintenance
Reports
```

---

## 7.17 Communication Module

### Features

```txt
Notice board
SMS
Email
Push notifications
Parent messages
Teacher-student messages
Announcements
Emergency alerts
Birthday wishes
Fee reminders
Attendance alerts
Exam result alerts
```

### Notification Channels

```txt
In-app
Email
SMS
WhatsApp optional
Push notification
```

---

## 7.18 Reports & Analytics Module

### Dashboards

```txt
Principal dashboard
Teacher dashboard
Student dashboard
Parent dashboard
Accountant dashboard
Super admin dashboard
```

### Reports

```txt
Student list
Admission report
Attendance report
Fee collection report
Due report
Exam report
Teacher workload
Payroll report
Expense report
Transport report
Library report
Hostel report
Inventory report
```

### Export Formats

```txt
PDF
Excel
CSV
Print view
```

---

## 7.19 Audit Log Module

Audit logging is required for a production-level system.

### Track

```txt
Who logged in
Who created student
Who edited marks
Who deleted record
Who changed fee
Who exported data
Who viewed sensitive data
Old value
New value
IP address
Device/browser
Timestamp
Reason
```

### Example Audit Log

```txt
User: accountant@school.com
Action: payment.update
Record: Invoice #INV-2026-0012
Old amount: 5000
New amount: 4500
Reason: Scholarship discount approved
Time: 2026-06-25 10:30
IP: xxx.xxx.xxx.xxx
```

---

# 8. Database Design Overview

## Core Tables

```txt
School
Branch
AcademicYear
User
Role
Permission
UserRole
RolePermission
Student
Guardian
Teacher
Staff
ClassLevel
Section
Subject
ClassSubject
TeacherAssignment
Attendance
Exam
ExamSubject
Mark
GradeScale
FeeCategory
FeeStructure
Invoice
InvoiceItem
Payment
Expense
Payroll
LibraryBook
BookIssue
Vehicle
Route
Hostel
Room
InventoryItem
Notification
AuditLog
FileUpload
```

---

## 8.1 Important Database Design Rules

Use:

```txt
UUID primary keys for public APIs
Integer internal IDs optional
school_id in almost all tables
soft delete for important records
created_by
updated_by
created_at
updated_at
status fields
database indexes
unique constraints
foreign key constraints
```

---

## 8.2 Example Constraints

```txt
One roll number unique per class, section, academic year, school.
One admission number unique per school.
One teacher cannot be assigned to two periods at the same time.
One student cannot have two active invoices for same fee period.
```

---

# 9. API Design

Use REST API first.

---

## 9.1 Authentication APIs

```txt
POST /api/auth/login/
POST /api/auth/logout/
POST /api/auth/refresh/
POST /api/auth/forgot-password/
POST /api/auth/reset-password/
POST /api/auth/mfa/verify/
GET  /api/auth/me/
```

---

## 9.2 User / Role APIs

```txt
GET    /api/users/
POST   /api/users/
GET    /api/users/{id}/
PATCH  /api/users/{id}/
DELETE /api/users/{id}/

GET    /api/roles/
POST   /api/roles/
PATCH  /api/roles/{id}/
POST   /api/roles/{id}/permissions/
```

---

## 9.3 Student APIs

```txt
GET    /api/students/
POST   /api/students/
GET    /api/students/{id}/
PATCH  /api/students/{id}/
DELETE /api/students/{id}/
POST   /api/students/import/
GET    /api/students/{id}/attendance/
GET    /api/students/{id}/results/
GET    /api/students/{id}/fees/
```

---

## 9.4 Attendance APIs

```txt
POST /api/attendance/take/
PATCH /api/attendance/{id}/
GET /api/attendance/class/{class_id}/
GET /api/attendance/student/{student_id}/
GET /api/attendance/reports/
```

---

## 9.5 Exam APIs

```txt
POST /api/exams/
POST /api/exams/{id}/schedule/
POST /api/exams/{id}/marks/
POST /api/exams/{id}/lock/
POST /api/exams/{id}/publish/
GET  /api/exams/{id}/results/
```

---

## 9.6 Fee APIs

```txt
POST /api/fees/structures/
POST /api/invoices/generate/
GET  /api/invoices/
POST /api/payments/
GET  /api/payments/{id}/receipt/
GET  /api/reports/fees/collection/
GET  /api/reports/fees/due/
```

---

# 10. Frontend Pages

## 10.1 Public Pages

```txt
Login
Forgot password
Reset password
School landing page optional
```

---

## 10.2 Super Admin Dashboard

```txt
All schools
Create school
Subscription plans
School usage
Platform users
Global settings
Security logs
System health
```

---

## 10.3 Principal / Admin Dashboard

```txt
Overview
Students
Teachers
Staff
Admissions
Academics
Attendance
Exams
Fees
Payroll
Library
Transport
Hostel
Inventory
Reports
Settings
Roles & Permissions
```

---

## 10.4 Teacher Dashboard

```txt
My classes
My subjects
Today timetable
Take attendance
Assignments
Marks entry
Student performance
Messages
Notices
```

---

## 10.5 Student Dashboard

```txt
Profile
Attendance
Timetable
Assignments
Results
Fees
Notices
Library
Messages
```

---

## 10.6 Parent Dashboard

```txt
Children
Attendance
Results
Fees
Payments
Teacher messages
Notices
Discipline records
```

---

## 10.7 Accountant Dashboard

```txt
Fee collection
Invoices
Payments
Dues
Expenses
Payroll
Receipts
Reports
```

---

# 11. Security Requirements

Security is the most important part of this system.

---

## 11.1 Authentication Security

```txt
Use HttpOnly cookies for tokens
Use refresh token rotation
Use MFA for admins/accountants/super admin
Rate limit login
Lock account after repeated failures
Notify user on suspicious login
Store password with Argon2/bcrypt
Never store plain password
Never send password by email
Force password change for temporary password
```

---

## 11.2 Authorization Security

```txt
Check permission on backend, not only frontend
Use object-level permission
Use school_id isolation
Use branch_id isolation
Use class/subject scope for teachers
Never trust frontend role
Prevent IDOR attacks
```

### Bad Example

```txt
GET /api/students/123/
```

If a teacher changes the ID to 124 and sees another student's data, that is a serious security bug.

### Good Example

Backend checks:

```txt
Is user from same school?
Is user allowed to view this student?
Is student in teacher's assigned class?
```

---

## 11.3 Data Security

```txt
Encrypt HTTPS
Encrypt backups
Encrypt sensitive fields if needed
Use private file storage
Signed URLs for documents
Mask sensitive data in UI
Do not expose database IDs publicly if possible
Use UUIDs
```

---

## 11.4 Input Validation

```txt
Validate all forms
Use serializers
Use Zod on frontend
Use backend validation always
Prevent SQL injection
Prevent XSS
Prevent file upload attacks
Prevent path traversal
Sanitize rich text
```

---

## 11.5 CSRF / CORS

```txt
Use CSRF protection if using cookies
Strict CORS whitelist
No wildcard CORS in production
Secure SameSite cookies
```

---

## 11.6 File Upload Security

```txt
Allow only safe file types
Limit file size
Rename uploaded files
Store outside app server
Use private bucket
Scan files if possible
Never execute uploaded files
```

---

## 11.7 Logging and Monitoring

```txt
Audit logs
Login logs
Error logs
Payment logs
Permission change logs
Export logs
Failed login alerts
Suspicious activity alerts
```

---

## 11.8 Backup Security

```txt
Daily database backup
Weekly full backup
Monthly archive backup
Encrypted backup
Offsite backup
Backup restore testing
```

---

# 12. Privacy and Student Data Protection

A school system stores sensitive data:

```txt
Student data
Guardian data
Academic records
Attendance records
Fee records
Health notes
Address
Documents
Photos
Emergency contact details
```

So privacy must be part of the system.

## Must-have Privacy Features

```txt
Consent records
Data retention rules
Data export request
Data deletion/anonymization where legally allowed
Guardian access control
Student record access log
Sensitive field masking
Purpose-based data collection
No unnecessary personal data
No selling student data
```

---

# 13. Production Features Most Beginners Forget

Add these from the beginning:

```txt
Activity audit logs
Soft delete
Data export logs
Bulk import validation
Background jobs
Notification queue
Error tracking
Permission history
Record lock system
Approval workflow
Academic year locking
Fee invoice locking
Exam marks locking
Backup restore testing
System health dashboard
```

---

# 14. Approval Workflows

Real schools need approvals.

---

## 14.1 Fee Discount Approval

```txt
Accountant creates discount request
Principal approves
System applies discount
Audit log saved
Receipt generated
```

---

## 14.2 Marks Correction Approval

```txt
Teacher requests marks edit
Exam controller reviews
Principal approves if result already published
System updates marks
Audit log saved
```

---

## 14.3 Student Deletion

Never directly delete a student.

```txt
Admin marks student inactive
Principal approves
Student becomes archived
Data remains in system
```

---

# 15. Reports Required in Real School

## 15.1 Student Reports

```txt
Student profile report
Class-wise student list
Gender-wise report
Admission report
Transfer report
Dropout report
Guardian contact report
```

---

## 15.2 Attendance Reports

```txt
Daily attendance
Monthly attendance
Low attendance report
Class-wise attendance
Teacher attendance
Staff attendance
```

---

## 15.3 Exam Reports

```txt
Mark sheet
Grade sheet
Class result summary
Subject result analysis
Top students
Failed students
Progress report
Transcript
```

---

## 15.4 Finance Reports

```txt
Daily collection
Monthly collection
Due report
Discount report
Scholarship report
Expense report
Payroll report
Profit/loss summary
Ledger report
```

---

## 15.5 Admin Reports

```txt
Teacher workload
Class strength
Admission pipeline
System usage
Login activity
Audit log
```

---

# 16. Notification System

## Notification Events

```txt
Student absent
Fee due
Payment received
Homework assigned
Assignment deadline
Exam scheduled
Result published
Notice posted
Library book overdue
Transport route update
Password changed
New login detected
```

## Notification Table

```txt
id
school_id
user_id
title
message
type
channel
is_read
created_at
metadata
```

## Background Jobs

```txt
Celery sends SMS/email/push.
Do not send notifications directly inside API request.
```

---

# 17. Frontend Security

Frontend should not decide permission alone.

Frontend should:

```txt
Hide unauthorized menus
Protect routes
Refresh session safely
Auto logout on expiry
Show only allowed buttons
Validate forms
Escape user content
Avoid storing token in localStorage
```

Use:

```txt
HttpOnly cookies instead of localStorage
Server-side permission check
Route guards
Permission-based menu rendering
```

---

# 18. Backend Security Middleware

Use:

```txt
Security headers
CSP
HSTS
X-Frame-Options
X-Content-Type-Options
Referrer-Policy
Rate limiting
Request size limit
CORS whitelist
CSRF protection
```

## Production Django Settings Example

```python
DEBUG = False

ALLOWED_HOSTS = [
    "yourdomain.com",
    "api.yourdomain.com",
]

SECURE_SSL_REDIRECT = True

SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True

CSRF_COOKIE_HTTPONLY = False
SESSION_COOKIE_HTTPONLY = True

SECURE_HSTS_SECONDS = 31536000
SECURE_HSTS_INCLUDE_SUBDOMAINS = True
SECURE_HSTS_PRELOAD = True
```

---

# 19. Suggested Folder Structure

## 19.1 Backend

```txt
school_management_backend/
  config/
    settings/
      base.py
      dev.py
      prod.py
    urls.py
    celery.py
  apps/
    accounts/
    schools/
    students/
    guardians/
    teachers/
    academics/
    attendance/
    timetable/
    exams/
    fees/
    payroll/
    library/
    transport/
    hostel/
    inventory/
    communication/
    reports/
    audit/
  common/
    permissions.py
    pagination.py
    exceptions.py
    validators.py
    utils.py
  requirements/
    base.txt
    dev.txt
    prod.txt
  Dockerfile
  docker-compose.yml
```

---

## 19.2 Frontend

```txt
school-management-frontend/
  index.html
  vite.config.ts
  src/
    main.tsx              # app entry
    App.tsx               # router + providers
    routes/               # pages (lazy-loaded per route)
      login/
      dashboard/
      students/
      teachers/
      attendance/
      exams/
      fees/
      reports/
      settings/
    components/
      ui/                 # shadcn/ui components
      forms/
      tables/
      charts/
      layout/
    lib/
      api.ts
      auth.ts
      permissions.ts
      validators.ts
    hooks/
    store/
    types/
```

---

# 20. Development Roadmap

## Phase 1: Foundation

Build:

```txt
Project setup
Database setup
Authentication
Roles
Permissions
School/branch setup
Admin dashboard layout
Audit logging
```

---

## Phase 2: Core School System

Build:

```txt
Students
Guardians
Teachers
Staff
Classes
Sections
Subjects
Academic year
Teacher assignments
```

---

## Phase 3: Daily Operations

Build:

```txt
Attendance
Timetable
Notices
Homework
Student dashboard
Parent dashboard
Teacher dashboard
```

---

## Phase 4: Exams

Build:

```txt
Exam setup
Marks entry
Grade system
Report card
Result publish
Analytics
```

---

## Phase 5: Finance

Build:

```txt
Fee structure
Invoices
Payments
Receipts
Discounts
Due reports
Expenses
Payroll
```

---

## Phase 6: Advanced Modules

Build:

```txt
Library
Transport
Hostel
Inventory
Certificates
ID cards
Document management
```

---

## Phase 7: Production Hardening

Build:

```txt
MFA
Rate limiting
Security headers
Backup system
Monitoring
Error tracking
Load testing
Penetration testing
CI/CD
```

---

# 21. Minimum Production MVP

Do not try to build everything at once. First build this MVP:

```txt
Login + roles + permissions
School setup
Student management
Teacher management
Class/section/subject
Attendance
Exam marks
Fee collection
Dashboard
Reports
Audit logs
Backup
```

After that, add:

```txt
Parent portal
Student portal
Payroll
Library
Transport
Hostel
Inventory
Mobile app
```

---

# 22. Most Dangerous Bugs

For a real production school system, the most dangerous bugs are not UI bugs.

They are:

```txt
Teacher seeing wrong student data
Student seeing another student result
Accountant changing payment without audit
Admin deleting records permanently
Marks edited after result published
Weak password / no MFA
No backup
No permission checking on backend
```

So design the system around:

```txt
Security
Permissions
Audit logs
Data isolation
Backups
Approval workflow
Privacy
```

---

# 23. Best Final Stack

Recommended final stack:

```txt
Backend: Django + Django REST Framework
Frontend: React (Vite) + TypeScript + React Router + Tailwind CSS + shadcn/ui
Database: PostgreSQL
Cache/Queue: Redis + Celery
Files: S3 / R2 / Wasabi
Deployment: Docker + Nginx + Gunicorn
Auth: JWT with HttpOnly cookies + MFA
Monitoring: Sentry
Reports: WeasyPrint / ReportLab + Excel export
Charts: Recharts / ECharts
```

---

# 24. Final Module Checklist

```txt
✅ Super Admin Panel
✅ School Admin / Principal Panel
✅ Teacher Panel
✅ Student Panel
✅ Parent Panel
✅ Accountant Panel
✅ Reception / Admission Panel
✅ Exam Controller Panel
✅ HR Panel
✅ Library Panel
✅ Transport Panel
✅ Hostel Panel
✅ Inventory Panel
✅ Role & Permission System
✅ Student Management
✅ Guardian Management
✅ Staff Management
✅ Class / Section / Subject
✅ Timetable
✅ Attendance
✅ Homework / Assignment
✅ Exam / Result
✅ Fee / Invoice / Payment
✅ Expense Management
✅ Payroll
✅ Library
✅ Transport
✅ Hostel
✅ Inventory
✅ Notices
✅ Messaging
✅ SMS / Email / Push
✅ Reports
✅ Analytics
✅ Audit Logs
✅ Backup System
✅ Security Settings
✅ Multi-School Support
✅ Multi-Branch Support
✅ Academic Year Locking
✅ Document Uploads
✅ ID Card Generator
✅ Certificate Generator
✅ Export PDF / Excel
```

---

# 25. Suggested Development Order

Build in this order:

```txt
1. Backend project setup
2. PostgreSQL setup
3. Custom user model
4. School and branch model
5. Role and permission model
6. Authentication
7. Super admin dashboard
8. Principal/admin dashboard
9. Student module
10. Guardian module
11. Teacher/staff module
12. Academic module
13. Attendance module
14. Exam module
15. Fee module
16. Reports
17. Audit logs
18. Backup system
19. Security hardening
20. Deployment
```

---

# 26. References for Security and Privacy

Use these as guidance while building:

- OWASP Application Security Verification Standard  
  https://owasp.org/www-project-application-security-verification-standard/

- OWASP Top 10  
  https://owasp.org/Top10/

- NIST Digital Identity Guidelines  
  https://pages.nist.gov/800-63-4/

- Django Security  
  https://docs.djangoproject.com/en/stable/topics/security/

- Django REST Framework  
  https://www.django-rest-framework.org/

- Student Privacy, U.S. Department of Education  
  https://studentprivacy.ed.gov/

- Nepal Privacy Act 2075, Nepal Law Commission  
  https://lawcommission.gov.np/content/12261/12261-the-privacy-act-2075/

---

# 27. Final Advice

Start with the foundation and permission system first.

A beautiful frontend is useless if permissions are weak.

The first production goal should be:

```txt
Secure login
Roles
Permissions
School isolation
Student module
Teacher module
Attendance
Exam marks
Fee collection
Reports
Audit logs
Backups
```

After this foundation is stable, add advanced modules like:

```txt
Library
Transport
Hostel
Inventory
Payroll
Mobile app
AI analytics
Parent communication
```
