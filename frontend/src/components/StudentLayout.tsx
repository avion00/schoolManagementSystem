import {
  CalendarCheck,
  LayoutDashboard,
  ReceiptText,
  ScrollText,
  UserRound,
} from "lucide-react";

import { Shell, type NavGroup } from "@/components/Shell";

const NAV: NavGroup[] = [
  {
    label: "Overview",
    items: [{ to: "/dashboard", label: "Dashboard", icon: LayoutDashboard }],
  },
  {
    label: "My School",
    items: [
      { to: "/profile", label: "My Profile", icon: UserRound },
      { to: "/attendance", label: "Attendance", icon: CalendarCheck },
      { to: "/results", label: "Results", icon: ScrollText },
      { to: "/fees", label: "Fees", icon: ReceiptText },
    ],
  },
];

export function StudentLayout() {
  return <Shell nav={NAV} brand="Student Portal" />;
}
