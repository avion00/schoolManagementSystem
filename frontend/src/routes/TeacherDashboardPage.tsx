import {
  BookOpen,
  CalendarCheck,
  ClipboardList,
  Clock,
  GraduationCap,
  Users,
} from "lucide-react";

import { PopNumber, Reveal, TiltCard } from "@/components/motion";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAuth } from "@/lib/auth";
import { cn } from "@/lib/utils";

/* ── Static mock data ────────────────────────────────────────────────────── */

const teacherStats = [
  {
    id: "classes",
    label: "My Classes",
    value: "2",
    sub: "Grade 8-A · Grade 8-B",
    icon: GraduationCap,
    iconCls: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  },
  {
    id: "students",
    label: "My Students",
    value: "84",
    sub: "Across assigned sections",
    icon: Users,
    iconCls: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  },
  {
    id: "attendance",
    label: "Today's Attendance",
    value: "92%",
    sub: "79 of 84 present",
    icon: CalendarCheck,
    iconCls: "bg-violet-500/10 text-violet-600 dark:text-violet-400",
  },
  {
    id: "exams",
    label: "Exams to Grade",
    value: "2",
    sub: "Marks entry pending",
    icon: ClipboardList,
    iconCls: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  },
];

const todaySchedule = [
  { period: "1st", subject: "Science",     class: "Grade 8-A", time: "8:00 – 9:00 AM",   room: "Lab 1"  },
  { period: "2nd", subject: "Science",     class: "Grade 8-B", time: "9:00 – 10:00 AM",  room: "Lab 1"  },
  { period: "3rd", subject: "Science Lab", class: "Grade 8-A", time: "10:00 – 11:00 AM", room: "Lab 2"  },
  { period: "4th", subject: "Science",     class: "Grade 9-A", time: "11:30 – 12:30 PM", room: "Room 5" },
];

const myStudents = [
  { name: "Liam Smith",    roll: "01", class: "8-A", attendance: "95%", status: "present" },
  { name: "Olivia Garcia", roll: "02", class: "8-A", attendance: "88%", status: "present" },
  { name: "Noah Smith",    roll: "01", class: "9-A", attendance: "91%", status: "absent"  },
  { name: "Emma Brown",    roll: "03", class: "8-A", attendance: "97%", status: "present" },
  { name: "Aiden Lee",     roll: "04", class: "8-B", attendance: "82%", status: "late"    },
];

const upcomingExams = [
  { subject: "Science Unit 3", class: "Grade 8-A", date: "Jul 10", status: "pending",   note: "Marks not entered" },
  { subject: "Science Unit 3", class: "Grade 8-B", date: "Jul 11", status: "pending",   note: "Marks not entered" },
  { subject: "Science Final",  class: "Grade 8-A", date: "Jul 18", status: "scheduled", note: "Exam not yet held"  },
];

const recentActivities = [
  { action: "Attendance marked",   detail: "Grade 8-A — 41/42 present",            time: "8:30 AM" },
  { action: "Marks entered",       detail: "Science Unit 2 — Grade 8-B submitted",  time: "Yesterday" },
  { action: "Assignment uploaded", detail: "Science Chapter 7 worksheet",           time: "Jun 29"  },
  { action: "Attendance marked",   detail: "Grade 9-A — 28/30 present",             time: "Jun 28"  },
];

/* ── Sub-components ──────────────────────────────────────────────────────── */

function StatTile({
  stat,
}: {
  stat: (typeof teacherStats)[number];
}) {
  const Icon = stat.icon;
  return (
    <TiltCard className="h-full">
      <Card className="h-full transition-shadow hover:shadow-md">
        <CardContent className="flex flex-col gap-3 p-5">
          <span
            className={cn(
              "flex h-11 w-11 items-center justify-center rounded-xl",
              stat.iconCls,
            )}
          >
            <Icon className="h-5 w-5" />
          </span>
          <div>
            <p className="text-2xl font-bold tabular-nums text-foreground lg:text-3xl">
              <PopNumber value={stat.value} />
            </p>
            <p className="mt-0.5 text-sm font-medium text-foreground">{stat.label}</p>
            <p className="mt-0.5 text-xs text-muted-foreground">{stat.sub}</p>
          </div>
        </CardContent>
      </Card>
    </TiltCard>
  );
}

/* ── Page ────────────────────────────────────────────────────────────────── */

export function TeacherDashboardPage() {
  const { user } = useAuth();
  const firstName = user?.full_name?.split(" ")[0] ?? "Teacher";

  return (
    <div className="space-y-4">
      {/* Greeting */}
      <Reveal>
        <div className="pb-1">
          <p className="text-base font-semibold tracking-tight text-foreground">
            Good morning, {firstName}
          </p>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Demo Teacher · Science Department · Greenwood High
          </p>
        </div>
      </Reveal>

      {/* Row 1 — stat cards */}
      <Reveal delay={60} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {teacherStats.map((stat) => (
          <StatTile key={stat.id} stat={stat} />
        ))}
      </Reveal>

      {/* Row 2 — today's schedule + quick actions */}
      <Reveal delay={120} className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <CardTitle className="text-base">Today's Schedule</CardTitle>
            </div>
            <CardDescription>Wednesday, Jul 1 2026</CardDescription>
          </CardHeader>
          <CardContent className="px-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="pl-6">Period</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead>Class</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead className="pr-6">Room</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {todaySchedule.map((row) => (
                  <TableRow key={row.period}>
                    <TableCell className="pl-6">
                      <span className="text-xs font-semibold text-muted-foreground">{row.period}</span>
                    </TableCell>
                    <TableCell className="font-medium">{row.subject}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{row.class}</TableCell>
                    <TableCell className="text-sm tabular-nums text-muted-foreground">{row.time}</TableCell>
                    <TableCell className="pr-6 text-sm text-muted-foreground">{row.room}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Quick actions */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-2">
            {[
              { label: "Take Attendance", icon: CalendarCheck, cls: "text-emerald-600 dark:text-emerald-400" },
              { label: "Enter Marks",     icon: ClipboardList, cls: "text-amber-600 dark:text-amber-400"    },
              { label: "My Students",     icon: Users,         cls: "text-blue-600 dark:text-blue-400"      },
              { label: "View Exams",      icon: BookOpen,      cls: "text-violet-600 dark:text-violet-400"  },
            ].map((a) => {
              const Icon = a.icon;
              return (
                <button
                  key={a.label}
                  type="button"
                  className="flex flex-col items-center gap-1.5 rounded-xl border border-border/60 p-3 text-center transition-colors hover:bg-muted/60"
                >
                  <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted">
                    <Icon className={cn("h-4 w-4", a.cls)} />
                  </span>
                  <span className="text-[11px] font-medium leading-tight text-foreground">
                    {a.label}
                  </span>
                </button>
              );
            })}
          </CardContent>
        </Card>
      </Reveal>

      {/* Row 3 — students + exams to grade */}
      <Reveal delay={180} className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">My Students</CardTitle>
            <CardDescription>Today's status across assigned sections.</CardDescription>
          </CardHeader>
          <CardContent className="px-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="pl-6">Name</TableHead>
                  <TableHead>Class</TableHead>
                  <TableHead>Attendance</TableHead>
                  <TableHead className="pr-6 text-right">Today</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {myStudents.map((s) => (
                  <TableRow key={s.name}>
                    <TableCell className="pl-6 font-medium">{s.name}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      Grade {s.class}
                    </TableCell>
                    <TableCell className="text-sm tabular-nums">{s.attendance}</TableCell>
                    <TableCell className="pr-6 text-right">
                      <Badge
                        variant={
                          s.status === "present"
                            ? "success"
                            : s.status === "late"
                              ? "warning"
                              : "destructive"
                        }
                      >
                        {s.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Upcoming exams + recent activity */}
        <div className="flex flex-col gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Exams to Grade</CardTitle>
              <CardDescription>Pending marks entry.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {upcomingExams.map((e) => (
                <div
                  key={`${e.subject}-${e.class}`}
                  className="flex items-center gap-3 rounded-lg border border-border/50 p-2.5"
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-500/10">
                    <ClipboardList className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{e.subject}</p>
                    <p className="text-xs text-muted-foreground">{e.class} · {e.date}</p>
                  </div>
                  <Badge variant={e.status === "pending" ? "warning" : "secondary"}>
                    {e.status}
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="flex-1">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {recentActivities.map((a, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-primary/60" />
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-foreground">{a.action}</p>
                      <p className="text-xs text-muted-foreground">{a.detail}</p>
                      <p className="mt-0.5 text-[11px] text-muted-foreground/60">{a.time}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      </Reveal>
    </div>
  );
}
