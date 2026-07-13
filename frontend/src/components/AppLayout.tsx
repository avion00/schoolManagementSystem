import { Shell } from "@/components/Shell";
import { superAdminSidebar } from "@/config/sidebarConfig";

export function AppLayout() {
  return <Shell nav={superAdminSidebar} brand="SchoolOS" />;
}
