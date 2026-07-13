import { useEffect, useState } from "react";
import {
  Bell,
  ChevronRight,
  CircleHelp,
  LogOut,
  MoreVertical,
  PanelLeftClose,
  PanelLeftOpen,
  Settings,
  type LucideIcon,
} from "lucide-react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";

import { AppearanceToggle } from "@/components/AppearanceToggle";
import { PageTransition } from "@/components/animations/PageTransition";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useAuth } from "@/lib/auth";
import { useTheme } from "@/lib/theme";
import { cn } from "@/lib/utils";

export interface NavItem {
  to: string;
  label: string;
  icon: LucideIcon;
  perm?: string;
  children?: Omit<NavItem, "children">[];
}
export interface NavGroup {
  label: string;
  items: NavItem[];
}


/* Paths not in the nav tree — fallback breadcrumbs */
const EXTRA_CRUMBS: Record<string, string[]> = {
  "/billing":       ["Portal", "Billing"],
  "/notifications": ["Portal", "Notifications"],
  "/search":        ["Portal", "Search"],
};

/**
 * Derives breadcrumb segments from the nav config + known extra paths.
 * "Overview" group items are promoted to top-level (no group segment in path).
 */
function deriveBreadcrumb(pathname: string, nav: NavGroup[], brand: string): string[] {
  // Help Desk (Super Admin) vs. the student/parent "Get Help" support page —
  // both routes are literally "/help" but resolve to different page components
  // depending on which Shell (brand) renders them.
  if (brand !== "Student Portal" && brand !== "Teacher Portal") {
    if (pathname === "/help")             return ["Super Admin", "Support", "Help Desk"];
    if (pathname === "/help/tickets/new") return ["Super Admin", "Support", "Help Desk", "New Ticket"];
    if (pathname.startsWith("/help/tickets/")) return ["Super Admin", "Support", "Help Desk", "Ticket Details"];
  }

  // Teacher paths (before nav lookup so "Staff" label overrides "People")
  if (pathname === "/teachers")                                        return ["Portal", "Staff", "Teachers"];
  if (pathname === "/teachers/new")                                    return ["Portal", "Staff", "Teachers", "Add Teacher"];
  if (pathname === "/teachers/teacher-form/print")                     return ["Portal", "Staff", "Teachers", "Teacher Form"];
  if (pathname.startsWith("/teachers/") && pathname.endsWith("/edit")) return ["Portal", "Staff", "Teachers", "Edit Teacher"];
  if (pathname.startsWith("/teachers/"))                               return ["Portal", "Staff", "Teachers", "Teacher Details"];

  // Exam paths (before nav loop so /exams gets 4-segment crumb)
  if (pathname === "/exams")                                                         return ["Portal", "Academics", "Exam", "Dashboard"];
  if (pathname === "/exams/schedule/new")                                            return ["Portal", "Academics", "Exam", "Add Schedule"];
  if (pathname.startsWith("/exams/schedule/") && pathname.endsWith("/edit"))         return ["Portal", "Academics", "Exam", "Edit Schedule"];
  if (pathname.startsWith("/exams/schedule/"))                                       return ["Portal", "Academics", "Exam", "Schedule Details"];
  if (pathname === "/exams/grades/new")                                              return ["Portal", "Academics", "Exam", "Add Grade"];
  if (pathname.startsWith("/exams/grades/") && pathname.endsWith("/edit"))           return ["Portal", "Academics", "Exam", "Edit Grade"];

  // Message paths
  if (pathname === "/messages")                                              return ["Portal", "Communication", "Messages"];
  if (pathname === "/messages/chats")                                        return ["Portal", "Communication", "Messages"];
  if (pathname === "/messages/new")                                          return ["Portal", "Communication", "Messages", "New Conversation"];
  if (pathname.startsWith("/messages/chats/"))                               return ["Portal", "Communication", "Messages", "Conversation"];
  if (pathname === "/messages/groups")                                       return ["Portal", "Communication", "Messages", "Groups"];
  if (pathname === "/messages/broadcasts")                                   return ["Portal", "Communication", "Messages", "Broadcasts"];
  if (pathname === "/messages/archived")                                     return ["Portal", "Communication", "Messages", "Archived"];
  if (pathname === "/messages/requests")                                     return ["Portal", "Communication", "Messages", "Message Requests"];
  if (pathname === "/messages/moderation")                                   return ["Portal", "Communication", "Messages", "Message Moderation"];
  if (pathname === "/messages/export")                                       return ["Portal", "Communication", "Messages", "Export"];
  if (pathname === "/messages/settings")                                     return ["Portal", "Communication", "Messages", "Message Settings"];

  // Help / Support
  if (pathname === "/help")                                                  return ["Portal", "Support", "Get Help"];

  // Settings (system / administration + personal account)
  if (pathname === "/settings")                                              return ["Portal", "Settings"];
  if (pathname === "/settings/my-profile")                                   return ["Portal", "Settings", "My Profile"];
  if (pathname === "/settings/my-security")                                  return ["Portal", "Settings", "My Security"];
  if (pathname === "/settings/my-sessions")                                  return ["Portal", "Settings", "My Sessions"];
  if (pathname === "/settings/school-profile")                               return ["Portal", "Settings", "School Profile"];
  if (pathname === "/settings/academic-year")                                return ["Portal", "Settings", "Academic Year"];
  if (pathname === "/settings/users")                                        return ["Portal", "Settings", "Users"];
  if (pathname === "/settings/roles-permissions")                            return ["Portal", "Settings", "Roles & Permissions"];
  if (pathname === "/settings/access-control")                               return ["Portal", "Settings", "Access Control"];
  if (pathname === "/settings/security")                                     return ["Portal", "Settings", "Security"];
  if (pathname === "/settings/audit-logs")                                   return ["Portal", "Settings", "Audit Logs"];
  if (pathname === "/settings/attendance")                                   return ["Portal", "Settings", "Attendance Settings"];
  if (pathname === "/settings/exam-grading")                                 return ["Portal", "Settings", "Exam & Grading"];
  if (pathname === "/settings/fees")                                         return ["Portal", "Settings", "Fee Settings"];
  if (pathname === "/settings/notifications")                                return ["Portal", "Settings", "Notifications"];
  if (pathname === "/settings/appearance")                                   return ["Portal", "Settings", "Appearance"];
  if (pathname === "/settings/backup")                                       return ["Portal", "Settings", "Backup & Export"];

  // Finance / Billing
  if (pathname === "/billing")                                               return ["Portal", "Finance", "Billing"];
  if (pathname === "/billing/fees")                                          return ["Portal", "Finance", "Billing", "Student Fees"];
  if (pathname === "/billing/invoices")                                      return ["Portal", "Finance", "Billing", "Invoices"];
  if (pathname === "/billing/invoices/new")                                  return ["Portal", "Finance", "Billing", "Invoices", "New Invoice"];
  if (pathname.startsWith("/billing/invoices/"))                             return ["Portal", "Finance", "Billing", "Invoices", "Invoice Details"];
  if (pathname === "/billing/payments")                                      return ["Portal", "Finance", "Billing", "Payments"];
  if (pathname === "/billing/expenses")                                      return ["Portal", "Finance", "Billing", "Expenses"];
  if (pathname === "/billing/payroll")                                       return ["Portal", "Finance", "Billing", "Payroll"];
  if (pathname === "/billing/vendors")                                       return ["Portal", "Finance", "Billing", "Vendors"];
  if (pathname === "/billing/reports")                                       return ["Portal", "Finance", "Billing", "Reports"];
  if (pathname === "/billing/settings")                                      return ["Portal", "Finance", "Billing", "Billing Settings"];
  if (pathname.startsWith("/billing/receipts/"))                             return ["Portal", "Finance", "Billing", "Receipt"];

  // Notice paths
  if (pathname === "/notices")                                               return ["Portal", "Communication", "Notice Board"];
  if (pathname === "/notices/new")                                           return ["Portal", "Communication", "Notice Board", "Create Notice"];
  if (pathname.startsWith("/notices/") && pathname.endsWith("/edit"))        return ["Portal", "Communication", "Notice Board", "Edit Notice"];
  if (pathname.startsWith("/notices/"))                                      return ["Portal", "Communication", "Notice Board", "Notice Details"];

  // Attendance paths (before nav loop so /attendance gets 4-segment crumb)
  if (pathname === "/attendance")                return ["Portal", "Operations", "Attendance", "Dashboard"];
  if (pathname === "/attendance/daily")          return ["Portal", "Operations", "Attendance", "Daily Marking"];
  if (pathname === "/attendance/monthly")        return ["Portal", "Operations", "Attendance", "Monthly Sheet"];
  if (pathname === "/attendance/student")        return ["Portal", "Operations", "Attendance", "Student Report"];
  if (pathname === "/attendance/teacher")        return ["Portal", "Operations", "Attendance", "Teacher Report"];
  if (pathname === "/attendance/class")          return ["Portal", "Operations", "Attendance", "Class Report"];
  if (pathname === "/attendance/reports")        return ["Portal", "Operations", "Attendance", "Analytics"];

  // Teacher workspace detail/sub-routes not present verbatim in teacherSidebar
  if (pathname.startsWith("/teacher/classes/"))          return ["Portal", "Teaching Workspace", "My Classes", "Class Details"];
  if (pathname.startsWith("/teacher/students/"))          return ["Portal", "Teaching Workspace", "My Students", "Student Details"];
  if (pathname === "/teacher/homework/new")               return ["Portal", "Academics", "Homework", "Assign Homework"];
  if (pathname.startsWith("/teacher/homework/"))          return ["Portal", "Academics", "Homework", "Homework Details"];
  if (pathname === "/teacher/assignments/new")            return ["Portal", "Academics", "Assignments", "Create Assignment"];
  if (pathname.startsWith("/teacher/assignments/"))       return ["Portal", "Academics", "Assignments", "Assignment Details"];

  for (const group of nav) {
    const item = group.items.find((i) => i.to === pathname);
    if (item) {
      if (group.label === "Overview") return ["Portal", item.label];
      return ["Portal", group.label, item.label];
    }
    for (const it of group.items) {
      const child = (it.children ?? []).find((c) => c.to === pathname);
      if (child) return ["Portal", group.label, it.label, child.label];
    }
  }
  if (pathname === "/classes/new")                                    return ["Portal", "Academics", "Classes", "Add Class"];
  if (pathname === "/classes/class-form/print")                       return ["Portal", "Academics", "Classes", "Class Form"];
  if (pathname.startsWith("/classes/") && pathname.endsWith("/edit")) return ["Portal", "Academics", "Classes", "Edit Class"];
  if (pathname.startsWith("/classes/"))                               return ["Portal", "Academics", "Classes", "Class Details"];
  if (pathname === "/subjects/new")                                    return ["Portal", "Academics", "Subjects", "Add Subject"];
  if (pathname === "/subjects/subject-form/print")                     return ["Portal", "Academics", "Subjects", "Subject Form"];
  if (pathname.startsWith("/subjects/") && pathname.endsWith("/edit")) return ["Portal", "Academics", "Subjects", "Edit Subject"];
  if (pathname.startsWith("/subjects/"))                               return ["Portal", "Academics", "Subjects", "Subject Details"];
  if (pathname === "/class-routine/new")                                    return ["Portal", "Academics", "Class Routine", "Add Routine"];
  if (pathname === "/class-routine/print")                                  return ["Portal", "Academics", "Class Routine", "Print Routine"];
  if (pathname.startsWith("/class-routine/") && pathname.endsWith("/edit")) return ["Portal", "Academics", "Class Routine", "Edit Routine"];
  if (pathname.startsWith("/class-routine/"))                               return ["Portal", "Academics", "Class Routine", "Routine Details"];
  if (pathname === "/parents/new")                                    return ["Portal", "People", "Parents", "Add Parent"];
  if (pathname === "/parents/parent-form/print")                      return ["Portal", "People", "Parents", "Parent Form"];
  if (pathname.startsWith("/parents/") && pathname.endsWith("/edit")) return ["Portal", "People", "Parents", "Edit Parent"];
  if (pathname.startsWith("/parents/"))                               return ["Portal", "People", "Parents", "Parent Details"];
  if (pathname === "/students/new")                    return ["Portal", "People", "Students", "Add Student"];
  if (pathname === "/students/admission-form/print")   return ["Portal", "People", "Students", "Admission Form"];
  if (pathname.endsWith("/edit"))                      return ["Portal", "People", "Students", "Edit Student"];
  if (pathname.startsWith("/students/"))               return ["Portal", "People", "Students", "Student Details"];
  return EXTRA_CRUMBS[pathname] ?? ["Portal"];
}

/**
 * Sub-routes of these sections share one persistent shell (a fixed sidebar/panel
 * layout where only the inner content swaps) — keying PageTransition on the full
 * pathname would force a jarring unmount/remount + re-animation on every click
 * inside that shell. Collapse them to their section root so only navigating
 * into/out of the section (not between its sub-pages) replays the transition.
 */
const SHARED_SHELL_SECTIONS = ["/settings", "/messages"];

function transitionKeyFor(pathname: string): string {
  const section = SHARED_SHELL_SECTIONS.find((s) => pathname === s || pathname.startsWith(s + "/"));
  return section ?? pathname;
}

function initialsOf(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "U";
  return (parts[0][0] + (parts[1]?.[0] ?? "")).toUpperCase();
}

/* ── Mobile header icon ───────────────────────────────────────────────── */
function BrandMark({ className }: { className?: string }) {
  const { resolvedTheme } = useTheme();
  return (
    <img
      src={resolvedTheme === "dark" ? "/logo_title-light.png" : "/logo-title-dark.png"}
      alt="Online Dashboard"
      className={cn("h-8 w-8 shrink-0 object-contain", className)}
    />
  );
}

/* ── Sidebar header brand ─────────────────────────────────────────────── */
function SidebarBrand({ collapsed }: { collapsed: boolean }) {
  const { resolvedTheme } = useTheme();
  if (collapsed) {
    return (
      <img
        src={resolvedTheme === "dark" ? "/logo_title-light.png" : "/logo-title-dark.png"}
        alt="Online Dashboard"
        className="h-9 w-9 object-contain"
      />
    );
  }
  return (
    <img
      src={resolvedTheme === "dark" ? "/logo-light.png" : "/logo-dark.png"}
      alt="Online Dashboard"
      className="h-10 w-auto max-w-[190px] object-contain object-left"
    />
  );
}

/* ── Nav item — main nav + footer utility links ───────────────────────── */
function SideNavItem({
  item,
  active,
  collapsed,
}: {
  item: NavItem;
  active: boolean;
  collapsed: boolean;
}) {
  const Icon = item.icon;

  const link = (
    <NavLink
      to={item.to}
      className={cn(
        "group relative flex items-center gap-3 rounded-lg transition-all duration-150",
        collapsed ? "justify-center px-0 py-2.5" : "px-3 py-[9px]",
        active
          ? "bg-primary/[0.08] text-primary"
          : "text-foreground/60 hover:bg-accent/70 hover:text-foreground",
      )}
    >
      {active && (
        <span
          className={cn(
            "absolute left-0 top-1/2 -translate-y-1/2 rounded-r-full bg-primary",
            collapsed ? "h-4 w-[3px]" : "h-5 w-[3px]",
          )}
        />
      )}
      <Icon
        className={cn(
          "h-[17px] w-[17px] shrink-0 transition-colors",
          active ? "text-primary" : "text-foreground/45 group-hover:text-foreground/75",
        )}
      />
      {!collapsed && (
        <span className="truncate text-[13.5px] font-medium tracking-[-0.01em]">
          {item.label}
        </span>
      )}
    </NavLink>
  );

  if (!collapsed) return link;
  return (
    <Tooltip>
      <TooltipTrigger asChild>{link}</TooltipTrigger>
      <TooltipContent side="right" className="font-medium">
        {item.label}
      </TooltipContent>
    </Tooltip>
  );
}

/* ── Expandable nav item (parent with children) ───────────────────────── */
function ExpandableNavItem({
  item,
  collapsed,
  pathname,
}: {
  item: NavItem;
  collapsed: boolean;
  pathname: string;
}) {
  const children = item.children ?? [];
  const isChildActive = children.some(
    (c) => pathname === c.to || pathname.startsWith(c.to + "/"),
  );
  const isParentActive = pathname === item.to || isChildActive;
  const [open, setOpen] = useState(isParentActive);
  const Icon = item.icon;

  useEffect(() => {
    if (isParentActive) setOpen(true);
  }, [isParentActive]);

  if (collapsed) {
    const link = (
      <NavLink
        to={item.to}
        className={cn(
          "group relative flex items-center justify-center rounded-lg px-0 py-2.5 transition-all duration-150",
          isParentActive
            ? "bg-primary/[0.08] text-primary"
            : "text-foreground/60 hover:bg-accent/70 hover:text-foreground",
        )}
      >
        {isParentActive && (
          <span className="absolute left-0 top-1/2 h-4 w-[3px] -translate-y-1/2 rounded-r-full bg-primary" />
        )}
        <Icon
          className={cn(
            "h-[17px] w-[17px] shrink-0",
            isParentActive ? "text-primary" : "text-foreground/45",
          )}
        />
      </NavLink>
    );
    return (
      <Tooltip>
        <TooltipTrigger asChild>{link}</TooltipTrigger>
        <TooltipContent side="right" className="font-medium">
          {item.label}
        </TooltipContent>
      </Tooltip>
    );
  }

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={cn(
          "group relative flex w-full items-center gap-3 rounded-lg px-3 py-[9px] transition-all duration-150",
          isParentActive
            ? "bg-primary/[0.08] text-primary"
            : "text-foreground/60 hover:bg-accent/70 hover:text-foreground",
        )}
      >
        {isParentActive && (
          <span className="absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-r-full bg-primary" />
        )}
        <Icon
          className={cn(
            "h-[17px] w-[17px] shrink-0 transition-colors",
            isParentActive ? "text-primary" : "text-foreground/45 group-hover:text-foreground/75",
          )}
        />
        <span className="flex-1 truncate text-left text-[13.5px] font-medium tracking-[-0.01em]">
          {item.label}
        </span>
        <ChevronRight
          className={cn(
            "h-3.5 w-3.5 shrink-0 transition-transform duration-200",
            open && "rotate-90",
          )}
        />
      </button>

      <div
        className={cn(
          "grid transition-all duration-200 ease-in-out",
          open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
        )}
      >
        <div className="overflow-hidden">
          <div className="ml-4 mt-0.5 space-y-0.5 border-l border-border/50 pb-1 pl-3">
            {children.map((child) => (
              <SideNavItem
                key={child.to}
                item={child}
                active={pathname === child.to}
                collapsed={false}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Profile dropdown content ─────────────────────────────────────────── */
function ProfileDropdown({
  name,
  email,
  side,
  onLogout,
}: {
  name: string;
  email: string;
  side: "right" | "top" | "bottom";
  onLogout: () => void;
}) {
  const navigate = useNavigate();
  return (
    <DropdownMenuContent
      side={side}
      align="end"
      sideOffset={12}
      className={cn(
        "z-[9999] w-[260px] overflow-hidden rounded-xl p-0",
        "border border-border/60 shadow-xl",
        "bg-white dark:bg-[#1c1c1e]",
      )}
    >
      <div className="flex items-center gap-3 px-4 py-3.5">
        <Avatar className="h-9 w-9 shrink-0">
          <AvatarFallback className="bg-primary/10 text-[11px] font-bold tracking-wide text-primary">
            {initialsOf(name)}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <p className="truncate text-[13.5px] font-semibold leading-snug text-foreground">
            {name}
          </p>
          <p className="truncate text-[12px] leading-snug text-muted-foreground">
            {email}
          </p>
        </div>
      </div>

      <DropdownMenuSeparator className="m-0 bg-border/60" />

      <div className="p-1.5">
        {(
          [
            { to: "/settings", icon: Settings,   label: "Settings" },
            { to: "/help",     icon: CircleHelp, label: "Help"     },
          ]
        ).map(({ to, icon: Icon, label }) => (
          <DropdownMenuItem
            key={to}
            onClick={() => navigate(to)}
            className="
              flex cursor-pointer items-center gap-3
              rounded-lg px-3 py-2.5 text-[13.5px] font-medium
              text-foreground/80
              transition-colors duration-100
              hover:bg-accent/70 hover:text-foreground
              focus:bg-accent/70 focus:text-foreground
              data-[highlighted]:bg-accent/70 data-[highlighted]:text-foreground
            "
          >
            <Icon className="h-4 w-4 shrink-0 text-muted-foreground" />
            {label}
          </DropdownMenuItem>
        ))}
      </div>

      <DropdownMenuSeparator className="m-0 bg-border/60" />

      <div className="p-1.5">
        <DropdownMenuItem
          onClick={onLogout}
          className="
            flex cursor-pointer items-center gap-3
            rounded-lg px-3 py-2.5 text-[13.5px] font-medium
            text-destructive
            transition-colors duration-100
            hover:bg-destructive/10 hover:text-destructive
            focus:bg-destructive/10 focus:text-destructive
            data-[highlighted]:bg-destructive/10 data-[highlighted]:text-destructive
          "
        >
          <LogOut className="h-4 w-4 shrink-0" />
          Log out
        </DropdownMenuItem>
      </div>
    </DropdownMenuContent>
  );
}

/* ── User menu ─────────────────────────────────────────────────────────── */
function UserMenu({ collapsed, compact }: { collapsed?: boolean; compact?: boolean }) {
  const { user, logout } = useAuth();
  const name = user?.full_name || user?.email || "";
  const email = user?.email ?? "";

  if (compact) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="flex items-center rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="text-xs font-semibold">{initialsOf(name)}</AvatarFallback>
            </Avatar>
          </button>
        </DropdownMenuTrigger>
        <ProfileDropdown name={name} email={email} side="bottom" onLogout={logout} />
      </DropdownMenu>
    );
  }

  if (collapsed) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="flex w-full items-center justify-center rounded-xl p-2 transition-colors duration-150 hover:bg-accent/70 outline-none">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="text-[11px] font-bold tracking-wide">{initialsOf(name)}</AvatarFallback>
            </Avatar>
          </button>
        </DropdownMenuTrigger>
        <ProfileDropdown name={name} email={email} side="right" onLogout={logout} />
      </DropdownMenu>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="
          flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left
          transition-colors duration-150 hover:bg-accent/70
          outline-none focus-visible:ring-2 focus-visible:ring-ring
        ">
          <Avatar className="h-9 w-9 shrink-0">
            <AvatarFallback className="bg-primary/10 text-[11px] font-bold tracking-wide text-primary">
              {initialsOf(name)}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[13px] font-semibold leading-snug text-foreground">{name}</p>
            <p className="truncate text-[11.5px] leading-snug text-muted-foreground/80">{email}</p>
          </div>
          <MoreVertical className="h-4 w-4 shrink-0 text-muted-foreground/50" />
        </button>
      </DropdownMenuTrigger>
      <ProfileDropdown name={name} email={email} side="right" onLogout={logout} />
    </DropdownMenu>
  );
}

/* ── Shell ────────────────────────────────────────────────────────────── */
export function Shell({ nav, brand }: { nav: NavGroup[]; brand: string }) {
  const { hasPermission } = useAuth();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(
    () => localStorage.getItem("sidebar-collapsed") === "1",
  );
  const toggle = () =>
    setCollapsed((c) => {
      localStorage.setItem("sidebar-collapsed", c ? "0" : "1");
      return !c;
    });

  const breadcrumb = deriveBreadcrumb(pathname, nav, brand);
  const pageTitle = breadcrumb.at(-1) ?? brand;

  const visibleGroups = nav
    .map((g) => ({
      ...g,
      items: g.items
        .filter((i) => !i.perm || hasPermission(i.perm))
        .map((i) => ({
          ...i,
          children: i.children?.filter((c) => !c.perm || hasPermission(c.perm)),
        })),
    }))
    .filter((g) => g.items.length > 0);

  return (
    <div className="flex h-screen overflow-hidden bg-background print:block print:h-auto print:overflow-visible">

      {/* ── Desktop sidebar ───────────────────────────────────────────── */}
      <aside
        className={cn(
          "hidden flex-col border-r border-border/60 bg-card transition-[width] duration-300 ease-out md:flex print:hidden",
          collapsed ? "w-[68px]" : "w-64",
        )}
      >
        {/* Brand header */}
        <div
          className={cn(
            "flex h-16 shrink-0 items-center border-b border-border/60",
            collapsed ? "justify-center" : "px-5",
          )}
        >
          <SidebarBrand collapsed={collapsed} />
        </div>

        {/* Scrollable main navigation */}
        <ScrollArea className="flex-1 py-4">
          <nav className={cn("flex flex-col gap-6", collapsed ? "px-2" : "px-3")}>
            {visibleGroups.map((group) => (
              <div key={group.label} className="flex flex-col gap-0.5">
                {!collapsed && (
                  <p className="mb-1.5 px-3 text-[10px] font-semibold uppercase tracking-[0.09em] text-muted-foreground/50">
                    {group.label}
                  </p>
                )}
                {group.items.map((item) =>
                  item.children ? (
                    <ExpandableNavItem
                      key={item.to}
                      item={item}
                      collapsed={collapsed}
                      pathname={pathname}
                    />
                  ) : (
                    <SideNavItem
                      key={item.to}
                      item={item}
                      active={pathname === item.to}
                      collapsed={collapsed}
                    />
                  ),
                )}
              </div>
            ))}
          </nav>
        </ScrollArea>

        {/* ── Pinned footer ─────────────────────────────────────────── */}
        <div className="shrink-0">
          <div className={cn("border-t border-border/60", collapsed ? "p-2" : "p-2.5")}>
            <UserMenu collapsed={collapsed} />
          </div>
        </div>
      </aside>

      {/* ── Main content ──────────────────────────────────────────────── */}
      <div className="flex flex-1 flex-col overflow-hidden print:overflow-visible">

        {/* ── Header ────────────────────────────────────────────────── */}
        <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center gap-3 border-b border-border/60 bg-card/95 px-3 backdrop-blur-sm md:px-5 print:hidden">

          {/* Sidebar toggle */}
          <Button
            variant="ghost"
            size="icon"
            className="hidden h-8 w-8 shrink-0 rounded-lg text-muted-foreground/70 transition-colors hover:bg-accent/70 hover:text-foreground md:inline-flex"
            onClick={toggle}
            aria-label="Toggle sidebar"
          >
            {collapsed ? (
              <PanelLeftOpen className="h-[1.1rem] w-[1.1rem]" />
            ) : (
              <PanelLeftClose className="h-[1.1rem] w-[1.1rem]" />
            )}
          </Button>

          {/* Mobile brand mark */}
          <div className="flex items-center gap-2 md:hidden">
            <BrandMark />
          </div>

          {/* ── Page title + breadcrumb (desktop) ─────────────────── */}
          <div className="hidden flex-col justify-center md:flex">
            <h1 className="text-[14px] font-semibold leading-none tracking-[-0.01em] text-foreground">
              {pageTitle}
            </h1>
            {breadcrumb.length > 1 && (
              <nav
                aria-label="Breadcrumb"
                className="mt-[3px] flex items-center gap-0.5"
              >
                {breadcrumb.map((seg, i) => (
                  <span key={i} className="flex items-center gap-0.5">
                    <span className="text-[10.5px] text-muted-foreground/50 leading-none">
                      {seg}
                    </span>
                    {i < breadcrumb.length - 1 && (
                      <ChevronRight className="h-2.5 w-2.5 shrink-0 text-muted-foreground/30" />
                    )}
                  </span>
                ))}
              </nav>
            )}
          </div>

          {/* ── Right side actions ────────────────────────────────── */}
          <div className="ml-auto flex items-center gap-1.5">

            {/* Notification bell */}
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  aria-label="Notifications"
                  onClick={() => navigate("/notifications")}
                  className="relative flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground/70 transition-all duration-150 hover:bg-accent/70 hover:text-foreground active:scale-95"
                >
                  <Bell className="h-[1.05rem] w-[1.05rem]" />
                  <span className="t-badge-dot absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-primary ring-1 ring-card" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="bottom" sideOffset={6}>Notifications</TooltipContent>
            </Tooltip>

            {/* Hairline separator */}
            <div className="h-4 w-px bg-border/70" aria-hidden="true" />

            {/* Animated 3-icon appearance toggle */}
            <AppearanceToggle />

            {/* Mobile user menu */}
            <div className="md:hidden">
              <UserMenu compact />
            </div>
          </div>
        </header>

        {/* ── Page content ──────────────────────────────────────────── */}
        <main className="flex-1 overflow-y-auto bg-muted/30 print:overflow-visible print:bg-white">
          <div className="mx-auto w-full p-4 md:p-8 print:p-0">
            <PageTransition key={transitionKeyFor(pathname)}>
              <Outlet />
            </PageTransition>
          </div>
        </main>
      </div>
    </div>
  );
}
