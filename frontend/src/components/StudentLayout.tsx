import { Shell } from "@/components/Shell";
import { studentSidebar } from "@/config/sidebarConfig";

export function StudentLayout() {
  return <Shell nav={studentSidebar} brand="Student Portal" />;
}
