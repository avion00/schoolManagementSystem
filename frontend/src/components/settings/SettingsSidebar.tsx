import {
  School, CalendarDays, Users, ShieldCheck, Bell, CreditCard,
  CalendarCheck, ClipboardList, Palette, Lock, HardDrive, ScrollText,
  Building2, BookOpen,
} from "lucide-react";
import { cn } from "@/lib/utils";

export type SettingsPanel =
  | "school" | "academic" | "users" | "roles"
  | "notifications" | "fees" | "attendance" | "exams"
  | "appearance" | "security" | "backup" | "audit";

interface NavItem {
  id:    SettingsPanel;
  label: string;
  icon:  React.ElementType;
}
interface NavGroup {
  label: string;
  items: NavItem[];
}

const GROUPS: NavGroup[] = [
  {
    label: "General",
    items: [
      { id: "school",   label: "School Profile",   icon: School        },
      { id: "academic", label: "Academic Year",     icon: CalendarDays  },
    ],
  },
  {
    label: "Users & Access",
    items: [
      { id: "users",  label: "Admin Users",        icon: Users         },
      { id: "roles",  label: "Roles & Permissions",icon: ShieldCheck   },
      { id: "security",label:"Security",            icon: Lock          },
    ],
  },
  {
    label: "Academic Setup",
    items: [
      { id: "attendance", label: "Attendance",     icon: CalendarCheck },
      { id: "exams",      label: "Exam & Grading", icon: ClipboardList },
    ],
  },
  {
    label: "Finance",
    items: [
      { id: "fees", label: "Fee Settings",         icon: CreditCard    },
    ],
  },
  {
    label: "Communication",
    items: [
      { id: "notifications", label: "Notifications", icon: Bell        },
    ],
  },
  {
    label: "System",
    items: [
      { id: "appearance", label: "Appearance",      icon: Palette      },
      { id: "backup",     label: "Backup & Export", icon: HardDrive    },
      { id: "audit",      label: "Audit Logs",      icon: ScrollText   },
    ],
  },
];

// suppress unused — kept for future expansion
void Building2; void BookOpen;

interface Props {
  active:   SettingsPanel;
  onChange: (p: SettingsPanel) => void;
}

export function SettingsSidebar({ active, onChange }: Props) {
  return (
    <nav className="space-y-5">
      {GROUPS.map(({ label, items }) => (
        <div key={label}>
          <p className="mb-1.5 px-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">
            {label}
          </p>
          <ul className="space-y-0.5">
            {items.map(({ id, label: itemLabel, icon: Icon }) => {
              const isActive = active === id;
              return (
                <li key={id}>
                  <button
                    onClick={() => onChange(id)}
                    className={cn(
                      "flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-[13px] font-medium transition-colors text-left",
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground",
                    )}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    {itemLabel}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
}
