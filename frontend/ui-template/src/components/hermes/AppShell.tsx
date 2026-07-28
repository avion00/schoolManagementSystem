import { Link, useRouterState } from "@tanstack/react-router";
import {
  Activity, LayoutDashboard, FolderKanban, Compass, Radar, Sparkles,
  Clapperboard, CheckCircle2, CalendarDays, Radio, LineChart, Lightbulb,
  Plug, HardDrive, Settings, Pause, Play, ChevronDown, ChevronRight,
  LogOut, ListChecks, RotateCcw, Archive, UserCircle2, Shield,
} from "lucide-react";
import { useState, type ReactNode } from "react";
import { projects } from "@/lib/hermes-data";
import { useProject } from "./ProjectProvider";
import { useAuth } from "./AuthProvider";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
  DropdownMenuLabel, DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PROTOTYPE_MODE } from "@/lib/hermes-prototype";

type NavItem = { to: string; label: string; icon: any; exact?: boolean };
type NavGroup = { label: string; items: NavItem[] };

const adminGroups: NavGroup[] = [
  { label: "Workspace", items: [
    { to: "/", label: "Command Center", icon: LayoutDashboard, exact: true },
    { to: "/projects", label: "Projects", icon: FolderKanban },
    { to: "/opportunity", label: "Opportunity Research", icon: Compass },
  ]},
  { label: "Research", items: [
    { to: "/research", label: "Social Research", icon: Radar },
    { to: "/patterns", label: "Winning Patterns", icon: Sparkles },
  ]},
  { label: "Content", items: [
    { to: "/production", label: "Production", icon: Clapperboard },
    { to: "/approvals", label: "Approvals", icon: CheckCircle2 },
    { to: "/calendar", label: "Publishing Calendar", icon: CalendarDays },
  ]},
  { label: "Growth", items: [
    { to: "/engagement", label: "Engagement Radar", icon: Radio },
    { to: "/performance", label: "Performance", icon: LineChart },
    { to: "/cmo", label: "CMO Insights", icon: Lightbulb },
  ]},
  { label: "Administration", items: [
    { to: "/accounts", label: "Accounts & Platforms", icon: Plug },
    { to: "/system", label: "Storage & System Health", icon: HardDrive },
    { to: "/settings", label: "Settings", icon: Settings },
  ]},
];

const creatorGroups: NavGroup[] = [
  { label: "My workspace", items: [
    { to: "/my-work", label: "My Work", icon: LayoutDashboard, exact: true },
    { to: "/tasks", label: "Production Tasks", icon: ListChecks },
    { to: "/revisions", label: "Revision Requests", icon: RotateCcw },
    { to: "/completed", label: "Completed Work", icon: Archive },
  ]},
  { label: "Account", items: [
    { to: "/profile", label: "My Profile", icon: UserCircle2 },
  ]},
];

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { projectId, setProjectId, researchPaused, setResearchPaused } = useProject();
  const { user, logout, switchRole } = useAuth();
  const project = projects.find((p) => p.id === projectId)!;
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  const isCreator = user?.role === "creator";
  const navGroups = isCreator ? creatorGroups : adminGroups;

  return (
    <div className="flex min-h-screen bg-background">
      <aside className="hidden md:flex w-64 shrink-0 flex-col gradient-navy text-sidebar-foreground sticky top-0 h-screen">
        <div className="px-5 pt-6 pb-5 border-b border-sidebar-border/60">
          <div className="flex items-center gap-2">
            <div className="grid h-9 w-9 place-items-center rounded-lg gradient-ember">
              <Activity className="h-5 w-5 text-navy" strokeWidth={2.5} />
            </div>
            <div>
              <div className="font-display font-bold text-lg leading-none">Hermes</div>
              <div className="text-[11px] text-sidebar-foreground/60 mt-1">
                {isCreator ? "Creator workspace" : "Organic Growth Intelligence"}
              </div>
            </div>
          </div>
        </div>
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-4">
          {navGroups.map((group) => {
            const isCollapsed = collapsed[group.label];
            const hasActive = group.items.some((n) => n.exact ? pathname === n.to : pathname.startsWith(n.to) && n.to !== "/");
            return (
              <div key={group.label}>
                <button
                  onClick={() => setCollapsed((c) => ({ ...c, [group.label]: !c[group.label] }))}
                  className="w-full flex items-center justify-between px-3 mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-sidebar-foreground/45 hover:text-sidebar-foreground/70"
                >
                  <span>{group.label}</span>
                  <ChevronRight className={`h-3 w-3 transition-transform ${isCollapsed ? "" : "rotate-90"}`} />
                </button>
                {!isCollapsed && (
                  <div className="space-y-0.5">
                    {group.items.map((n) => {
                      const active = n.exact ? pathname === n.to : pathname.startsWith(n.to);
                      const Icon = n.icon;
                      return (
                        <Link
                          key={n.to}
                          to={n.to}
                          className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors relative ${
                            active
                              ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                              : "text-sidebar-foreground/75 hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground"
                          }`}
                        >
                          {active && <span className="absolute left-0 top-1.5 bottom-1.5 w-0.5 rounded-r bg-ember" />}
                          <Icon className="h-4 w-4 shrink-0" />
                          <span className="truncate">{n.label}</span>
                        </Link>
                      );
                    })}
                  </div>
                )}
                {isCollapsed && hasActive && <div className="h-0.5 mx-3 rounded bg-ember/60" />}
              </div>
            );
          })}
        </nav>
        <div className="px-3 py-3 border-t border-sidebar-border/60">
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 rounded-md px-3 py-2 text-sm text-sidebar-foreground/75 hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground"
          >
            <LogOut className="h-4 w-4" /> Sign out
          </button>
          <div className="px-3 pt-2 text-[11px] text-sidebar-foreground/50">
            Prototype build · v0.6
          </div>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 shrink-0 border-b bg-card/95 backdrop-blur px-4 md:px-8 flex items-center gap-3 sticky top-0 z-30">
          {!isCreator && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="gap-2 h-10">
                  <span className="h-2 w-2 rounded-full" style={{ backgroundColor: project.color }} />
                  <span className="font-medium">{project.name}</span>
                  <ChevronDown className="h-4 w-4 opacity-60" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-72">
                <DropdownMenuLabel>Switch project</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {projects.map((p) => (
                  <DropdownMenuItem key={p.id} onClick={() => setProjectId(p.id)} className="py-2">
                    <div className="flex items-start gap-2">
                      <span className="h-2 w-2 mt-1.5 rounded-full shrink-0" style={{ backgroundColor: p.color }} />
                      <div className="min-w-0">
                        <div className="font-medium">{p.name}</div>
                        <div className="text-xs text-muted-foreground truncate">{p.tagline}</div>
                      </div>
                    </div>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          {isCreator && (
            <Badge variant="outline" className="gap-1.5 h-9 px-2.5">
              <Clapperboard className="h-3.5 w-3.5 text-ember" /> Creator workspace
            </Badge>
          )}

          <div className="hidden lg:block text-sm text-muted-foreground truncate">
            {isCreator ? `Signed in as ${user?.name}` : project.tagline}
          </div>

          <div className="ml-auto flex items-center gap-2">
            {/* Prototype role switcher — hidden outside prototype mode */}
            {PROTOTYPE_MODE && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="gap-1.5 h-8 text-xs">
                    <Shield className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">Prototype:</span> View as {isCreator ? "Creator" : "Admin"}
                    <ChevronDown className="h-3 w-3 opacity-60" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel className="text-[10px]">Prototype role switch (demo only)</DropdownMenuLabel>
                  <DropdownMenuItem onClick={() => switchRole("admin")}>Administrator</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => switchRole("creator")}>Creator</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            {!isCreator && (
              <>
                <Badge variant="outline" className="hidden sm:inline-flex gap-1.5 h-8 px-2.5">
                  <span className={`h-1.5 w-1.5 rounded-full ${researchPaused ? "bg-amber" : "bg-mint animate-pulse"}`} />
                  {researchPaused ? "Research paused" : "Research active"}
                </Badge>
                <Button
                  variant={researchPaused ? "default" : "outline"}
                  onClick={() => setResearchPaused(!researchPaused)}
                  className="gap-2"
                  size="sm"
                >
                  {researchPaused ? <><Play className="h-4 w-4" /> Resume</> : <><Pause className="h-4 w-4" /> Pause Research</>}
                </Button>
              </>
            )}

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="grid h-9 w-9 place-items-center rounded-full bg-secondary hover:bg-secondary/70 text-xs font-semibold">
                  {user?.avatarInitials ?? "??"}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div className="font-medium">{user?.name}</div>
                  <div className="text-xs text-muted-foreground font-normal">{user?.email}</div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to={isCreator ? "/profile" : "/settings"}>Account</Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={logout} className="text-rose focus:text-rose">
                  <LogOut className="h-4 w-4 mr-2" /> Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        <main className="flex-1 min-w-0 px-4 md:px-8 py-6 md:py-8 max-w-[1600px] w-full">
          {children}
        </main>
      </div>
    </div>
  );
}

export function PageHeader({ title, subtitle, actions }: { title: string; subtitle?: string; actions?: ReactNode }) {
  return (
    <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-4 mb-6 md:mb-8">
      <div className="min-w-0">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2 shrink-0 justify-end">{actions}</div>}
    </div>
  );
}
